"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceOutputProps {
  text: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export function VoiceOutput({ text, autoPlay = false, onComplete }: VoiceOutputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && text) {
      handleSpeak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  const handleSpeak = useCallback(async () => {
    if (!text) return;

    setIsLoading(true);

    try {
      // Call our TTS API endpoint
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("TTS API failed");
      }

      // Get audio blob
      const audioBlob = await response.blob();
      
      // Cleanup previous audio URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      // Create new audio URL
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        onComplete?.();
      };

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
  }, [text, onComplete]);

  const handleStop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={isSpeaking ? handleStop : handleSpeak}
      disabled={isLoading}
      className="gap-2 bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all rounded-lg"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
      ) : isSpeaking ? (
        <VolumeX className="h-4 w-4 text-red-400" />
      ) : (
        <Volume2 className="h-4 w-4 text-blue-400" />
      )}
      {isLoading ? "Loading..." : isSpeaking ? "Stop" : "Listen"}
    </Button>
  );
}
