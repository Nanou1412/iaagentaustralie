import type { Context } from "@netlify/functions";
import Stripe from "stripe";

// ============================================================================
// STRIPE CHECKOUT SESSION CREATOR
// ============================================================================

// Pricing configuration (in cents for Stripe)
const PRODUCTS = {
  // One-time setup fee
  setup: {
    priceId: process.env.STRIPE_PRICE_SETUP || "",
    name: "AI Agent Setup",
    description: "One-time setup and configuration of your AI phone agent",
    amount: 39000, // $390 AUD
    type: "one_time" as const,
  },
  // Weekly subscription
  weekly: {
    priceId: process.env.STRIPE_PRICE_WEEKLY || "",
    name: "AI Agent Weekly",
    description: "Weekly AI phone agent service",
    amount: 6990, // $69.90 AUD per week
    type: "recurring" as const,
    interval: "week" as const,
  },
};

// Structured logging
const log = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: "info", message, timestamp: new Date().toISOString(), ...data }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    const errorInfo = error instanceof Error
      ? { errorMessage: error.message }
      : { errorMessage: String(error) };
    console.error(JSON.stringify({ level: "error", message, timestamp: new Date().toISOString(), ...errorInfo, ...data }));
  },
};

export default async function handler(req: Request, context: Context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  // Check Stripe key
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    log.error("STRIPE_SECRET_KEY not configured");
    return new Response(
      JSON.stringify({ error: "Payment system not configured" }),
      { status: 500, headers }
    );
  }

  try {
    const body = await req.json();
    const { planType, customerEmail, businessName, industry } = body as {
      planType: "setup_only" | "setup_weekly";
      customerEmail?: string;
      businessName?: string;
      industry?: string;
    };

    if (!planType || !["setup_only", "setup_weekly"].includes(planType)) {
      return new Response(
        JSON.stringify({ error: "Invalid plan type" }),
        { status: 400, headers }
      );
    }

    log.info("Creating checkout session", { planType, industry });

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2024-12-18.acacia",
    });

    const siteUrl = process.env.URL || "https://iaagentaustralie.netlify.app";

    // Build line items based on plan
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (planType === "setup_only") {
      // One-time setup fee only
      if (PRODUCTS.setup.priceId) {
        lineItems.push({ price: PRODUCTS.setup.priceId, quantity: 1 });
      } else {
        // Create price on the fly if no price ID configured
        lineItems.push({
          price_data: {
            currency: "aud",
            product_data: {
              name: PRODUCTS.setup.name,
              description: PRODUCTS.setup.description,
            },
            unit_amount: PRODUCTS.setup.amount,
          },
          quantity: 1,
        });
      }
    } else {
      // Setup + Weekly subscription
      // First: one-time setup
      if (PRODUCTS.setup.priceId) {
        lineItems.push({ price: PRODUCTS.setup.priceId, quantity: 1 });
      } else {
        lineItems.push({
          price_data: {
            currency: "aud",
            product_data: {
              name: PRODUCTS.setup.name,
              description: PRODUCTS.setup.description,
            },
            unit_amount: PRODUCTS.setup.amount,
          },
          quantity: 1,
        });
      }

      // Second: weekly subscription
      if (PRODUCTS.weekly.priceId) {
        lineItems.push({ price: PRODUCTS.weekly.priceId, quantity: 1 });
      } else {
        lineItems.push({
          price_data: {
            currency: "aud",
            product_data: {
              name: PRODUCTS.weekly.name,
              description: PRODUCTS.weekly.description,
            },
            unit_amount: PRODUCTS.weekly.amount,
            recurring: {
              interval: "week",
            },
          },
          quantity: 1,
        });
      }
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: planType === "setup_only" ? "payment" : "subscription",
      line_items: lineItems,
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment/cancelled`,
      metadata: {
        planType,
        industry: industry || "unknown",
        businessName: businessName || "Not provided",
      },
      allow_promotion_codes: true,
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }

    // For subscriptions, set payment method types
    if (planType === "setup_weekly") {
      sessionParams.payment_method_types = ["card"];
      sessionParams.subscription_data = {
        metadata: {
          industry: industry || "unknown",
          businessName: businessName || "Not provided",
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    log.info("Checkout session created", { 
      sessionId: session.id,
      planType,
      url: session.url?.substring(0, 50) + "..."
    });

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id,
      }),
      { status: 200, headers }
    );

  } catch (error) {
    log.error("Checkout creation failed", error);
    
    const message = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session", details: message }),
      { status: 500, headers }
    );
  }
}
