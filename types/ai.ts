// AI Response Types

export type AIAction =
  | "RESERVATION_CONFIRMED"
  | "RESERVATION_MODIFIED"
  | "RESERVATION_CANCELED"
  | "ORDER_PLACED"
  | "HANDOFF";

export interface OrderItem {
  name: string;
  qty: number;
}

export interface AIEvent {
  action: AIAction;
  customerName: string;
  phone: string;
  time: string;
  partySize: number | null;
  notes: string | null;
  orderItems: OrderItem[] | null;
  smsText: string;
  dashboardText: string;
}

export interface AIResponse {
  assistantMessage: string;
  event: AIEvent;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  event?: AIEvent;
}

export interface AIRequestPayload {
  message: string;
  conversationHistory: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  industry: string;
}
