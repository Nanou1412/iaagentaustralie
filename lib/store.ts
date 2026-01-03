// Demo Store - Zustand state management

import { create } from "zustand";
import { ChatMessage, AIEvent } from "@/types/ai";
import { DashboardEntry, SMSEntry } from "@/types/events";
import { generateId } from "@/lib/validation";

interface DemoState {
  // Chat
  messages: ChatMessage[];
  isLoading: boolean;
  
  // Events
  lastEvent: AIEvent | null;
  dashboardEntries: DashboardEntry[];
  smsHistory: SMSEntry[];
  
  // Actions
  addMessage: (role: "user" | "assistant", content: string, event?: AIEvent) => void;
  setLoading: (loading: boolean) => void;
  processEvent: (event: AIEvent) => void;
  reset: () => void;
  replayPerfectScenario: () => void;
}

const initialState = {
  messages: [],
  isLoading: false,
  lastEvent: null,
  dashboardEntries: [],
  smsHistory: [],
};

export const useDemoStore = create<DemoState>((set, get) => ({
  ...initialState,

  addMessage: (role, content, event) => {
    const message: ChatMessage = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
      event,
    };

    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  processEvent: (event) => {
    const type: DashboardEntry["type"] =
      event.action === "RESERVATION_CONFIRMED" || event.action === "ORDER_PLACED"
        ? "new"
        : event.action === "RESERVATION_MODIFIED"
        ? "modified"
        : event.action === "RESERVATION_CANCELED"
        ? "canceled"
        : "new";

    const dashboardEntry: DashboardEntry = {
      id: generateId(),
      timestamp: new Date(),
      event,
      type,
    };

    const smsEntry: SMSEntry = {
      id: generateId(),
      timestamp: new Date(),
      to: event.phone,
      message: event.smsText,
    };

    set((state) => ({
      lastEvent: event,
      dashboardEntries: [...state.dashboardEntries, dashboardEntry],
      smsHistory: [...state.smsHistory, smsEntry],
    }));
  },

  reset: () => {
    set(initialState);
  },

  replayPerfectScenario: () => {
    const { reset, addMessage, processEvent } = get();
    reset();

    // Simulate a perfect booking scenario with Emma
    setTimeout(() => {
      addMessage(
        "user",
        "Hey, I was hoping to book a table for tonight? There'd be 4 of us, around 7pm if you've got space. Name's Sarah, and you can reach me on 0412 345 678."
      );

      setTimeout(() => {
        const perfectEvent: AIEvent = {
          action: "RESERVATION_CONFIRMED",
          customerName: "Sarah",
          phone: "0412 345 678",
          time: "7:00 PM tonight",
          partySize: 4,
          notes: null,
          orderItems: null,
          smsText:
            "Hey Sarah! 🍽️ You're all set for tonight at 7pm — table for 4 at The Golden Fork. Can't wait to see you! Text back if anything changes. - Emma",
          dashboardText: "Table for 4 at 7:00 PM - Sarah",
        };

        addMessage(
          "assistant",
          "Oh lovely! Tonight at 7, table for 4 — let me just pop that in for you, Sarah. And I've got your number ending in 678, perfect! Alright, you're all booked in. I'll send you a quick text to confirm. Looking forward to seeing you tonight!",
          perfectEvent
        );

        processEvent(perfectEvent);
      }, 1500);
    }, 500);
  },
}));
