"use client";

import { Smartphone, Signal, Battery, Wifi } from "lucide-react";
import { SMSEntry } from "@/types/events";
import { cn } from "@/lib/utils";

interface SMSPreviewProps {
  messages: SMSEntry[];
  className?: string;
}

export function SMSPreview({ messages, className }: SMSPreviewProps) {
  const latestMessages = messages.slice(-5);

  return (
    <div
      className={cn(
        "w-full max-w-[320px] mx-auto rounded-[40px] border-2 border-gray-700/50 bg-gradient-to-b from-gray-800 to-gray-900 p-2 shadow-2xl shadow-blue-500/10",
        className
      )}
    >
      {/* Phone notch */}
      <div className="h-6 bg-black rounded-t-[32px] relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-1 w-20 h-4 bg-gray-800 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-gray-700" />
        </div>
      </div>

      {/* Phone screen */}
      <div className="bg-gray-900 rounded-[28px] overflow-hidden border border-gray-800">
        {/* Status bar */}
        <div className="bg-gray-900 px-4 py-2 flex justify-between items-center text-xs text-gray-400">
          <span className="font-medium">9:41</span>
          <div className="flex items-center gap-1">
            <Signal className="h-3 w-3" />
            <Wifi className="h-3 w-3" />
            <Battery className="h-3 w-3" />
          </div>
        </div>

        {/* Header */}
        <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Smartphone className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">The Golden Fork</p>
              <p className="text-xs text-gray-400">Restaurant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[300px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-900 to-gray-950">
          {latestMessages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              <Smartphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>SMS confirmations will appear here</p>
            </div>
          ) : (
            latestMessages.map((sms, index) => (
              <div
                key={sms.id}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-3 rounded-2xl rounded-tl-sm max-w-[90%] animate-fade-in shadow-lg shadow-green-500/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-sm">{sms.message}</p>
                <p className="text-xs opacity-70 mt-1 text-right">
                  {sms.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Phone bottom */}
      <div className="h-4 bg-black rounded-b-[32px] flex items-center justify-center">
        <div className="w-24 h-1 bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}
