"use client";

import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PricingOptions } from "@/components/payment";

interface CTABlockProps {
  industry?: string;
  onSuccess?: () => void;
}

export function CTABlock({ industry = "restaurants", onSuccess }: CTABlockProps) {
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
          Choose your plan and start recovering lost revenue today
        </p>
      </CardHeader>

      <CardContent className="relative z-10">
        <PricingOptions industry={industry} onSuccess={onSuccess} />
      </CardContent>
    </Card>
  );
}
