"use client";

import { XCircle, ArrowLeft, MessageCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-orange-950/20 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-orange-500/30 bg-gradient-to-br from-orange-950/30 to-background">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-500/20 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-orange-400" />
          </div>
          <CardTitle className="text-2xl md:text-3xl text-orange-400">
            Payment Cancelled
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            No worries! Your payment was not processed.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Reasons to reconsider */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <h3 className="font-medium flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Have questions?
            </h3>
            <p className="text-sm text-muted-foreground">
              We&apos;re happy to answer any questions you might have about how the AI agent works, 
              pricing, or anything else. No pressure, just helpful information.
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Button className="w-full gap-2" asChild>
              <Link href="/restaurant#activate">
                <ArrowLeft className="w-4 h-4" />
                Try the Demo Again
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full gap-2" asChild>
              <a href="mailto:hello@aifor.business">
                <MessageCircle className="w-4 h-4" />
                Chat with Us
              </a>
            </Button>

            <Button variant="ghost" className="w-full" asChild>
              <Link href="/">
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Reassurance */}
          <p className="text-center text-xs text-muted-foreground">
            No credit card was charged. You can return anytime to complete your purchase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
