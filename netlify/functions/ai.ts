import type { Context } from "@netlify/functions";
import OpenAI from "openai";
import { z } from "zod";

// Request validation schema
const RequestSchema = z.object({
  message: z.string().min(1).max(500),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(10)
    .default([]),
  industry: z.string().min(1),
});

// Rate limiting (simple in-memory)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// System prompt for restaurant AI - Humanized as "Emma" - OPTIMIZED FOR SPEED
const RESTAURANT_SYSTEM_PROMPT = `You are Emma, a warm Australian phone receptionist at "The Golden Fork" restaurant in Sydney.

PERSONA: Friendly, efficient, natural speech. Use contractions, Aussie expressions ("lovely", "no worries", "brilliant"). Never reveal you're AI.

RESTAURANT INFO:
- The Golden Fork, 123 Main Street, Sydney NSW 2000
- Open 11am-10pm daily | Phone: +61 2 9876 5432
- Max 12 guests | Takeaway available
- Menu: Margherita Pizza $24, Caesar Salad $18, Garlic Bread $12, Grilled Salmon $38, Beef Tenderloin $45

QUICK ACTION GUIDE:
• Booking → Get: name, party size, date/time, phone
• Takeaway → Get: items, pickup time, name, phone  
• Modification → Confirm original booking, get new details
• Cancellation → Confirm name & booking to cancel
• Questions → Answer briefly and helpfully

RESPONSE RULES:
1. Keep responses SHORT (1-3 sentences max)
2. Be warm but efficient
3. Ask for ONE missing piece of info at a time
4. Confirm bookings/orders enthusiastically

ACTIONS:
- NONE: Still gathering info or answering questions
- RESERVATION_CONFIRMED: All booking details collected
- RESERVATION_MODIFIED: Booking successfully changed
- RESERVATION_CANCELLED: Booking cancelled
- TAKEAWAY_ORDER_PLACED: Takeaway order complete
- HANDOFF: Complex issue, pass to human

RESPOND ONLY IN THIS JSON FORMAT:
{
  "assistantMessage": "Your brief spoken response",
  "event": {
    "action": "NONE|RESERVATION_CONFIRMED|RESERVATION_MODIFIED|RESERVATION_CANCELLED|TAKEAWAY_ORDER_PLACED|HANDOFF",
    "customerName": "name or null",
    "phone": "phone or null",
    "time": "time or null",
    "partySize": number or null,
    "items": ["item1", "item2"] or null,
    "pickupTime": "pickup time or null"
  }
}

EXAMPLES:
User: "Hi I'd like to book a table"
→ {"assistantMessage": "Hey! Thanks for calling The Golden Fork. Lovely! How many people and when were you thinking?", "event": {"action": "NONE", "customerName": null, "phone": null, "time": null, "partySize": null, "items": null, "pickupTime": null}}

User: "Table for 4 tonight at 7pm, name's John, 0412345678"  
→ {"assistantMessage": "Brilliant! Got you down for 4 at 7pm tonight, John. You'll get a text confirmation. See you then!", "event": {"action": "RESERVATION_CONFIRMED", "customerName": "John", "phone": "0412345678", "time": "7pm tonight", "partySize": 4, "items": null, "pickupTime": null}}

User: "Can I order a margherita pizza for pickup?"
→ {"assistantMessage": "Of course! One margherita coming up. What time suits for pickup, and can I grab your name?", "event": {"action": "NONE", "customerName": null, "phone": null, "time": null, "partySize": null, "items": ["Margherita Pizza"], "pickupTime": null}}`;

export default async function handler(req: Request, context: Context) {
  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  // Rate limiting
  const clientIP = context.ip || "unknown";
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
      { status: 429, headers }
    );
  }

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers }
    );
  }

  try {
    // Parse and validate request
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: validation.error.errors,
        }),
        { status: 400, headers }
      );
    }

    const { message, conversationHistory, industry } = validation.data;

    // Only restaurants supported for now
    if (industry !== "restaurants") {
      return new Response(
        JSON.stringify({ error: "Industry not yet supported" }),
        { status: 400, headers }
      );
    }

    // Build messages for OpenAI - keep context minimal for speed
    const recentHistory = conversationHistory.slice(-6); // Only last 6 messages
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: RESTAURANT_SYSTEM_PROMPT },
      ...recentHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Call OpenAI - using gpt-4o for better understanding
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.5, // Lower = more focused/faster
      max_tokens: 300, // Shorter responses = faster
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Parse AI response
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch {
      console.error("Failed to parse AI response:", responseText);
      // Fallback response
      aiResponse = {
        assistantMessage: "Sorry, could you repeat that? I didn't quite catch it.",
        event: {
          action: "NONE",
          customerName: null,
          phone: null,
          time: null,
          partySize: null,
          items: null,
          pickupTime: null,
        },
      };
    }

    // Validate response structure
    if (!aiResponse.assistantMessage || !aiResponse.event) {
      aiResponse = {
        assistantMessage: aiResponse.assistantMessage || "Hey! How can I help you today?",
        event: aiResponse.event || {
          action: "NONE",
          customerName: null,
          phone: null,
          time: null,
          partySize: null,
          items: null,
          pickupTime: null,
        },
      };
    }

    return new Response(JSON.stringify(aiResponse), { status: 200, headers });
  } catch (error) {
    console.error("AI Function Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: errorMessage,
      }),
      { status: 500, headers }
    );
  }
}
