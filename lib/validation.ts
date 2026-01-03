// Validation Utilities

import { z } from "zod";

export const AIRequestSchema = z.object({
  message: z.string().min(1).max(500),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(10),
  industry: z.string().min(1),
});

export const AIEventSchema = z.object({
  action: z.enum([
    "RESERVATION_CONFIRMED",
    "RESERVATION_MODIFIED",
    "RESERVATION_CANCELED",
    "ORDER_PLACED",
    "HANDOFF",
  ]),
  customerName: z.string(),
  phone: z.string(),
  time: z.string(),
  partySize: z.number().nullable(),
  notes: z.string().nullable(),
  orderItems: z
    .array(
      z.object({
        name: z.string(),
        qty: z.number(),
      })
    )
    .nullable(),
  smsText: z.string(),
  dashboardText: z.string(),
});

export const AIResponseSchema = z.object({
  assistantMessage: z.string(),
  event: AIEventSchema,
});

export function validateAIRequest(data: unknown) {
  return AIRequestSchema.safeParse(data);
}

export function validateAIResponse(data: unknown) {
  return AIResponseSchema.safeParse(data);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
