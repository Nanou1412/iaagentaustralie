// Application Constants

export const APP_NAME = "AI for Business";
export const APP_TAGLINE = "We save you time and recover lost revenue.";

export const MODE: "demo" | "prod" = "demo";

export const DEMO_RESTAURANT = {
  name: "The Golden Fork",
  phone: "+61 2 9876 5432",
  address: "123 Main Street, Sydney NSW 2000",
  openingHours: "11:00 AM - 10:00 PM",
  timezone: "Australia/Sydney",
};

export const AI_CONFIG = {
  maxInputLength: 500,
  maxConversationHistory: 10,
  rateLimit: {
    maxRequests: 20,
    windowMs: 60000, // 1 minute
  },
};

export const PRICING = {
  setup: 390,
  weekly: 69.9,
  currency: "AUD",
  setupDescription: "One-time setup & configuration",
  weeklyDescription: "Ongoing AI phone service",
  plans: {
    setup_only: {
      id: "setup_only",
      name: "Setup Only",
      description: "Get started with AI phone handling",
      price: 390,
      features: [
        "Full AI agent configuration",
        "Custom voice & personality",
        "Integration with your systems",
        "Training on your business",
        "Pay weekly fee when ready to go live",
      ],
      popular: false,
    },
    setup_weekly: {
      id: "setup_weekly",
      name: "Setup + Go Live",
      description: "Full setup and immediate activation",
      price: 390,
      weeklyPrice: 69.9,
      features: [
        "Everything in Setup Only",
        "Immediate activation",
        "24/7 AI call handling",
        "SMS confirmations",
        "Real-time dashboard",
        "Cancel anytime",
      ],
      popular: true,
    },
  },
};

export const HOME_INTRO_TEXT = `Hi there. I'm Emma, and I'll be taking care of your calls. When you're busy with customers or it's after hours, I step in — answering inquiries, booking reservations, and making sure no one slips through the cracks. Think of me as your most reliable team member, always ready, always professional.`;

export const HOME_LISTEN_TEXT = `Hey, I'm Emma. Nice to meet you. So here's the thing — I know how hectic things can get when you're running a business. Phones ringing off the hook, customers waiting, and somehow you're supposed to be everywhere at once. That's where I come in. I handle your calls with a smile — well, you know what I mean. I take reservations, answer questions, and if something's urgent, I make sure you know about it right away. I'm not here to complicate things. I just want to help you breathe a little easier and make sure every customer feels taken care of. Sound good? Let me show you how it works.`;

export const HOME_GREETING_NAME = "Emma";

export const FORBIDDEN_PHRASES = [
  "replace staff",
  "cut jobs",
  "remove employees",
  "cheaper than hiring",
  "automation to fire",
  "fire people",
  "layoffs",
  "reduce headcount",
];
