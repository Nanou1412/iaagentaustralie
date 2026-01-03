"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ArrowRight, Volume2, VolumeX, Sparkles, Zap, Shield, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_TAGLINE, HOME_INTRO_TEXT, HOME_LISTEN_TEXT, HOME_GREETING_NAME } from "@/lib/constants";

export default function HomePage() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      
      // Cleanup URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  // Memoized handler to prevent unnecessary re-renders
  const handleListen = useCallback(async () => {
    setError(null);

    if (isSpeaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsSpeaking(false);
      return;
    }

    setIsLoading(true);

    try {
      // Use Netlify Functions endpoint (correct for production)
      const response = await fetch("/.netlify/functions/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: HOME_LISTEN_TEXT }),
      });

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      
      if (!isMountedRef.current) return;
      
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        if (isMountedRef.current) setIsSpeaking(false);
      };
      
      audio.onerror = () => {
        if (isMountedRef.current) {
          setIsSpeaking(false);
          setIsLoading(false);
          setError("Failed to play audio");
        }
      };
      
      audio.onplay = () => {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsSpeaking(true);
        }
      };

      await audio.play();
    } catch (err) {
      console.error("TTS error:", err);
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsSpeaking(false);
        setError("Voice temporarily unavailable");
      }
    }
  }, [isSpeaking]);

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <div id="main-content" className="max-w-4xl mx-auto text-center space-y-12">
        
        {/* AI Avatar with glow effect */}
        <div className="flex justify-center animate-fade-in" role="img" aria-label="Emma AI Assistant avatar">
          <div className="relative">
            {/* Outer glow rings */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-30 animate-pulse" aria-hidden="true" />
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse animation-delay-500" aria-hidden="true" />
            
            {/* Main avatar */}
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 p-[2px] animate-float">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <span className="text-5xl md:text-6xl" role="img" aria-label="Waving hand">👋</span>
              </div>
            </div>

            {/* Status indicator */}
            <div className="absolute -bottom-2 -right-2 flex items-center gap-1.5 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" aria-hidden="true" />
              <span className="text-xs text-green-400 font-medium">Online</span>
            </div>
          </div>
        </div>

        {/* Name and tagline */}
        <div className="space-y-4 animate-fade-in animation-delay-100">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card">
            <Sparkles className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span className="text-sm text-blue-400">Meet {HOME_GREETING_NAME}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="gradient-text">{APP_TAGLINE}</span>
          </h1>
        </div>

        {/* Intro text */}
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed animate-fade-in animation-delay-200 max-w-2xl mx-auto">
          {HOME_INTRO_TEXT}
        </p>

        {/* Listen button */}
        <div className="animate-fade-in animation-delay-300">
          <Button
            variant={isSpeaking ? "default" : "outline"}
            size="lg"
            onClick={handleListen}
            disabled={isLoading}
            aria-label={isSpeaking ? "Stop Emma speaking" : "Hear Emma introduce herself"}
            aria-busy={isLoading}
            className={`gap-2 ${isSpeaking ? 'animate-pulse-glow' : 'hover:border-blue-500/50'} focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Loading voice...</span>
              </>
            ) : isSpeaking ? (
              <>
                <VolumeX className="h-5 w-5" aria-hidden="true" />
                <span>Okay, I&apos;ll stop</span>
              </>
            ) : (
              <>
                <Volume2 className="h-5 w-5" aria-hidden="true" />
                <span>Hear me introduce myself</span>
              </>
            )}
          </Button>
          
          {/* Error message */}
          {error && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Primary CTA */}
        <div className="pt-4 animate-fade-in animation-delay-400">
          <Button 
            asChild 
            size="xl" 
            className="gap-2 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-0 glow-blue focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <a href="/industries" aria-label="See how Emma works for different industries">
              Let me show you how I work
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </Button>
        </div>

        {/* Feature cards */}
        <div className="pt-12 grid md:grid-cols-3 gap-4 animate-fade-in animation-delay-500" role="list" aria-label="Key features">
          <article className="glass-card rounded-xl p-6 text-left hover:border-blue-500/30 transition-colors focus-within:ring-2 focus-within:ring-blue-500" role="listitem">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4" aria-hidden="true">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="font-semibold mb-1">24/7 Availability</h2>
            <p className="text-sm text-muted-foreground">I&apos;m here whenever your customers need me, even at 3am.</p>
          </article>
          
          <article className="glass-card rounded-xl p-6 text-left hover:border-purple-500/30 transition-colors focus-within:ring-2 focus-within:ring-purple-500" role="listitem">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4" aria-hidden="true">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="font-semibold mb-1">Instant Response</h2>
            <p className="text-sm text-muted-foreground">No hold times. I pick up immediately and get things done.</p>
          </article>
          
          <article className="glass-card rounded-xl p-6 text-left hover:border-cyan-500/30 transition-colors focus-within:ring-2 focus-within:ring-cyan-500" role="listitem">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4" aria-hidden="true">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="font-semibold mb-1">Never Miss a Sale</h2>
            <p className="text-sm text-muted-foreground">Every call answered means every opportunity captured.</p>
          </article>
        </div>

        {/* Trust badges */}
        <div className="pt-8 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground animate-fade-in animation-delay-600" role="list" aria-label="Trust indicators">
          <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full" role="listitem">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" aria-hidden="true" />
            <span>No missed calls</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full" role="listitem">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
            <span>Setup in minutes</span>
          </div>
          <div className="flex items-center gap-2 glass-card px-4 py-2 rounded-full" role="listitem">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" aria-hidden="true" />
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
