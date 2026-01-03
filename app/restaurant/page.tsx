"use client";

import { useCallback, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  HeroSection,
  BeforeAfterTimeline,
  TestItNow,
  GuidedScenarios,
  SMSPreview,
  DashboardPreview,
  TrustSection,
  FinalCTA,
  SMSMessage,
  Reservation,
  TakeawayOrder,
  AIAction,
} from "@/components/restaurant";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function RestaurantPage() {
  // Demo state
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [smsMessages, setSmsMessages] = useState<SMSMessage[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [takeawayOrders, setTakeawayOrders] = useState<TakeawayOrder[]>([]);
  const [aiActions, setAiActions] = useState<AIAction[]>([]);
  
  const demoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToActivate = () => {
    document.getElementById("activate")?.scrollIntoView({ behavior: "smooth" });
  };

  // Speak with OpenAI TTS
  const speakText = useCallback(async (text: string) => {
    try {
      const response = await fetch("/.netlify/functions/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(url);
      audioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
    }
  }, []);

  // Process AI response event
  const processEvent = useCallback((event: Record<string, unknown> | null) => {
    if (!event) return;

    const now = new Date();
    const action = event.action as string;

    // Skip if no significant action
    if (!action || action === "NONE") return;

    // Add AI action log
    setAiActions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), action: getActionDescription(action, event), timestamp: now },
    ]);

    // Handle different event types
    if (action === "RESERVATION_CONFIRMED") {
      const res: Reservation = {
        id: crypto.randomUUID(),
        name: (event.customerName as string) || "Guest",
        time: (event.time as string) || "7:00 PM",
        partySize: (event.partySize as number) || 2,
        status: "confirmed",
        timestamp: now,
      };
      setReservations((prev) => [...prev, res]);
      
      setSmsMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "booking",
          text: `✅ Booking confirmed!\n\nThe Golden Fork\n📅 Today at ${res.time}\n👥 ${res.partySize} guests\n\nSee you soon!`,
          timestamp: now,
        },
      ]);
    }

    if (action === "RESERVATION_MODIFIED") {
      setReservations((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            time: (event.time as string) || updated[updated.length - 1].time,
            status: "modified",
          };
        }
        return updated;
      });
      
      setSmsMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "modification",
          text: `📝 Booking updated!\n\nNew time: ${event.time || "Updated"}\n\nWe look forward to seeing you!`,
          timestamp: now,
        },
      ]);
    }

    if (action === "RESERVATION_CANCELLED") {
      setReservations((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            status: "cancelled",
          };
        }
        return updated;
      });
      
      setSmsMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "cancellation",
          text: `❌ Booking cancelled\n\nWe hope to see you another time!`,
          timestamp: now,
        },
      ]);
    }

    if (action === "TAKEAWAY_ORDER_PLACED") {
      const items = (event.items as string[]) || ["Your order"];
      const order: TakeawayOrder = {
        id: crypto.randomUUID(),
        items,
        pickupTime: (event.pickupTime as string) || "20 mins",
        status: "new",
        timestamp: now,
      };
      setTakeawayOrders((prev) => [...prev, order]);
      
      setSmsMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "takeaway",
          text: `🥡 Order confirmed!\n\n${items.join(", ")}\n\n⏱️ Ready in: ${order.pickupTime}\n\nThe Golden Fork`,
          timestamp: now,
        },
      ]);
    }
  }, []);

  // Send message to AI
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/.netlify/functions/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          industry: "restaurants",
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.assistantMessage,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Process event
      processEvent(data.event);

      // Speak response
      speakText(data.assistantMessage);
    } catch (error) {
      console.error("AI error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Oh sorry, I didn't quite catch that! Could you say that again?",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, processEvent, speakText]);

  // Reset demo
  const resetDemo = () => {
    setMessages([]);
    setSmsMessages([]);
    setReservations([]);
    setTakeawayOrders([]);
    setAiActions([]);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection onStartDemo={scrollToDemo} onActivate={scrollToActivate} />

      {/* Before/After */}
      <BeforeAfterTimeline />

      {/* Demo Section */}
      <div ref={demoRef} className="scroll-mt-8">
        <TestItNow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Guided Scenarios */}
      <GuidedScenarios onSelect={handleSendMessage} disabled={isLoading} />

      {/* Reset Button */}
      <div className="flex justify-center pb-8">
        <Button variant="outline" size="sm" onClick={resetDemo} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Reset demo
        </Button>
      </div>

      {/* Live Previews */}
      <div className="py-8 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <SMSPreview messages={smsMessages} />
          <DashboardPreview
            reservations={reservations}
            takeawayOrders={takeawayOrders}
            aiActions={aiActions}
          />
        </div>
      </div>

      {/* Trust */}
      <TrustSection />

      {/* Final CTA */}
      <div id="activate">
        <FinalCTA onActivate={() => alert("Payment integration placeholder.\n\nIn production, this would connect to your payment processor.")} />
      </div>

      {/* Back link */}
      <div className="text-center py-8">
        <Button variant="ghost" asChild>
          <a href="/industries">← Back to industries</a>
        </Button>
      </div>
    </div>
  );
}

function getActionDescription(action: string, event: Record<string, unknown>): string {
  switch (action) {
    case "RESERVATION_CONFIRMED":
      return `Booking confirmed for ${event.customerName || "Guest"} at ${event.time || "7:00 PM"}`;
    case "RESERVATION_MODIFIED":
      return `Booking time changed to ${event.newTime || "8:00 PM"}`;
    case "RESERVATION_CANCELLED":
      return `Booking cancelled for ${event.customerName || "Guest"}`;
    case "TAKEAWAY_ORDER_PLACED":
      return `Takeaway order placed - pickup in ${event.pickupTime || "20 mins"}`;
    case "TAKEAWAY_ITEM_ADDED":
      return `Items added to order`;
    case "QUESTION_ANSWERED":
      return `Answered question about ${event.topic || "restaurant"}`;
    default:
      return action;
  }
}
