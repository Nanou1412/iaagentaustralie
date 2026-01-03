"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, MessageSquare, Send, Loader2, Volume2, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { checkSpeechSupport, getSpeechRecognition } from "@/lib/speech";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface TestItNowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
}

export function TestItNow({ messages, isLoading, onSendMessage, isSpeaking, onStopSpeaking }: TestItNowProps) {
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [hasVoiceSupport, setHasVoiceSupport] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputValue, setInputValue] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const voiceContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const support = checkSpeechSupport();
    setHasVoiceSupport(support.recognition);
    if (!support.recognition) setMode("chat");
  }, []);

  // Scroll to bottom ONLY within the messages container
  useEffect(() => {
    requestAnimationFrame(() => {
      if (mode === "chat" && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      } else if (mode === "voice" && voiceContainerRef.current) {
        voiceContainerRef.current.scrollTop = voiceContainerRef.current.scrollHeight;
      }
    });
  }, [messages, mode]);

  // Stop listening when Emma starts speaking (prevent interruption)
  useEffect(() => {
    if (isSpeaking && isListening) {
      stopListening();
    }
  }, [isSpeaking]);

  const startListening = useCallback(() => {
    if (!hasVoiceSupport || isSpeaking) return;

    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          setTranscript(event.results[i][0].transcript);
        }
      }
      if (final) {
        onSendMessage(final.trim());
        setTranscript("");
      }
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
  }, [hasVoiceSupport, onSendMessage, isSpeaking]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const hasStarted = messages.length > 0;

  return (
    <section id="demo" className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Simplified Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            🍽️ Call The Golden Fork
          </h2>
          <p className="text-muted-foreground text-sm">
            Talk to Emma - she can book tables, take orders, or answer questions
          </p>
        </div>

        <Card className="overflow-hidden border-orange-500/30 shadow-xl shadow-orange-500/5">
          {/* Phone-style Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium">The Golden Fork</p>
                  <p className="text-xs text-white/70">
                    {hasStarted ? (isSpeaking ? "Emma is speaking..." : isListening ? "Listening..." : "Connected") : "Tap to call"}
                  </p>
                </div>
              </div>
              
              {/* Mode Toggle - only show after started */}
              {hasStarted && (
                <div className="flex gap-1 bg-white/10 rounded-lg p-1">
                  <button
                    onClick={() => setMode("voice")}
                    disabled={!hasVoiceSupport}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      mode === "voice" ? "bg-white text-orange-600" : "text-white/70 hover:text-white"
                    )}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setMode("chat")}
                    className={cn(
                      "p-2 rounded-md transition-colors",
                      mode === "chat" ? "bg-white text-orange-600" : "text-white/70 hover:text-white"
                    )}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div 
            ref={mode === "voice" ? voiceContainerRef : chatContainerRef}
            className="h-[300px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-background to-muted/20"
          >
            {!hasStarted && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Phone className="w-8 h-8 text-orange-500" />
                </div>
                <div>
                  <p className="font-medium text-lg">Ready to call?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click the button below to start
                  </p>
                </div>
              </div>
            )}
            
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            
            {isLoading && <TypingIndicator />}
          </div>

          {/* Input Area */}
          <div className="border-t bg-muted/30 p-4">
            {mode === "voice" ? (
              <div className="flex items-center justify-center gap-4">
                {/* Main Voice Button */}
                <Button
                  size="lg"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading || isSpeaking}
                  className={cn(
                    "w-14 h-14 rounded-full transition-all",
                    isListening
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  )}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6" />
                  ) : (
                    <Mic className="w-6 h-6" />
                  )}
                </Button>
                
                {/* Stop Emma Button */}
                {isSpeaking && onStopSpeaking && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onStopSpeaking}
                    className="gap-2"
                  >
                    <PhoneOff className="w-4 h-4" />
                    Stop
                  </Button>
                )}
                
                {/* Transcript preview */}
                {transcript && (
                  <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur rounded-lg px-4 py-2 shadow-lg">
                    <p className="text-sm italic">{transcript}</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleChatSubmit} className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            )}
            
            {/* Status indicator */}
            <p className="text-center text-xs text-muted-foreground mt-2">
              {isSpeaking ? (
                <span className="flex items-center justify-center gap-1">
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  Emma is speaking...
                </span>
              ) : isListening ? (
                "Listening... speak now"
              ) : mode === "voice" ? (
                "Tap mic to speak"
              ) : (
                "Type and press Enter"
              )}
            </p>
          </div>
        </Card>

        {/* Quick Actions - Only show when conversation started */}
        {hasStarted && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <QuickAction onClick={() => onSendMessage("Book a table for tonight")} disabled={isLoading}>
              📅 Book table
            </QuickAction>
            <QuickAction onClick={() => onSendMessage("I'd like to order takeaway")} disabled={isLoading}>
              🥡 Takeaway
            </QuickAction>
            <QuickAction onClick={() => onSendMessage("What's popular?")} disabled={isLoading}>
              ⭐ Popular
            </QuickAction>
            <QuickAction onClick={() => onSendMessage("Do you have vegetarian options?")} disabled={isLoading}>
              🥬 Veggie
            </QuickAction>
          </div>
        )}
      </div>
    </section>
  );
}

function QuickAction({ onClick, disabled, children }: { onClick: () => void; disabled: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 text-sm rounded-full border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={cn(
      "flex",
      message.role === "user" ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-2.5",
        message.role === "user"
          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white"
          : "bg-muted border border-border"
      )}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-2xl px-4 py-3 border border-border">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
