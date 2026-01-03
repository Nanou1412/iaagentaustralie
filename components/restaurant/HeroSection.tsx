"use client";

import { Phone, MessageSquare, LayoutDashboard, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStartDemo: () => void;
  onActivate: () => void;
}

export function HeroSection({ onStartDemo, onActivate }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
      
      <div className="relative max-w-4xl mx-auto text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-sm font-medium text-orange-400">For Restaurants</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Stop missing calls.
          <br />
          <span className="text-muted-foreground">
            Recover bookings and takeaway orders automatically.
          </span>
        </h1>

        {/* Sub-points */}
        <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-500" />
            </div>
            <span>Answers calls 24/7</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <span>Confirms by SMS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-purple-500" />
            </div>
            <span>Updates your dashboard</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button 
            size="lg" 
            onClick={onStartDemo}
            className="gap-2 text-lg px-8 py-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25"
          >
            Start the demo
            <ArrowDown className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onActivate}
            className="text-lg px-8 py-6 border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50"
          >
            Activate for my restaurant
          </Button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-muted-foreground/50" />
        </div>
      </div>
    </section>
  );
}
