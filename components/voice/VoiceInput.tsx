"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkSpeechSupport, getSpeechRecognition } from "@/lib/speech";
import { cn } from "@/lib/utils";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onListening?: (isListening: boolean) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscript, onListening, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const support = checkSpeechSupport();
    setIsSupported(support.recognition);
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || disabled) return;

    const recognition = getSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      onListening?.(true);
    };

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimText(interim);

      if (final) {
        onTranscript(final.trim());
        setInterimText("");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      onListening?.(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      onListening?.(false);
      setInterimText("");
    };

    recognition.start();
  }, [isSupported, disabled, onTranscript, onListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    onListening?.(false);
  }, [onListening]);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        {/* Glow rings */}
        {isListening && (
          <>
            <div className="absolute inset-0 w-20 h-20 -m-2 rounded-full bg-red-500/20 animate-ping" />
            <div className="absolute inset-0 w-16 h-16 rounded-full bg-red-500/10 animate-pulse" />
          </>
        )}
        
        <Button
          type="button"
          variant={isListening ? "destructive" : "default"}
          size="xl"
          onClick={toggleListening}
          disabled={disabled}
          className={cn(
            "rounded-full w-16 h-16 relative z-10 shadow-xl transition-all duration-300",
            isListening 
              ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/30 hover:shadow-red-500/50" 
              : "bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/30 hover:shadow-purple-500/50 hover:scale-105"
          )}
        >
          {isListening ? (
            <MicOff className="h-6 w-6 text-white" />
          ) : (
            <Mic className="h-6 w-6 text-white" />
          )}
        </Button>
      </div>
      
      {isListening && (
        <div className="flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 rounded-full px-4 py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Listening...</span>
        </div>
      )}
      
      {interimText && (
        <p className="text-sm text-gray-400 italic max-w-md text-center bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700/50">
          {interimText}
        </p>
      )}
    </div>
  );
}
