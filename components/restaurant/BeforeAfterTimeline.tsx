"use client";

import { useState, useEffect } from "react";
import { Phone, PhoneOff, MessageSquare, Calendar, LayoutDashboard, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "waiting" | "active" | "done";
}

const beforeSteps: Omit<TimelineStep, "status">[] = [
  { id: "b1", icon: <Phone className="w-5 h-5" />, title: "Customer calls", description: "During busy service" },
  { id: "b2", icon: <PhoneOff className="w-5 h-5" />, title: "Call missed", description: "Staff too busy" },
  { id: "b3", icon: <XCircle className="w-5 h-5" />, title: "Customer lost", description: "Books elsewhere" },
];

const afterSteps: Omit<TimelineStep, "status">[] = [
  { id: "a1", icon: <Phone className="w-5 h-5" />, title: "AI answers", description: "Instantly, 24/7" },
  { id: "a2", icon: <Calendar className="w-5 h-5" />, title: "Booking captured", description: "Or takeaway order" },
  { id: "a3", icon: <MessageSquare className="w-5 h-5" />, title: "SMS sent", description: "Customer confirmed" },
  { id: "a4", icon: <LayoutDashboard className="w-5 h-5" />, title: "Dashboard updated", description: "Staff notified" },
];

export function BeforeAfterTimeline() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [beforeIndex, setBeforeIndex] = useState(-1);
  const [afterIndex, setAfterIndex] = useState(-1);

  const replay = () => {
    setIsPlaying(true);
    setBeforeIndex(-1);
    setAfterIndex(-1);
  };

  useEffect(() => {
    if (!isPlaying) return;

    // Animate "before" steps
    const beforeTimers = beforeSteps.map((_, i) =>
      setTimeout(() => setBeforeIndex(i), (i + 1) * 600)
    );

    // Then animate "after" steps
    const afterStart = beforeSteps.length * 600 + 400;
    const afterTimers = afterSteps.map((_, i) =>
      setTimeout(() => setAfterIndex(i), afterStart + (i + 1) * 600)
    );

    // End animation
    const endTimer = setTimeout(() => {
      setIsPlaying(false);
    }, afterStart + afterSteps.length * 600 + 500);

    return () => {
      beforeTimers.forEach(clearTimeout);
      afterTimers.forEach(clearTimeout);
      clearTimeout(endTimer);
    };
  }, [isPlaying]);

  const getStatus = (index: number, currentIndex: number): TimelineStep["status"] => {
    if (index < currentIndex) return "done";
    if (index === currentIndex) return "active";
    return "waiting";
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          See the difference
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
          From missed opportunities to recovered revenue — automatically.
        </p>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Before Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 font-bold text-sm">✕</span>
              <h3 className="text-lg font-semibold text-red-400">Before</h3>
            </div>
            <div className="space-y-3">
              {beforeSteps.map((step, i) => (
                <TimelineItem
                  key={step.id}
                  step={step}
                  status={getStatus(i, beforeIndex)}
                  variant="before"
                />
              ))}
            </div>
          </div>

          {/* After Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-sm">✓</span>
              <h3 className="text-lg font-semibold text-green-400">After</h3>
            </div>
            <div className="space-y-3">
              {afterSteps.map((step, i) => (
                <TimelineItem
                  key={step.id}
                  step={step}
                  status={getStatus(i, afterIndex)}
                  variant="after"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Replay Button */}
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            onClick={replay}
            disabled={isPlaying}
            className="gap-2"
          >
            <RotateCcw className={cn("w-4 h-4", isPlaying && "animate-spin")} />
            {isPlaying ? "Playing..." : "Replay animation"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  step,
  status,
  variant,
}: {
  step: Omit<TimelineStep, "status">;
  status: TimelineStep["status"];
  variant: "before" | "after";
}) {
  const colors = {
    before: {
      waiting: "bg-gray-800/50 border-gray-700/50 text-gray-500",
      active: "bg-red-500/10 border-red-500/50 text-red-400 scale-[1.02]",
      done: "bg-red-500/5 border-red-500/20 text-red-400/70",
    },
    after: {
      waiting: "bg-gray-800/50 border-gray-700/50 text-gray-500",
      active: "bg-green-500/10 border-green-500/50 text-green-400 scale-[1.02]",
      done: "bg-green-500/5 border-green-500/20 text-green-400/70",
    },
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
        colors[variant][status]
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300",
        status === "active" && "animate-pulse"
      )}>
        {status === "done" && variant === "after" ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          step.icon
        )}
      </div>
      <div>
        <p className="font-medium">{step.title}</p>
        <p className="text-sm opacity-70">{step.description}</p>
      </div>
    </div>
  );
}
