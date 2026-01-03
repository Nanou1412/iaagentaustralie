"use client";

import { CreditCard, Check, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FinalCTAProps {
  onActivate: () => void;
}

export function FinalCTA({ onActivate }: FinalCTAProps) {
  const features = [
    "24/7 AI-powered call handling",
    "Reservations + takeaway orders",
    "Instant SMS confirmations",
    "Real-time dashboard updates",
    "Dedicated onboarding support",
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        <Card className="overflow-hidden border-orange-500/30 shadow-xl shadow-orange-500/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Activate in your restaurant
            </h2>
            <p className="opacity-90">
              Start recovering lost revenue today
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Pricing */}
            <div className="text-center space-y-2">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">$390</span>
                <span className="text-muted-foreground">AUD</span>
              </div>
              <p className="text-sm text-muted-foreground">
                One-time setup fee
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm">
                <Zap className="w-4 h-4" />
                Then $69.90/week — starts after activation
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              size="lg"
              onClick={onActivate}
              className="w-full gap-2 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-500/25"
            >
              <CreditCard className="w-5 h-5" />
              Activate my assistant
            </Button>

            {/* Trust */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Secure payment
              </span>
              <span>•</span>
              <span>Cancel anytime</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
