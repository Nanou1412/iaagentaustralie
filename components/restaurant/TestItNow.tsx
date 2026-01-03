"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, MessageSquare, Send, Loader2, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
}

export function TestItNow({ messages, isLoading, onSendMessage }: TestItNowProps) {
  const [mode, setMode] = useState<"voice" | "chat">("voice");
  const [hasVoiceSupport, setHasVoiceSupport] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [inputValue, setInputValue] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const voiceContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const support = checkSpeechSupport();
    setHasVoiceSupport(support.recognition);
    if (!support.recognition) setMode("chat");
  }, []);

  // Scroll to bottom ONLY within the messages container (not the page)
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      if (mode === "chat" && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      } else if (mode === "voice" && voiceContainerRef.current) {
        voiceContainerRef.current.scrollTop = voiceContainerRef.current.scrollHeight;
      }
    });
  }, [messages, mode]);

  const startListening = useCallback(() => {
    if (!hasVoiceSupport) return;

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
  }, [hasVoiceSupport, onSendMessage]);

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

  return (
    <section id="demo" className="py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Test it now
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
          Talk to Emma as if you're calling The Golden Fork restaurant.
        </p>

        <Card className="overflow-hidden border-orange-500/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-4 border-b border-orange-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xl">
                👋
              </div>
              <div>
                <p className="font-semibold">Emma</p>
                <p className="text-sm text-muted-foreground">AI Assistant • The Golden Fork</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-green-400">Online</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as "voice" | "chat")} className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2 max-w-xs mx-auto">
                <TabsTrigger value="voice" disabled={!hasVoiceSupport} className="gap-2">
                  <Mic className="w-4 h-4" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Voice Mode */}
            <TabsContent value="voice" className="p-6">
              <div className="text-center space-y-6">
                {/* Microphone Button */}
                <div className="relative inline-flex">
                  {isListening && (
                    <>
                      <div className="absolute inset-0 w-24 h-24 -m-4 rounded-full bg-orange-500/20 animate-ping" />
                      <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-orange-500/10 animate-pulse" />
                    </>
                  )}
                  <Button
                    size="lg"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isLoading}
                    className={cn(
                      "w-16 h-16 rounded-full relative z-10 transition-all",
                      isListening
                        ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
                        : "bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/30"
                    )}
                  >
                    {isListening ? (
                      <MicOff className="w-6 h-6" />
                    ) : (
                      <Mic className="w-6 h-6" />
                    )}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground">
                  {isListening ? "Listening... Speak now" : "Tap to start speaking"}
                </p>

                {transcript && (
                  <p className="text-sm italic text-muted-foreground bg-muted/50 rounded-lg px-4 py-2">
                    {transcript}
                  </p>
                )}

                {/* Voice Messages */}
                {messages.length > 0 && (
                  <div 
                    ref={voiceContainerRef}
                    className="mt-6 space-y-3 text-left max-w-md mx-auto max-h-[250px] overflow-y-auto"
                  >
                    {messages.slice(-4).map((m) => (
                      <VoiceMessageBubble key={m.id} message={m} />
                    ))}
                    {isLoading && <TypingIndicator />}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Chat Mode */}
            <TabsContent value="chat" className="p-0">
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="h-[350px] overflow-y-auto p-4 space-y-3 scroll-smooth"
              >
                {messages.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Start a conversation...
                  </p>
                )}
                {messages.map((m) => (
                  <ChatMessageBubble key={m.id} message={m} />
                ))}
                {isLoading && <TypingIndicator />}
              </div>

              {/* Input */}
              <form onSubmit={handleChatSubmit} className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type as if calling the restaurant..."
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
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  );
}

function VoiceMessageBubble({ message }: { message: Message }) {
  return (
    <div className={cn(
      "flex",
      message.role === "user" ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3",
        message.role === "user"
          ? "bg-orange-500/20 text-orange-100"
          : "bg-muted"
      )}>
        <p className="text-sm">{message.content}</p>
        {message.role === "assistant" && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Volume2 className="w-3 h-3" />
            <span>Audio played</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatMessageBubble({ message }: { message: Message }) {
  return (
    <div className={cn(
      "flex",
      message.role === "user" ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
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
      <div className="bg-muted rounded-2xl px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
