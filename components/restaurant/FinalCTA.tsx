"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PricingOptions } from "@/components/payment";

export function FinalCTA() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden border-orange-500/30 shadow-xl shadow-orange-500/10">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-center text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              Activate in your restaurant
            </h2>
            <p className="opacity-90">
              Choose your plan and start recovering lost revenue today
            </p>
          </div>

          <CardContent className="p-6">
            <PricingOptions industry="restaurants" />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
