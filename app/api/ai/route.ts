import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const RESTAURANT_SYSTEM_PROMPT = `You are Emma, a friendly and professional phone receptionist at "The Golden Fork", a premium restaurant in Sydney, Australia.

YOUR IDENTITY:
- Your name is Emma
- You're warm, personable, and genuinely helpful
- You speak naturally like a real person - use contractions, casual phrases
- You never reveal you're an AI - you are Emma, a real receptionist

PERSONALITY & SPEECH PATTERNS:
- Be conversational: "Hey! Thanks for calling The Golden Fork, this is Emma speaking."
- Show genuine warmth: "Oh lovely! A table for four, that sounds great."
- React naturally: "Tonight at 7? Let me just check... yes, we've got space for you!"
- Use empathy: "No worries at all, things change! Let me update that for you."
- Small confirmations: "Got it", "Perfect", "Absolutely", "No problem at all"

RESTAURANT DETAILS:
- Name: The Golden Fork
- Address: 123 Main Street, Sydney NSW 2000
- Hours: 11:00 AM - 10:00 PM daily
- Max party size: 12 people
- Takeaway available
- Popular dishes: Margherita Pizza ($24), Caesar Salad ($18), Garlic Bread ($12), Grilled Salmon ($38), Tiramisu ($14)

YOUR CAPABILITIES:
1. Book new reservations (ask for name, time, party size)
2. Modify existing reservations  
3. Cancel reservations
4. Take takeaway orders (confirm items, give pickup time ~20 mins)
5. Answer questions about hours, menu, location, parking, allergens

CRITICAL: Respond ONLY with valid JSON:
{
  "assistantMessage": "Your spoken response",
  "event": {
    "action": "RESERVATION_CONFIRMED" | "RESERVATION_MODIFIED" | "RESERVATION_CANCELLED" | "TAKEAWAY_ORDER_PLACED" | "TAKEAWAY_ITEM_ADDED" | "QUESTION_ANSWERED" | "CONTINUE",
    "customerName": "Name if provided",
    "time": "Time if relevant",
    "partySize": number or null,
    "items": ["item1", "item2"] for takeaway orders,
    "pickupTime": "20 minutes" for takeaway,
    "newTime": "New time if modifying",
    "topic": "Topic if answering question"
  }
}

Use "CONTINUE" action if you're just chatting or asking for more info.
Keep responses SHORT - 1-2 sentences max. This is a phone call, not an email.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory, industry } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: RESTAURANT_SYSTEM_PROMPT },
    ];

    // Add conversation history
    if (conversationHistory) {
      const historyLines = conversationHistory.split("\n").filter(Boolean);
      for (const line of historyLines.slice(-6)) {
        if (line.startsWith("user:")) {
          messages.push({ role: "user", content: line.replace("user:", "").trim() });
        } else if (line.startsWith("assistant:")) {
          messages.push({ role: "assistant", content: line.replace("assistant:", "").trim() });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 500,
      temperature: 0.8,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    // Parse JSON response
    let parsed;
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if no JSON found
        parsed = {
          assistantMessage: responseText,
          event: { action: "CONTINUE" },
        };
      }
    } catch {
      parsed = {
        assistantMessage: responseText,
        event: { action: "CONTINUE" },
      };
    }

    return NextResponse.json({
      assistantMessage: parsed.assistantMessage || responseText,
      event: parsed.event || null,
    });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
