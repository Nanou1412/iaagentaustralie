"use client";

import { useState } from "react";
import { Check, CreditCard, Loader2, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PRICING } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PricingOptionsProps {
  industry?: string;
  onSuccess?: () => void;
}

export function PricingOptions({ industry = "restaurants", onSuccess }: PricingOptionsProps) {
  const [selectedPlan, setSelectedPlan] = useState<"setup_only" | "setup_weekly">("setup_weekly");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/.netlify/functions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType: selectedPlan,
          industry,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }

      onSuccess?.();
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  };

  const plans = PRICING.plans;

  return (
    <div className="space-y-6">
      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Setup Only */}
        <PlanCard
          plan={plans.setup_only}
          isSelected={selectedPlan === "setup_only"}
          onSelect={() => setSelectedPlan("setup_only")}
          disabled={isLoading}
        />

        {/* Setup + Weekly */}
        <PlanCard
          plan={plans.setup_weekly}
          isSelected={selectedPlan === "setup_weekly"}
          onSelect={() => setSelectedPlan("setup_weekly")}
          disabled={isLoading}
        />
      </div>

      {/* Summary */}
      <div className="bg-muted/50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Setup fee</span>
          <span className="font-medium">${PRICING.setup} AUD</span>
        </div>
        {selectedPlan === "setup_weekly" && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Weekly service (starts today)</span>
            <span className="font-medium">${PRICING.weekly}/week</span>
          </div>
        )}
        <div className="border-t border-border pt-2 mt-2 flex justify-between">
          <span className="font-medium">Today&apos;s total</span>
          <span className="font-bold text-lg">
            ${selectedPlan === "setup_only" ? PRICING.setup : PRICING.setup + PRICING.weekly} AUD
          </span>
        </div>
        {selectedPlan === "setup_weekly" && (
          <p className="text-xs text-muted-foreground">
            Then ${PRICING.weekly}/week • Cancel anytime
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* CTA Button */}
      <Button
        size="xl"
        className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-purple-500/30 transition-all hover:scale-[1.02]"
        onClick={handleCheckout}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Redirecting to checkout...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {selectedPlan === "setup_only" ? "Pay $390 - Setup Only" : `Pay $${PRICING.setup + PRICING.weekly} - Start Now`}
          </>
        )}
      </Button>

      {/* Trust */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          🔒 Secure checkout via Stripe
        </span>
        <span>•</span>
        <span>Cancel anytime</span>
      </div>
    </div>
  );
}

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    weeklyPrice?: number;
    features: string[];
    popular?: boolean;
  };
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

function PlanCard({ plan, isSelected, onSelect, disabled }: PlanCardProps) {
  return (
    <Card
      onClick={() => !disabled && onSelect()}
      className={cn(
        "relative cursor-pointer transition-all hover:scale-[1.02]",
        isSelected
          ? "border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20"
          : "border-border hover:border-blue-500/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Most Popular
          </span>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{plan.name}</h3>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </div>
          <div className={cn(
            "w-5 h-5 rounded-full border-2 transition-colors",
            isSelected
              ? "bg-blue-500 border-blue-500"
              : "border-muted-foreground/30"
          )}>
            {isSelected && <Check className="w-4 h-4 text-white m-auto" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">${plan.price}</span>
            <span className="text-muted-foreground">setup</span>
          </div>
          {plan.weeklyPrice && (
            <div className="flex items-center gap-1 mt-1">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">+ ${plan.weeklyPrice}/week when live</span>
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
