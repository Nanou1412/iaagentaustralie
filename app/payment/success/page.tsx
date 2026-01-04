"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Calendar, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="max-w-lg w-full border-green-500/30 bg-gradient-to-br from-green-950/30 to-background">
      <CardHeader className="text-center">
        {isLoading ? (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 animate-pulse" />
        ) : (
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
        )}
        <CardTitle className="text-2xl md:text-3xl text-green-400">
          {isLoading ? "Processing..." : "Payment Successful!"}
        </CardTitle>
        {!isLoading && (
          <p className="text-muted-foreground mt-2">
            Thank you for your purchase. Your AI agent is being set up!
          </p>
        )}
      </CardHeader>

      {!isLoading && (
        <CardContent className="space-y-6">
          {/* Order confirmation */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <h3 className="font-medium">What happens next?</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Check your email</p>
                  <p className="text-muted-foreground">
                    You&apos;ll receive a confirmation email with your order details
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Onboarding call</p>
                  <p className="text-muted-foreground">
                    We&apos;ll reach out within 24 hours to schedule your setup call
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Go live!</p>
                  <p className="text-muted-foreground">
                    Your AI agent will be ready to take calls within 48 hours
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact options */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1 gap-2" asChild>
              <a href="mailto:hello@aifor.business">
                <Mail className="w-4 h-4" />
                Contact Us
              </a>
            </Button>
            <Button variant="outline" className="flex-1 gap-2" asChild>
              <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                <Calendar className="w-4 h-4" />
                Book a Call
              </a>
            </Button>
          </div>

          {/* Back to home */}
          <Button className="w-full gap-2" asChild>
            <Link href="/">
              Back to Home
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          {/* Session ID for reference */}
          {sessionId && (
            <p className="text-center text-xs text-muted-foreground">
              Order reference: {sessionId.substring(0, 20)}...
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card className="max-w-lg w-full border-green-500/30 bg-gradient-to-br from-green-950/30 to-background">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
        <CardTitle className="text-2xl text-green-400">Loading...</CardTitle>
      </CardHeader>
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-green-950/20 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
