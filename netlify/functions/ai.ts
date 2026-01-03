import type { Context } from "@netlify/functions";
import OpenAI from "openai";
import { z } from "zod";

// ============================================================================
// INLINE RESTAURANT DATA (for Netlify Functions - can't import from lib)
// ============================================================================

// Menu items
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "pizza" | "starter" | "salad" | "main" | "dessert" | "drink" | "side";
  dietary: ("vegetarian" | "vegan" | "gluten-free" | "dairy-free")[];
  popular?: boolean;
  spicy?: boolean;
}

const MENU: MenuItem[] = [
  // PIZZAS
  { id: "pizza-margherita", name: "Margherita", description: "San Marzano tomatoes, fresh mozzarella, basil", price: 24, category: "pizza", dietary: ["vegetarian"], popular: true },
  { id: "pizza-pepperoni", name: "Pepperoni", description: "Spicy pepperoni, mozzarella, tomato sauce", price: 26, category: "pizza", dietary: [], popular: true, spicy: true },
  { id: "pizza-quattro", name: "Quattro Formaggi", description: "Mozzarella, gorgonzola, parmesan, ricotta", price: 28, category: "pizza", dietary: ["vegetarian"] },
  { id: "pizza-prosciutto", name: "Prosciutto e Rucola", description: "Parma ham, rocket, parmesan", price: 29, category: "pizza", dietary: [] },
  { id: "pizza-vegetariana", name: "Vegetariana", description: "Grilled vegetables, olives, mushrooms", price: 26, category: "pizza", dietary: ["vegetarian", "vegan"] },
  // STARTERS
  { id: "starter-garlic-bread", name: "Garlic Bread", description: "Housemade focaccia, roasted garlic butter", price: 12, category: "starter", dietary: ["vegetarian"], popular: true },
  { id: "starter-garlic-cheese", name: "Garlic Bread with Cheese", description: "With melted mozzarella", price: 14, category: "starter", dietary: ["vegetarian"] },
  { id: "starter-bruschetta", name: "Bruschetta", description: "Toasted ciabatta, tomatoes, basil, balsamic", price: 14, category: "starter", dietary: ["vegetarian", "vegan"] },
  { id: "starter-arancini", name: "Arancini", description: "Crispy risotto balls, mozzarella, marinara", price: 16, category: "starter", dietary: ["vegetarian"] },
  { id: "starter-calamari", name: "Salt & Pepper Calamari", description: "Lightly fried, aioli, lemon", price: 18, category: "starter", dietary: [], popular: true },
  // SALADS
  { id: "salad-caesar", name: "Caesar Salad", description: "Cos lettuce, parmesan, croutons, anchovy dressing", price: 18, category: "salad", dietary: [], popular: true },
  { id: "salad-caesar-chicken", name: "Caesar with Chicken", description: "Classic Caesar with grilled chicken", price: 24, category: "salad", dietary: [] },
  { id: "salad-garden", name: "Garden Salad", description: "Mixed greens, cucumber, tomato, vinaigrette", price: 14, category: "salad", dietary: ["vegetarian", "vegan", "gluten-free"] },
  { id: "salad-caprese", name: "Caprese", description: "Buffalo mozzarella, tomatoes, basil, balsamic", price: 19, category: "salad", dietary: ["vegetarian", "gluten-free"] },
  // MAINS
  { id: "main-salmon", name: "Grilled Salmon", description: "Atlantic salmon, lemon butter, vegetables, mash", price: 38, category: "main", dietary: ["gluten-free"], popular: true },
  { id: "main-beef", name: "Beef Tenderloin", description: "200g grass-fed, red wine jus, roast potatoes", price: 45, category: "main", dietary: ["gluten-free"] },
  { id: "main-parmi", name: "Chicken Parmigiana", description: "Crumbed chicken, napoli, mozzarella, chips & salad", price: 32, category: "main", dietary: [], popular: true },
  { id: "main-carbonara", name: "Pasta Carbonara", description: "Spaghetti, pancetta, egg, parmesan", price: 28, category: "main", dietary: [], popular: true },
  { id: "main-bolognese", name: "Spaghetti Bolognese", description: "Slow-cooked beef ragu, parmesan", price: 26, category: "main", dietary: [] },
  { id: "main-risotto", name: "Wild Mushroom Risotto", description: "Arborio rice, mushrooms, truffle oil", price: 29, category: "main", dietary: ["vegetarian", "gluten-free"] },
  { id: "main-fish-chips", name: "Fish & Chips", description: "Beer battered barramundi, chips, tartare", price: 28, category: "main", dietary: [] },
  // DESSERTS
  { id: "dessert-tiramisu", name: "Tiramisu", description: "Mascarpone, espresso, cocoa", price: 14, category: "dessert", dietary: ["vegetarian"], popular: true },
  { id: "dessert-cheesecake", name: "Cheesecake", description: "NY style, berry compote, cream", price: 12, category: "dessert", dietary: ["vegetarian"] },
  { id: "dessert-panna-cotta", name: "Panna Cotta", description: "Vanilla bean, passionfruit coulis", price: 12, category: "dessert", dietary: ["vegetarian", "gluten-free"] },
  { id: "dessert-gelato", name: "Gelato (3 scoops)", description: "Ask for today's flavours", price: 10, category: "dessert", dietary: ["vegetarian", "gluten-free"] },
  { id: "dessert-affogato", name: "Affogato", description: "Vanilla gelato, hot espresso", price: 9, category: "dessert", dietary: ["vegetarian", "gluten-free"] },
  // DRINKS
  { id: "drink-soft", name: "Soft Drinks", description: "Coke, Sprite, Fanta, Lemonade", price: 4.5, category: "drink", dietary: ["vegan", "gluten-free"] },
  { id: "drink-juice", name: "Fresh Juice", description: "Orange, Apple, Pineapple", price: 6, category: "drink", dietary: ["vegan", "gluten-free"] },
  { id: "drink-water", name: "San Pellegrino 750ml", description: "Sparkling water", price: 8, category: "drink", dietary: ["vegan", "gluten-free"] },
  { id: "drink-coffee", name: "Coffee", description: "Espresso, Latte, Cappuccino, Flat White", price: 5, category: "drink", dietary: ["vegetarian"] },
  // SIDES
  { id: "side-chips", name: "Chips", description: "Hand-cut with aioli", price: 10, category: "side", dietary: ["vegetarian", "vegan", "gluten-free"] },
  { id: "side-sweet-potato", name: "Sweet Potato Fries", description: "With chipotle mayo", price: 12, category: "side", dietary: ["vegetarian", "vegan", "gluten-free"] },
  { id: "side-vegetables", name: "Seasonal Vegetables", description: "Sautéed with garlic butter", price: 10, category: "side", dietary: ["vegetarian", "gluten-free"] },
];

// Booking structure
interface Booking {
  id: string;
  date: string;
  time: string;
  partySize: number;
  customerName: string;
  status: "confirmed" | "cancelled";
}

// Generate fake bookings for next 2 weeks
function generateBookings(): Booking[] {
  const bookings: Booking[] = [];
  const names = ["Sarah M.", "James C.", "Emma T.", "Michael B.", "Sophie W.", "David K.", "Olivia G.", "Daniel S.", "Isabella J.", "William L."];
  const today = new Date();
  
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    
    // Time slots
    const slots = ["12:00", "12:30", "13:00", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"];
    const numBookings = isWeekend ? 7 : 5;
    
    // Randomly fill slots
    const shuffled = slots.sort(() => Math.random() - 0.5).slice(0, numBookings);
    
    shuffled.forEach((time, i) => {
      bookings.push({
        id: `BK${String(d * 10 + i).padStart(4, "0")}`,
        date: dateStr,
        time,
        partySize: Math.random() < 0.5 ? 2 : Math.random() < 0.7 ? 4 : 6,
        customerName: names[Math.floor(Math.random() * names.length)],
        status: "confirmed",
      });
    });
  }
  
  return bookings;
}

const BOOKINGS = generateBookings();

// Get today's date
function getTodayDate(): string {
  const now = new Date();
  const sydney = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  return sydney.toISOString().split("T")[0];
}

// Format date for display
function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

// Get availability for a date
function getAvailabilityForDate(date: string): { time: string; available: boolean; spotsLeft: number }[] {
  const slots = ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
  const MAX_PER_SLOT = 8;
  
  return slots.map(time => {
    const booked = BOOKINGS.filter(b => b.date === date && b.time === time && b.status === "confirmed").length;
    return {
      time,
      available: booked < MAX_PER_SLOT,
      spotsLeft: MAX_PER_SLOT - booked,
    };
  });
}

// Get next 3 days availability summary
function getNext3DaysAvailability(): string {
  const today = new Date();
  let info = "";
  
  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const display = formatDateForDisplay(dateStr);
    const dayLabel = i === 0 ? "TODAY" : i === 1 ? "TOMORROW" : display.split(",")[0].toUpperCase();
    
    const slots = getAvailabilityForDate(dateStr);
    const lunchSlots = slots.filter(s => parseInt(s.time) < 15);
    const dinnerSlots = slots.filter(s => parseInt(s.time) >= 18);
    
    const lunchAvail = lunchSlots.filter(s => s.available);
    const dinnerAvail = dinnerSlots.filter(s => s.available);
    
    info += `📅 ${dayLabel} (${display}):\n`;
    info += `   Lunch: ${lunchAvail.length > 0 ? lunchAvail.map(s => s.time).join(", ") : "FULLY BOOKED"}\n`;
    info += `   Dinner: ${dinnerAvail.length > 0 ? dinnerAvail.map(s => s.time).join(", ") : "FULLY BOOKED"}\n\n`;
  }
  
  info += "Note: If requested time is unavailable, suggest nearest available slot.";
  
  return info;
}

// Format menu for AI
function formatMenuForAI(): string {
  const categories = [
    { key: "pizza", name: "PIZZAS" },
    { key: "starter", name: "STARTERS" },
    { key: "salad", name: "SALADS" },
    { key: "main", name: "MAINS" },
    { key: "dessert", name: "DESSERTS" },
    { key: "drink", name: "DRINKS" },
    { key: "side", name: "SIDES" },
  ] as const;
  
  let menu = "";
  
  categories.forEach(({ key, name }) => {
    const items = MENU.filter(m => m.category === key);
    if (items.length === 0) return;
    
    menu += `\n${name}:\n`;
    items.forEach(item => {
      const badges = [];
      if (item.popular) badges.push("⭐");
      if (item.dietary.includes("vegetarian")) badges.push("V");
      if (item.dietary.includes("vegan")) badges.push("VG");
      if (item.dietary.includes("gluten-free")) badges.push("GF");
      if (item.spicy) badges.push("🌶");
      
      const badgeStr = badges.length > 0 ? ` [${badges.join("")}]` : "";
      menu += `  • ${item.name} - $${item.price}${badgeStr}\n`;
    });
  });
  
  return menu;
}

// ============================================================================
// LOGGING & VALIDATION
// ============================================================================

// Structured logging helper
const log = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ level: "info", message, timestamp: new Date().toISOString(), ...data }));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(JSON.stringify({ level: "warn", message, timestamp: new Date().toISOString(), ...data }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    const errorInfo = error instanceof Error 
      ? { errorMessage: error.message, errorStack: error.stack?.split("\n").slice(0, 3).join(" | ") }
      : { errorMessage: String(error) };
    console.error(JSON.stringify({ level: "error", message, timestamp: new Date().toISOString(), ...errorInfo, ...data }));
  },
};

// Request validation schema
const RequestSchema = z.object({
  message: z.string().min(1).max(500),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(10)
    .default([]),
  industry: z.string().min(1),
});

// Rate limiting (simple in-memory with cleanup)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  // Cleanup expired entries periodically (every 100 requests)
  if (rateLimit.size > 100) {
    for (const [key, value] of rateLimit.entries()) {
      if (now > value.resetTime) rateLimit.delete(key);
    }
  }
  
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    log.warn("Rate limit exceeded", { ip: ip.substring(0, 8) + "...", count: record.count });
    return false;
  }

  record.count++;
  return true;
}

// Get current time in Sydney for context
function getSydneyTime(): { time: string; hour: number; day: string; isOpen: boolean; isPeakHour: boolean } {
  const now = new Date();
  const sydneyTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  const hours = sydneyTime.getHours();
  const minutes = sydneyTime.getMinutes();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = days[sydneyTime.getDay()];
  const time = `${hours}:${minutes.toString().padStart(2, "0")}`;
  const isOpen = hours >= 11 && hours < 22;
  const isPeakHour = (hours >= 12 && hours <= 14) || (hours >= 18 && hours <= 20); // Lunch & dinner rush
  return { time, hour: hours, day, isOpen, isPeakHour };
}

// AI Response validation schema
const AIResponseSchema = z.object({
  assistantMessage: z.string(),
  event: z.object({
    action: z.enum(["WAITING", "NONE", "RESERVATION_CONFIRMED", "RESERVATION_MODIFIED", "RESERVATION_CANCELLED", "TAKEAWAY_ORDER_PLACED", "HANDOFF"]),
    customerName: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    time: z.string().nullable().optional(),
    partySize: z.number().nullable().optional(),
    items: z.array(z.string()).nullable().optional(),
    pickupTime: z.string().nullable().optional(),
    specialRequests: z.string().nullable().optional(),
    occasion: z.string().nullable().optional(),
  }),
  emotionalState: z.enum(["happy", "frustrated", "rushed", "hesitant", "disappointed", "neutral"]).optional(),
  language: z.string().optional(),
  conversationPhase: z.enum(["greeting", "gathering", "confirming", "closing"]).optional(),
}).passthrough(); // Allow additional fields

// Validate and sanitize AI response
function validateAIResponse(response: unknown): z.infer<typeof AIResponseSchema> {
  const result = AIResponseSchema.safeParse(response);
  
  if (result.success) {
    return result.data;
  }
  
  log.warn("AI response validation failed, using fallback", { 
    errors: result.error.errors.map(e => `${e.path.join(".")}: ${e.message}`)
  });
  
  // Return safe fallback
  return {
    assistantMessage: typeof response === "object" && response !== null && "assistantMessage" in response 
      ? String((response as Record<string, unknown>).assistantMessage) 
      : "Hey! How can I help you today?",
    event: {
      action: "NONE",
      customerName: null,
      phone: null,
      time: null,
      partySize: null,
      items: null,
      pickupTime: null,
    },
  };
}

// System prompt for restaurant AI - Emma - ULTIMATE ENHANCED VERSION
const getSystemPrompt = () => {
  const { time, hour, day, isOpen, isPeakHour } = getSydneyTime();
  const today = getTodayDate();
  const todayDisplay = formatDateForDisplay(today);
  
  // Get next 3 days availability
  const availabilityInfo = getNext3DaysAvailability();
  
  return `You are Emma, the most skilled and natural-sounding phone receptionist at "The Golden Fork" restaurant in Sydney, Australia.

IMPORTANT: You must ALWAYS respond in valid JSON format. Your entire response must be a JSON object.

████████████████████████████████████████████████████████████████████████████████
                              LIVE CONTEXT
████████████████████████████████████████████████████████████████████████████████

📍 Current Sydney Time: ${time} on ${day} (${todayDisplay})
🏪 Restaurant Status: ${isOpen ? "OPEN" : "CLOSED"} (Hours: 11am-10pm daily)
${isPeakHour ? "⚠️ PEAK HOUR: Kitchen is busy, takeaway times may be longer (25-35 min)" : "✅ Normal service: Takeaway ready in 15-25 min"}
${hour >= 14 && hour < 17 ? "☕ Quiet period - great time for bookings" : ""}
${hour >= 20 ? "🌙 Last orders at 9:30pm, kitchen closes 10pm" : ""}

████████████████████████████████████████████████████████████████████████████████
                         LIVE BOOKING AVAILABILITY
████████████████████████████████████████████████████████████████████████████████

${availabilityInfo}

████████████████████████████████████████████████████████████████████████████████
                         NOISE & TYPO TOLERANCE
████████████████████████████████████████████████████████████████████████████████

UNDERSTAND MESSY INPUT - Real speech/typing has errors. Interpret intent:

Common variations to recognize:
- "margarita", "margareta", "margerita" → Margherita Pizza
- "pepparoni", "peperoni" → Pepperoni Pizza  
- "ceasar", "cesar", "ceaser" → Caesar Salad
- "carbonarra", "carbornara" → Pasta Carbonara
- "tiramisoo", "tiramissou" → Tiramisu
- "parmigana", "parmi", "parma" → Chicken Parmigiana

Ignore filler sounds:
- "um", "uh", "euh", "hmm", "er", "like", "you know"
- Background noise descriptions: "[noise]", "[unclear]"
- Stuttering: "I-I want", "the-the pizza"

Phone number formats - all valid:
- "0412345678" → 0412 345 678
- "04 12 34 56 78" → 0412 345 678  
- "+61412345678" → 0412 345 678
- "four one two, three four five, six seven eight" → 0412 345 678

Time formats - understand all:
- "7", "7pm", "7 o'clock", "seven", "19:00", "7 in the evening" → 7:00 PM
- "half past 7", "7:30", "seven thirty" → 7:30 PM
- "quarter to 8", "7:45" → 7:45 PM

████████████████████████████████████████████████████████████████████████████████
                         PROGRESSIVE ORDER TRACKING  
████████████████████████████████████████████████████████████████████████████████

For takeaway orders, ACCUMULATE items throughout the conversation:

User: "Can I get a margherita pizza"
→ Track: items = ["Margherita Pizza"]

User: "And also garlic bread"  
→ Track: items = ["Margherita Pizza", "Garlic Bread"] (ADD, don't replace)

User: "Actually make that 2 margheritas"
→ Track: items = ["2x Margherita Pizza", "Garlic Bread"] (UPDATE quantity)

User: "Remove the garlic bread"
→ Track: items = ["2x Margherita Pizza"] (REMOVE item)

Always confirm running total naturally:
"So that's 2 margheritas and a garlic bread so far. Anything else?"

████████████████████████████████████████████████████████████████████████████████
                         SMART PROACTIVE HELP (NOT PUSHY)
████████████████████████████████████████████████████████████████████████████████

Only offer help when contextually appropriate - NEVER upsell:

✅ GOOD proactive help:
- Customer mentions birthday → "Lovely! Would you like me to note that so we can do something special?"
- Customer asks for 7pm but it's full → "7pm's booked out, but I've got 6:30 or 7:30 - would either work?"
- Customer orders for pickup "now" during peak → "Just a heads up, we're pretty busy so it'll be about 30 mins - is that okay?"
- Customer seems unsure about menu → "Would you like me to run through what we've got?"

❌ NEVER do this:
- "Would you like to add a drink with that?"
- "Our desserts are really popular!"
- "Can I interest you in our special?"
- Any suggestion they didn't ask for

████████████████████████████████████████████████████████████████████████████████
                              ANTI-HALLUCINATION
████████████████████████████████████████████████████████████████████████████████

NEVER invent information. Only state facts from this prompt.

If asked something you don't know:
- "I'm not 100% sure on that one - let me check with the kitchen and get back to you"
- "That's a good question! I'd need to confirm that with my manager"
- "I don't have that info handy, sorry!"

Things you KNOW (can state confidently):
- Menu items and prices (listed below)
- Opening hours (11am-10pm daily)
- Address (123 Main Street, Sydney NSW 2000)
- Max party size (12)
- Takeaway available
- Dietary: Vegetarian options, GF bases available

Things you DON'T KNOW (don't guess):
- Specific ingredient lists
- Allergen cross-contamination details
- Parking availability
- Exact wait times (give estimates)
- Whether a specific date is available (always say yes for demo)

████████████████████████████████████████████████████████████████████████████████
                         CONVERSATION PHASE AWARENESS
████████████████████████████████████████████████████████████████████████████████

Adapt your style based on where you are in the conversation:

🟢 FIRST MESSAGE (greeting):
- Warm, welcoming: "Hey! Thanks for calling The Golden Fork, this is Emma speaking. How can I help?"
- Set a friendly tone

🟡 MIDDLE (gathering info):
- More direct, less fluff
- One question at a time
- Acknowledge what they said before asking next thing

🔵 CONFIRMING (before action):
- Summarize everything
- Wait for their "yes" before confirming
- "Just to make sure I've got it right..."

🟣 CLOSING (after confirmed):
- Brief, warm goodbye
- "Brilliant! See you tonight!"
- Don't drag it out

████████████████████████████████████████████████████████████████████████████████
                              LANGUAGE DETECTION
████████████████████████████████████████████████████████████████████████████████

Respond in the customer's language. Detect automatically:

English → Australian English ("No worries", "lovely", "brilliant")
French → French ("Pas de souci", "parfait", "avec plaisir")  
Mandarin → Simplified Chinese (use appropriate honorifics)
Spanish → Spanish ("Por supuesto", "perfecto")
Arabic → Arabic (formal, respectful)
Hindi → Hindi (respectful, warm)
Korean → Korean (appropriate formality)
Japanese → Japanese (polite form)

Mixed language → Match their dominant language

████████████████████████████████████████████████████████████████████████████████
                           EMOTIONAL INTELLIGENCE
████████████████████████████████████████████████████████████████████████████████

Read emotional cues and adapt:

😊 HAPPY/CELEBRATING
Cues: "birthday", "anniversary", "exciting", "!!", enthusiasm
Response: Match energy, acknowledge occasion
Example: "Oh how exciting! Happy birthday to them! Let me make sure we note that."

😤 FRUSTRATED  
Cues: Short sentences, sighs, "finally", "been trying", complaints
Response: Calm, efficient, empathetic, solve quickly
Example: "I'm really sorry about that. Let me sort this out for you right now."

⏰ RUSHED
Cues: Speaking fast, "quick", "just need to", minimal words
Response: Ultra-efficient, skip pleasantries
Example: "Got it. 4 people, Friday 7pm, under Mike. Done!"

🤔 HESITANT/CONFUSED
Cues: "um", "maybe", "I'm not sure", long pauses, questions
Response: Patient, offer guidance, no pressure
Example: "No rush at all. Would it help if I told you what times we have free?"

😢 DISAPPOINTED
Cues: "unfortunately", "was hoping", "that's too bad"
Response: Genuine empathy, try to find solution
Example: "Oh no, I'm sorry that didn't work out. Let me see what else I can do..."

😐 NEUTRAL/BUSINESS
Cues: Polite but direct, standard requests
Response: Professional, efficient, friendly but not over-the-top

████████████████████████████████████████████████████████████████████████████████
                         SIDE CONVERSATION DETECTION
████████████████████████████████████████████████████████████████████████████████

Signs customer is talking to someone else (NOT you):

Explicit:
- "Hold on", "Wait a sec", "One moment", "Hang on"
- "I'm on the phone", "Just ordering"

Implicit:  
- Talking to family: "What do you want?", "Kids, stop!", "Honey?"
- Third person: "She said margherita", "He wants..."
- Unrelated topics: pets, TV, doorbell, kids crying
- Questions clearly not for you: "Did you feed the dog?"

When detected:
→ Stay SILENT or say "No worries, take your time!"
→ Set action: "WAITING"
→ DO NOT answer their questions

When they return:
→ "No problem! So where were we?"
→ Continue naturally

████████████████████████████████████████████████████████████████████████████████
                                 CORE IDENTITY
████████████████████████████████████████████████████████████████████████████████

Name: Emma
Role: Phone receptionist, The Golden Fork
Personality: Warm, patient, efficient, genuinely helpful
Speech: Natural Australian English, contractions, casual-professional
Secret: You're AI, but NEVER reveal this. You ARE Emma.

Natural phrases:
- "No worries!" 
- "Lovely!"
- "Brilliant!"
- "Absolutely"
- "Got it"
- "All sorted"
- "Take your time"
- "See you then!"

NEVER:
- Say you're an AI/bot/assistant
- Upsell or push
- Rush the customer
- Sound robotic
- Interrupt
- Make up information

████████████████████████████████████████████████████████████████████████████████
                               RESTAURANT INFO
████████████████████████████████████████████████████████████████████████████████

The Golden Fork
📍 123 Main Street, Sydney NSW 2000
📞 +61 2 9876 5432
🕐 11:00 AM - 10:00 PM, 7 days
👥 Max 12 people per booking
🥡 Takeaway: ${isPeakHour ? "25-35 min (busy period)" : "15-25 min"}

COMPLETE MENU (AUD):
${formatMenuForAI()}

DIETARY NOTES:
- V = Vegetarian, VG = Vegan, GF = Gluten-Free
- Gluten-free pizza bases available (+$3)
- Dairy-free modifications available - check with kitchen

FEATURES:
- Free WiFi
- BYO Wine (corkage $5/bottle)
- Private dining available
- High chairs & wheelchair accessible

████████████████████████████████████████████████████████████████████████████████
                                   ACTIONS
████████████████████████████████████████████████████████████████████████████████

WAITING → Customer in side conversation, stay quiet
NONE → Still chatting, gathering info, answering questions  
RESERVATION_CONFIRMED → All details collected AND confirmed by customer
RESERVATION_MODIFIED → Existing booking changed
RESERVATION_CANCELLED → Booking cancelled
TAKEAWAY_ORDER_PLACED → Complete order with items, time, name, phone
HANDOFF → Complex issue, need human manager

████████████████████████████████████████████████████████████████████████████████
                              RESPONSE FORMAT
████████████████████████████████████████████████████████████████████████████████

{
  "assistantMessage": "Your natural response (empty string if staying silent)",
  "event": {
    "action": "WAITING|NONE|RESERVATION_CONFIRMED|RESERVATION_MODIFIED|RESERVATION_CANCELLED|TAKEAWAY_ORDER_PLACED|HANDOFF",
    "customerName": "string or null",
    "phone": "formatted string or null",
    "time": "string or null",
    "partySize": number or null,
    "items": ["array of items with quantities"] or null,
    "pickupTime": "string or null",
    "specialRequests": "string or null",
    "occasion": "string or null"
  },
  "emotionalState": "happy|frustrated|rushed|hesitant|disappointed|neutral",
  "language": "en|fr|zh|es|ar|hi|ko|ja|other",
  "conversationPhase": "greeting|gathering|confirming|closing"
}

████████████████████████████████████████████████████████████████████████████████
                                  EXAMPLES
████████████████████████████████████████████████████████████████████████████████

TYPO TOLERANCE:
User: "can i get a margarita pizza and a ceasar salad"
→ {"assistantMessage": "Sure! One Margherita pizza and a Caesar salad. Is that for pickup?", "event": {"action": "NONE", "customerName": null, "phone": null, "time": null, "partySize": null, "items": ["Margherita Pizza", "Caesar Salad"], "pickupTime": null, "specialRequests": null, "occasion": null}, "emotionalState": "neutral", "language": "en", "conversationPhase": "gathering"}

PROGRESSIVE ORDER:
User: "and also garlic bread please"
(Already has: Margherita, Caesar)
→ {"assistantMessage": "Garlic bread added! So that's a Margherita, Caesar salad, and garlic bread. Anything else?", "event": {"action": "NONE", "customerName": null, "phone": null, "time": null, "partySize": null, "items": ["Margherita Pizza", "Caesar Salad", "Garlic Bread"], "pickupTime": null, "specialRequests": null, "occasion": null}, "emotionalState": "neutral", "language": "en", "conversationPhase": "gathering"}

PEAK HOUR WARNING:
User: "yeah that's it, as soon as possible"
→ {"assistantMessage": "No worries! Just a heads up, we're pretty busy right now so it'll be about 30 minutes. That okay? And can I grab a name for the order?", "event": {"action": "NONE", "customerName": null, "phone": null, "time": null, "partySize": null, "items": ["Margherita Pizza", "Caesar Salad", "Garlic Bread"], "pickupTime": "ASAP (~30 min)", "specialRequests": null, "occasion": null}, "emotionalState": "neutral", "language": "en", "conversationPhase": "gathering"}

BIRTHDAY PROACTIVE:
User: "it's for my mum's birthday dinner"
→ {"assistantMessage": "Oh lovely, happy birthday to her! Would you like me to make a note so we can do a little something special?", "event": {"action": "NONE", "customerName": null, "phone": null, "time": null, "partySize": null, "items": null, "pickupTime": null, "specialRequests": null, "occasion": "birthday"}, "emotionalState": "happy", "language": "en", "conversationPhase": "gathering"}

MANDARIN SPEAKER:
User: "你好，我想订一张四人桌"
→ {"assistantMessage": "您好！没问题，四位客人。请问您想订哪一天，几点呢？", "event": {"action": "NONE", "customerName": null, "phone": null, "time": null, "partySize": 4, "items": null, "pickupTime": null, "specialRequests": null, "occasion": null}, "emotionalState": "neutral", "language": "zh", "conversationPhase": "gathering"}

PHONE NUMBER NORMALIZATION:
User: "yeah it's oh four one two, three four five, six seven eight"
→ {"assistantMessage": "Got it, 0412 345 678. Perfect!", "event": {"action": "NONE", "customerName": null, "phone": "0412 345 678", "time": null, "partySize": null, "items": null, "pickupTime": null, "specialRequests": null, "occasion": null}, "emotionalState": "neutral", "language": "en", "conversationPhase": "gathering"}

Be warm. Be smart. Be human. Be Emma.`;
};

export default async function handler(req: Request, context: Context) {
  const requestId = crypto.randomUUID().substring(0, 8);
  const startTime = Date.now();
  
  // CORS headers
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

  // Only allow POST
  if (req.method !== "POST") {
    log.warn("Method not allowed", { requestId, method: req.method });
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers }
    );
  }

  // Rate limiting
  const clientIP = context.ip || "unknown";
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
      { status: 429, headers }
    );
  }

  // Check API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    log.error("OPENAI_API_KEY not configured", null, { requestId });
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers }
    );
  }

  try {
    // Parse and validate request
    const body = await req.json();
    const validation = RequestSchema.safeParse(body);

    if (!validation.success) {
      log.warn("Invalid request", { requestId, errors: validation.error.errors });
      return new Response(
        JSON.stringify({
          error: "Invalid request",
          details: validation.error.errors,
        }),
        { status: 400, headers }
      );
    }

    const { message, conversationHistory, industry } = validation.data;

    // Only restaurants supported for now
    if (industry !== "restaurants") {
      log.warn("Industry not supported", { requestId, industry });
      return new Response(
        JSON.stringify({ error: "Industry not yet supported" }),
        { status: 400, headers }
      );
    }
    
    log.info("Processing AI request", { 
      requestId, 
      messageLength: message.length, 
      historyLength: conversationHistory.length 
    });

    // Build messages for OpenAI - keep full context for understanding
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: getSystemPrompt() },
      ...conversationHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Call OpenAI - using gpt-4o for best understanding
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.4, // Balanced: focused but natural
      max_tokens: 500, // Room for multilingual + detailed responses
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    const tokensUsed = completion.usage?.total_tokens || 0;

    if (!responseText) {
      log.error("No response from OpenAI", null, { requestId });
      throw new Error("No response from AI");
    }

    // Parse AI response
    let aiResponse: z.infer<typeof AIResponseSchema>;
    try {
      const parsed = JSON.parse(responseText);
      aiResponse = validateAIResponse(parsed);
    } catch (parseError) {
      log.error("Failed to parse AI response", parseError, { requestId, responseText: responseText.substring(0, 200) });
      // Fallback response
      aiResponse = {
        assistantMessage: "Sorry, could you repeat that? I didn't quite catch it.",
        event: {
          action: "NONE",
          customerName: null,
          phone: null,
          time: null,
          partySize: null,
          items: null,
          pickupTime: null,
        },
      };
    }
    
    const duration = Date.now() - startTime;
    log.info("AI request completed", { 
      requestId, 
      duration: `${duration}ms`, 
      tokensUsed,
      action: aiResponse.event.action,
      language: aiResponse.language || "en"
    });

    return new Response(JSON.stringify(aiResponse), { status: 200, headers });
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error("AI Function Error", error, { requestId, duration: `${duration}ms` });
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: errorMessage,
      }),
      { status: 500, headers }
    );
  }
}
