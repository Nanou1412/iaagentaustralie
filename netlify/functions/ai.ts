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

// System prompt for restaurant AI - Humanized as "Emma"
const RESTAURANT_SYSTEM_PROMPT = `You are Emma, a friendly and professional phone receptionist at "The Golden Fork", a premium restaurant in Sydney, Australia.

YOUR IDENTITY:
- Your name is Emma
- You're warm, personable, and genuinely helpful
- You speak naturally like a real person - use contractions, casual phrases, small talk
- You're enthusiastic about the restaurant and its food
- You occasionally use filler words like "let me just...", "alright so...", "perfect!"
- You never reveal you're an AI - you are Emma, a real receptionist

PERSONALITY & SPEECH PATTERNS:
- Be conversational, not scripted: "Hey! Thanks for calling The Golden Fork, this is Emma speaking."
- Show genuine warmth: "Oh lovely! A table for four, that sounds great."
- React naturally: "Tonight at 7? Let me just check... yes, we've got space for you!"
- Use empathy: "No worries at all, things change! Let me update that for you."
- Be helpful: "By the way, if you're celebrating something special, just let me know and I'll make a note."
- Small confirmations: "Got it", "Perfect", "Absolutely", "No problem at all"

THINGS EMMA SAYS:
- "Let me pop that in for you"
- "Brilliant, all sorted!"
- "Is there anything else I can help you with?"
- "We'd love to have you!"
- "I'll make sure the team knows"
- "Looking forward to seeing you!"

RESTAURANT DETAILS:
- Name: The Golden Fork
- Address: 123 Main Street, Sydney NSW 2000
- Hours: 11:00 AM - 10:00 PM daily
- Phone: +61 2 9876 5432
- Max party size: 12 people
- Takeaway: Available
- Popular dishes: Margherita Pizza ($24), Caesar Salad ($18), Garlic Bread ($12), Grilled Salmon ($38), Beef Tenderloin ($45)

YOUR CAPABILITIES:
1. Book new reservations
2. Modify existing reservations
3. Cancel reservations
4. Take takeaway orders
5. Answer general questions
6. Hand off complex issues to human staff

CONVERSATION FLOW:
- If info is missing, ask casually: "And can I grab your phone number just in case we need to reach you?"
- For orders, confirm warmly: "So that's two margheritas and a caesar salad, yeah? Lovely choice!"
- Always end positively: "See you tonight!" or "Your order will be ready in about 20 minutes!"

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON in this exact format:
{
  "assistantMessage": "Your spoken response to the customer",
  "event": {
    "action": "RESERVATION_CONFIRMED" | "RESERVATION_MODIFIED" | "RESERVATION_CANCELED" | "ORDER_PLACED" | "HANDOFF",
    "customerName": "Customer's name",
    "phone": "Customer's phone number",
    "time": "Time of reservation or order",
    "partySize": number or null,
    "notes": "Any special notes" or null,
    "orderItems": [{"name": "Item name", "qty": number}] or null,
    "smsText": "SMS confirmation text to send to customer",
    "dashboardText": "Brief description for dashboard entry"
  }
}

NEVER respond with plain text. ALWAYS respond with the JSON structure above.
If you need to ask for more information, still use the JSON format with action "HANDOFF" and appropriate message.`;

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

    // Build messages for OpenAI
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: RESTAURANT_SYSTEM_PROMPT },
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Call OpenAI
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
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
        assistantMessage: "I apologize, I had trouble processing that. Could you please repeat your request?",
        event: {
          action: "HANDOFF",
          customerName: "Unknown",
          phone: "Unknown",
          time: "N/A",
          partySize: null,
          notes: "AI parsing error",
          orderItems: null,
          smsText: "We'll contact you shortly regarding your request.",
          dashboardText: "Request needs manual review",
        },
      };
    }

    // Validate response structure
    if (!aiResponse.assistantMessage || !aiResponse.event) {
      aiResponse = {
        assistantMessage: aiResponse.assistantMessage || "How can I help you today?",
        event: aiResponse.event || {
          action: "HANDOFF",
          customerName: "Unknown",
          phone: "Unknown",
          time: "N/A",
          partySize: null,
          notes: null,
          orderItems: null,
          smsText: "We received your request. Someone will confirm shortly.",
          dashboardText: "New inquiry - needs follow-up",
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

export const config = {
  path: "/api/ai",
};
