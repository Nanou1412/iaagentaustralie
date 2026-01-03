"use client";

import { Smartphone, Signal, Battery, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SMSMessage {
  id: string;
  type: "booking" | "takeaway" | "modification" | "cancellation";
  text: string;
  timestamp: Date;
}

interface SMSPreviewProps {
  messages: SMSMessage[];
  className?: string;
}

export function SMSPreview({ messages, className }: SMSPreviewProps) {
  const latestMessages = messages.slice(-3);

  return (
    <section className="py-8 px-4">
      <div className={cn("max-w-sm mx-auto", className)}>
        <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Customer receives SMS
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Confirmation sent instantly
        </p>

        {/* Phone Frame */}
        <div className="relative mx-auto w-[280px] rounded-[2.5rem] border-[8px] border-gray-800 bg-gray-900 shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-800 rounded-b-xl z-10" />

          {/* Screen */}
          <div className="relative bg-gray-950 rounded-[2rem] overflow-hidden">
            {/* Status Bar */}
            <div className="flex justify-between items-center px-6 pt-2 pb-1 text-[10px] text-gray-400">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3 h-3" />
              </div>
            </div>

            {/* Header */}
            <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-sm text-white">The Golden Fork</p>
                  <p className="text-xs text-gray-400">Restaurant</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-[320px] overflow-y-auto p-4 space-y-3">
              {latestMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Smartphone className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs text-center">
                    SMS confirmations will appear here
                  </p>
                </div>
              ) : (
                latestMessages.map((sms, index) => (
                  <SMSBubble
                    key={sms.id}
                    sms={sms}
                    style={{ animationDelay: `${index * 100}ms` }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-gray-600 rounded-full" />
        </div>
      </div>
    </section>
  );
}

function SMSBubble({ sms, style }: { sms: SMSMessage; style?: React.CSSProperties }) {
  const colors = {
    booking: "from-green-500 to-emerald-600",
    takeaway: "from-blue-500 to-cyan-600",
    modification: "from-yellow-500 to-orange-600",
    cancellation: "from-red-500 to-rose-600",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-r text-white p-3 rounded-2xl rounded-tl-sm max-w-[90%] animate-fade-in shadow-lg",
        colors[sms.type]
      )}
      style={style}
    >
      <p className="text-xs whitespace-pre-wrap">{sms.text}</p>
      <p className="text-[10px] opacity-70 mt-2 text-right">
        {sms.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
    </div>
  );
}
