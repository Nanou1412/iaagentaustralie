"use client";

import { useCallback, useRef, useState, useEffect } from "react";
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
  RestaurantDataPreview,
} from "@/components/restaurant";

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;
const FETCH_TIMEOUT = 15000; // 15 seconds

// Fetch with timeout helper
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries: number = MAX_RETRIES
): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetchWithTimeout(url, options, FETCH_TIMEOUT);
      if (response.ok || response.status < 500) return response;
      throw new Error(`Server error: ${response.status}`);
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(r => setTimeout(r, RETRY_DELAY * (i + 1)));
    }
  }
  throw new Error("Max retries reached");
}

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
  
  // Audio state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const demoRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount - prevents memory leaks
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Cleanup audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.onplay = null;
      }
      
      // Cleanup URL to prevent memory leaks
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const scrollToActivate = () => {
    document.getElementById("activate")?.scrollIntoView({ behavior: "smooth" });
  };

  // Audio queue to prevent overlapping
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  // Stop current audio playback completely
  const stopSpeaking = useCallback(() => {
    // Clear the queue
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.onplay = null;
      audioRef.current = null;
    }
    
    // Cleanup URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    
    setIsSpeaking(false);
    setIsLoadingAudio(false);
  }, []);

  // Speak with OpenAI TTS - FIXED to not interrupt, uses queue
  const speakText = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    // CRITICAL: Stop any current audio BEFORE starting new one
    // This prevents Emma from "cutting herself off"
    stopSpeaking();
    
    // Small delay to ensure audio cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 50));
    
    if (!isMountedRef.current) return;
    
    setIsLoadingAudio(true);
    setError(null);
    isPlayingRef.current = true;
    
    try {
      const response = await fetchWithRetry("/.netlify/functions/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }
      
      if (!isMountedRef.current || !isPlayingRef.current) return;

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Double-check we should still play
      if (!isMountedRef.current || !isPlayingRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      
      audioUrlRef.current = url;
      
      const audio = new Audio(url);
      audioRef.current = audio;
      
      audio.onplay = () => {
        if (isMountedRef.current) {
          setIsLoadingAudio(false);
          setIsSpeaking(true);
        }
      };
      
      audio.onended = () => {
        if (isMountedRef.current) {
          setIsSpeaking(false);
          isPlayingRef.current = false;
        }
      };
      
      audio.onerror = () => {
        if (isMountedRef.current) {
          setIsSpeaking(false);
          setIsLoadingAudio(false);
          isPlayingRef.current = false;
        }
      };
      
      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      if (isMountedRef.current) {
        setIsLoadingAudio(false);
        setIsSpeaking(false);
        isPlayingRef.current = false;
      }
    }
  }, [stopSpeaking]);

  // Emma's greeting message
  const EMMA_GREETING = "Hey! Thanks for calling The Golden Fork, this is Emma speaking. How can I help you today? I can help you book a table, order some takeaway, or answer any questions about our menu!";

  // Auto-greet when demo is started (when scrolled to demo)
  const startDemo = useCallback(() => {
    if (hasGreeted) return;
    
    setHasGreeted(true);
    
    // Add Emma's greeting message
    const greetingMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: EMMA_GREETING,
    };
    setMessages([greetingMessage]);
    
    // Speak the greeting
    speakText(EMMA_GREETING);
    
    // Log action
    setAiActions([{
      id: crypto.randomUUID(),
      action: "Call answered - Emma greeting",
      timestamp: new Date(),
    }]);
  }, [hasGreeted, speakText]);

  // Scroll to demo and start greeting
  const scrollToDemo = useCallback(() => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
    // Start the demo with greeting after a short delay
    setTimeout(() => {
      startDemo();
    }, 500);
  }, [startDemo]);

  // Process AI response event
  const processEvent = useCallback((event: Record<string, unknown> | null) => {
    if (!event) return;

    const now = new Date();
    const action = event.action as string;

    // Skip if no significant action (NONE = still gathering info, WAITING = side conversation)
    if (!action || action === "NONE" || action === "WAITING") return;

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

  // Send message to AI - improved with retry, timeout, and better error handling
  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchWithRetry("/.netlify/functions/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
          industry: "restaurants",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      // Only add message if Emma actually responds (not silent during side conversations)
      if (data.assistantMessage && data.assistantMessage.trim()) {
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.assistantMessage,
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Speak response only if there's something to say
        speakText(data.assistantMessage);
      }

      // Process event
      processEvent(data.event);
    } catch (err) {
      console.error("AI error:", err);
      
      // Determine error type for appropriate message
      let errorContent = "Oh sorry, I didn't quite catch that! Could you say that again?";
      
      if (err instanceof Error) {
        if (err.name === "AbortError" || err.message.includes("timeout")) {
          errorContent = "Sorry, that took a bit too long! Let me try again - what were you saying?";
          setError("Connection timeout - please try again");
        } else if (err.message.includes("network") || err.message.includes("fetch")) {
          errorContent = "Hmm, seems like we have a connection issue. Give me a sec and try again?";
          setError("Network error - check your connection");
        } else if (err.message.includes("Rate limit")) {
          errorContent = "Whoa, lots of questions! Give me just a moment to catch up.";
          setError("Too many requests - please wait a moment");
        }
      }
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorContent,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, processEvent, speakText]);

  // Reset demo - cleanup everything including audio
  const resetDemo = useCallback(() => {
    setMessages([]);
    setSmsMessages([]);
    setReservations([]);
    setTakeawayOrders([]);
    setAiActions([]);
    setError(null);
    setIsSpeaking(false);
    setIsLoadingAudio(false);
    setHasGreeted(false); // Allow greeting again
    
    // Cleanup audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Cleanup URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection onStartDemo={scrollToDemo} onActivate={scrollToActivate} />

      {/* Emma's Database - Calendar & Menu */}
      <RestaurantDataPreview />

      {/* Before/After */}
      <BeforeAfterTimeline />

      {/* Demo Section */}
      <div ref={demoRef} className="scroll-mt-8">
        <TestItNow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          isSpeaking={isSpeaking || isLoadingAudio}
          onStopSpeaking={stopSpeaking}
        />
      </div>

      {/* Guided Scenarios */}
      <GuidedScenarios onSelect={handleSendMessage} disabled={isLoading} />

      {/* Simple Reset Button */}
      <div className="flex justify-center gap-4 pb-8" role="group" aria-label="Demo controls">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetDemo} 
          className="gap-2"
          aria-label="Reset the demo conversation"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Reset demo
        </Button>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="flex justify-center pb-4">
          <p className="text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg" role="alert">
            {error}
          </p>
        </div>
      )}

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
