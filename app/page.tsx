"use client";

import { useState, useRef } from "react";
import { ArrowRight, Volume2, VolumeX, Sparkles, Zap, Shield, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE, HOME_INTRO_TEXT, HOME_LISTEN_TEXT, HOME_GREETING_NAME } from "@/lib/constants";

export default function HomePage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  const handleListen = async () => {
    if (isSpeaking) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);

    try {
      // Call OpenAI TTS API
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: HOME_LISTEN_TEXT }),
      });

      if (!response.ok) throw new Error("TTS failed");

      const audioBlob = await response.blob();
      
      // Cleanup previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
      };
      audio.onplay = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      await audio.play();
    } catch (error) {
      console.error("TTS error:", error);
      setIsLoading(false);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        
        {/* AI Avatar with glow effect */}
        <div className="flex justify-center animate-fade-in">
          <div className="relative">
            {/* Outer glow rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-30 animate-pulse" />
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
            
            {/* Main avatar */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 p-[2px] animate-float">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <div className="text-5xl md:text-6xl">👋</div>
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Name and tagline */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400">Meet {HOME_GREETING_NAME}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="gradient-text">{APP_TAGLINE}</span>
          </h1>
        </div>

        {/* Intro text */}
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: '0.2s' }}>
          {HOME_INTRO_TEXT}
        </p>

        {/* Listen button */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Button
            variant={isSpeaking ? "default" : "outline"}
            size="lg"
            onClick={handleListen}
            disabled={isLoading}
            className={`gap-2 ${isSpeaking ? 'animate-pulse-glow' : 'hover:border-blue-500/50'}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading voice...
              </>
            ) : isSpeaking ? (
              <>
                <VolumeX className="h-5 w-5" />
                Okay, I&apos;ll stop
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5" />
                Hear me introduce myself
              </>
            )}
          </Button>
        </div>

        {/* Primary CTA */}
        <div className="pt-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button asChild size="xl" className="gap-2 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 glow-blue">
            <a href="/industries">
              Let me show you how I work
              <ArrowRight className="h-5 w-5" />
            </a>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="pt-12 grid md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="glass-card rounded-xl p-6 text-left hover:border-blue-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold mb-1">24/7 Availability</h3>
            <p className="text-sm text-muted-foreground">I&apos;m here whenever your customers need me, even at 3am.</p>
          </div>
          
          <div className="glass-card rounded-xl p-6 text-left hover:border-purple-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-1">Instant Response</h3>
            <p className="text-sm text-muted-foreground">No hold times. I pick up immediately and get things done.</p>
          </div>
          
          <div className="glass-card rounded-xl p-6 text-left hover:border-cyan-500/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="font-semibold mb-1">Never Miss a Sale</h3>
            <p className="text-sm text-muted-foreground">Every call answered means every opportunity captured.</p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="pt-8 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span>No missed calls</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Setup in minutes</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
