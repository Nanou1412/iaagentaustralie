"use client";

import { Phone, PhoneOff, MessageSquare, Calendar, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: string;
  icon: "phone-off" | "phone" | "message" | "calendar" | "bell";
  title: string;
  description: string;
  isBefore?: boolean;
}

const beforeSteps: TimelineStep[] = [
  {
    id: "before-1",
    icon: "phone-off",
    title: "Missed Call",
    description: "Customer calls during rush hour",
    isBefore: true,
  },
  {
    id: "before-2",
    icon: "phone-off",
    title: "No Response",
    description: "Staff too busy to call back",
    isBefore: true,
  },
  {
    id: "before-3",
    icon: "phone-off",
    title: "Lost Revenue",
    description: "Customer books elsewhere",
    isBefore: true,
  },
];

const afterSteps: TimelineStep[] = [
  {
    id: "after-1",
    icon: "phone",
    title: "AI Answers",
    description: "Instant response, 24/7",
  },
  {
    id: "after-2",
    icon: "message",
    title: "SMS Sent",
    description: "Confirmation to customer",
  },
  {
    id: "after-3",
    icon: "calendar",
    title: "Planning Updated",
    description: "Booking in your system",
  },
  {
    id: "after-4",
    icon: "bell",
    title: "Team Notified",
    description: "Dashboard shows new booking",
  },
];

function getIcon(icon: TimelineStep["icon"]) {
  switch (icon) {
    case "phone-off":
      return <PhoneOff className="h-5 w-5" />;
    case "phone":
      return <Phone className="h-5 w-5" />;
    case "message":
      return <MessageSquare className="h-5 w-5" />;
    case "calendar":
      return <Calendar className="h-5 w-5" />;
    case "bell":
      return <Bell className="h-5 w-5" />;
  }
}

export function BeforeAfterTimeline() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Before */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
            ✕
          </span>
          Before
        </h3>
        <div className="space-y-3">
          {beforeSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl animate-fade-in",
                "bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/20 flex items-center justify-center text-red-400 shrink-0">
                {getIcon(step.icon)}
              </div>
              <div>
                <p className="font-medium text-white">{step.title}</p>
                <p className="text-sm text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* After */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-green-400 flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
            ✓
          </span>
          After
        </h3>
        <div className="space-y-3">
          {afterSteps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-xl animate-fade-in",
                "bg-green-500/5 border border-green-500/20 hover:bg-green-500/10 transition-colors"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center text-green-400 shrink-0">
                {getIcon(step.icon)}
              </div>
              <div>
                <p className="font-medium text-white">{step.title}</p>
                <p className="text-sm text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
