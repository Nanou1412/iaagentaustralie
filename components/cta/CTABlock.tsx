"use client";

import { Check, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PRICING } from "@/lib/constants";

interface CTABlockProps {
  onActivate?: () => void;
}

export function CTABlock({ onActivate }: CTABlockProps) {
  const handleActivate = () => {
    // Placeholder - would integrate with payment
    onActivate?.();
    alert(
      "Payment integration placeholder.\n\nIn production, this would connect to your payment processor."
    );
  };

  return (
    <Card className="relative border border-blue-500/30 bg-gradient-to-br from-blue-950/50 via-gray-900 to-purple-950/50 overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
      
      <CardHeader className="text-center relative z-10">
        <CardTitle className="text-2xl md:text-3xl gradient-text">
          Activate in your business
        </CardTitle>
        <p className="text-gray-400 mt-2">
          Start recovering lost revenue today
        </p>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* Pricing */}
        <div className="text-center p-6 rounded-xl bg-gray-800/30 border border-gray-700/50">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ${PRICING.setup} {PRICING.currency}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            One-time setup fee
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Weekly fee starts only once it&apos;s live
          </p>
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {[
            "24/7 AI-powered call handling",
            "Instant SMS confirmations",
            "Real-time dashboard updates",
            "No long-term commitment",
            "Dedicated onboarding support",
          ].map((feature, index) => (
            <li 
              key={feature} 
              className="flex items-center gap-3 text-sm text-gray-300 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Check className="h-3 w-3 text-white" />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          size="xl"
          className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-purple-500/30 transition-all hover:scale-[1.02]"
          onClick={handleActivate}
        >
          <CreditCard className="h-5 w-5" />
          Get Started Now
        </Button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700/50">
            <Shield className="h-3 w-3 text-green-400" />
            Secure payment
          </span>
          <span className="bg-gray-800/50 rounded-full px-3 py-1 border border-gray-700/50">
            Cancel anytime
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
