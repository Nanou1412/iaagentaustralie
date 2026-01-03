"use client";

import { Shield, Clock, Users, HeadphonesIcon, CheckCircle } from "lucide-react";

const guarantees = [
  {
    icon: Shield,
    title: "Autonomous within rules",
    description: "Respects your hours, capacity, and kitchen times",
  },
  {
    icon: HeadphonesIcon,
    title: "Handoff to staff",
    description: "Transfers to your team when uncertain",
  },
  {
    icon: Users,
    title: "No team replacement",
    description: "Assists your staff, never replaces them",
  },
  {
    icon: Clock,
    title: "Weekly fee starts after activation",
    description: "Only pay once it's live and working",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-transparent via-muted/30 to-transparent">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Built with guardrails
        </h2>
        <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
          Emma works within the rules you set — and knows when to ask for help.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          {guarantees.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border hover:border-orange-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Core message */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-orange-400" />
            <span className="font-semibold text-orange-400">Our promise</span>
          </div>
          <p className="text-lg font-medium">
            We save you time and recover lost revenue.
          </p>
        </div>
      </div>
    </section>
  );
}
