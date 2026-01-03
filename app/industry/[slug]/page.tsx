"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { RotateCcw, Play, Mic, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoiceInput } from "@/components/voice";
import { ChatWindow } from "@/components/chat";
import { ScenarioHints } from "@/components/scenario-hints";
import { BeforeAfterTimeline } from "@/components/timeline";
import { SMSPreview } from "@/components/sms-preview";
import { DashboardPreview } from "@/components/dashboard-preview";
import { CTABlock } from "@/components/cta";
import { useDemoStore } from "@/lib/store";
import { sendMessage, formatConversationHistory } from "@/lib/ai";
import { getIndustryBySlug } from "@/lib/industry-config";
import { checkSpeechSupport } from "@/lib/speech";
import { notFound } from "next/navigation";

export default function RestaurantPage() {
  const industry = getIndustryBySlug("restaurants");

  if (!industry) {
    notFound();
  }

  return <RestaurantContent industry={industry} />;
}

function RestaurantContent({ industry }: { industry: NonNullable<ReturnType<typeof getIndustryBySlug>> }) {
  const {
    messages,
    isLoading,
    dashboardEntries,
    smsHistory,
    addMessage,
    setLoading,
    processEvent,
    reset,
    replayPerfectScenario,
  } = useDemoStore();

  const [inputMode, setInputMode] = useState<"voice" | "chat">("voice");
  const [hasVoiceSupport, setHasVoiceSupport] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const support = checkSpeechSupport();
    setHasVoiceSupport(support.recognition);
    if (!support.recognition) {
      setInputMode("chat");
    }
  }, []);

  // Function to speak using OpenAI TTS
  const speakWithOpenAI = useCallback(async (text: string) => {
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) return;

      const audioBlob = await response.blob();
      
      // Cleanup previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Stop any previous audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
    }
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      addMessage("user", text);
      setLoading(true);

      try {
        const history = formatConversationHistory(
          messages.map((m) => ({ role: m.role, content: m.content }))
        );

        const response = await sendMessage({
          message: text,
          conversationHistory: history,
          industry: industry.slug,
        });

        addMessage("assistant", response.assistantMessage, response.event);
        processEvent(response.event);

        // Auto-speak response with OpenAI TTS if voice mode
        if (inputMode === "voice") {
          speakWithOpenAI(response.assistantMessage);
        }
      } catch (error) {
        console.error("AI Error:", error);
        addMessage(
          "assistant",
          "Oh sorry, I didn't quite catch that! Could you say that again for me?"
        );
      } finally {
        setLoading(false);
      }
    },
    [messages, isLoading, industry.slug, inputMode, addMessage, setLoading, processEvent, speakWithOpenAI]
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-20">
      {/* Section 1: Phrase Choc */}
      <section className="text-center max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-sm text-orange-400">Restaurants</span>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
          <span className="gradient-text">You&apos;re already losing money</span>
          <br />
          <span className="text-muted-foreground">when calls are missed.</span>
        </h1>
        <p className="text-xl text-blue-400 font-medium">
          Emma makes sure that never happens.
        </p>
      </section>

      {/* Section 2: Before/After Timeline */}
      <section className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="gradient-text">See the difference</span>
        </h2>
        <BeforeAfterTimeline />
      </section>

      {/* Section 3: Test It Now */}
      <section className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <Card className="border-blue-500/20">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-card flex items-center justify-center text-2xl">
                  👋
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl gradient-text">Talk to Emma</CardTitle>
            <p className="text-muted-foreground">
              Go ahead — call The Golden Fork and see how Emma handles it
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Mode Toggle */}
            <Tabs
              value={inputMode}
              onValueChange={(v) => setInputMode(v as "voice" | "chat")}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 bg-white/5">
                <TabsTrigger value="voice" disabled={!hasVoiceSupport} className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400">
                  <Mic className="h-4 w-4 mr-2" />
                  Voice
                </TabsTrigger>
                <TabsTrigger value="chat" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </TabsTrigger>
              </TabsList>

              {/* Voice Input */}
              <TabsContent value="voice" className="mt-6">
                <div className="text-center space-y-6">
                  <VoiceInput
                    onTranscript={handleSendMessage}
                    disabled={isLoading}
                  />
                  
                  {/* Recent messages in voice mode */}
                  {messages.length > 0 && (
                    <div className="max-w-md mx-auto text-left space-y-2 p-4 glass-card rounded-xl">
                      {messages.slice(-2).map((m) => (
                        <p
                          key={m.id}
                          className={`text-sm ${
                            m.role === "user"
                              ? "text-muted-foreground"
                              : "font-medium text-blue-400"
                          }`}
                        >
                          <span className="font-semibold">
                            {m.role === "user" ? "You: " : "AI: "}
                          </span>
                          {m.content}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Chat Input */}
              <TabsContent value="chat" className="mt-6">
                <div className="glass-card rounded-xl overflow-hidden">
                  <ChatWindow
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder="Type as if calling a restaurant..."
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Scenario Hints */}
            <div className="pt-4 border-t border-white/10">
              <ScenarioHints
                scenarios={industry.scenarios}
                onSelect={handleSendMessage}
                disabled={isLoading}
              />
            </div>

            {/* Reset / Replay buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" size="sm" onClick={reset} className="hover:border-red-500/50 hover:text-red-400">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset demo
              </Button>
              <Button variant="outline" size="sm" onClick={replayPerfectScenario} className="hover:border-green-500/50 hover:text-green-400">
                <Play className="h-4 w-4 mr-2" />
                Replay perfect scenario
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4 & 5: SMS Preview & Dashboard */}
      <section className="max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-2xl font-bold text-center mb-8">
          <span className="gradient-text">See what happens in real-time</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* SMS Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <h3 className="text-lg font-semibold text-center">
                Customer receives SMS
              </h3>
            </div>
            <SMSPreview messages={smsHistory} />
          </div>

          {/* Dashboard Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <h3 className="text-lg font-semibold text-center">
                Your dashboard updates
              </h3>
            </div>
            <DashboardPreview entries={dashboardEntries} />
          </div>
        </div>
      </section>

      {/* Section 6: CTA */}
      <section className="max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <CTABlock />
      </section>

      {/* Back link */}
      <div className="text-center pb-8">
        <Button variant="ghost" asChild className="hover:text-blue-400">
          <a href="/industries">← Back to industries</a>
        </Button>
      </div>
    </div>
  );
}
