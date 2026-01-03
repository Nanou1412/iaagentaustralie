// AI Client - Frontend API calls

import { AIRequestPayload, AIResponse } from "@/types/ai";

const API_ENDPOINT = "/api/ai";

export async function sendMessage(
  payload: AIRequestPayload
): Promise<AIResponse> {
  const response = await fetch(API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export function formatConversationHistory(
  messages: Array<{ role: "user" | "assistant"; content: string }>
) {
  return messages.slice(-10).map((m) => ({
    role: m.role,
    content: m.content,
  }));
}
