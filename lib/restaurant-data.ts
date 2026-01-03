// Restaurant Database - The Golden Fork
// This simulates a real restaurant management system

// ============================================================================
// MENU - Complete restaurant menu with categories, prices, dietary info
// ============================================================================

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "pizza" | "starter" | "salad" | "main" | "dessert" | "drink" | "side";
  dietary: ("vegetarian" | "vegan" | "gluten-free" | "dairy-free")[];
  popular?: boolean;
  spicy?: boolean;
  available: boolean;
}

export const MENU: MenuItem[] = [
  // PIZZAS
  {
    id: "pizza-margherita",
    name: "Margherita",
    description: "San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil",
    price: 24,
    category: "pizza",
    dietary: ["vegetarian"],
    popular: true,
    available: true,
  },
  {
    id: "pizza-pepperoni",
    name: "Pepperoni",
    description: "Spicy pepperoni, mozzarella, tomato sauce, oregano",
    price: 26,
    category: "pizza",
    dietary: [],
    popular: true,
    spicy: true,
    available: true,
  },
  {
    id: "pizza-quattro-formaggi",
    name: "Quattro Formaggi",
    description: "Mozzarella, gorgonzola, parmesan, ricotta",
    price: 28,
    category: "pizza",
    dietary: ["vegetarian"],
    available: true,
  },
  {
    id: "pizza-prosciutto",
    name: "Prosciutto e Rucola",
    description: "Parma ham, rocket, parmesan shavings, cherry tomatoes",
    price: 29,
    category: "pizza",
    dietary: [],
    available: true,
  },
  {
    id: "pizza-vegetariana",
    name: "Vegetariana",
    description: "Grilled zucchini, eggplant, capsicum, mushrooms, olives",
    price: 26,
    category: "pizza",
    dietary: ["vegetarian", "vegan"],
    available: true,
  },

  // STARTERS
  {
    id: "starter-garlic-bread",
    name: "Garlic Bread",
    description: "Housemade focaccia, roasted garlic butter, herbs",
    price: 12,
    category: "starter",
    dietary: ["vegetarian"],
    popular: true,
    available: true,
  },
  {
    id: "starter-garlic-bread-cheese",
    name: "Garlic Bread with Cheese",
    description: "Garlic bread topped with melted mozzarella",
    price: 14,
    category: "starter",
    dietary: ["vegetarian"],
    available: true,
  },
  {
    id: "starter-bruschetta",
    name: "Bruschetta",
    description: "Toasted ciabatta, diced tomatoes, fresh basil, balsamic glaze",
    price: 14,
    category: "starter",
    dietary: ["vegetarian", "vegan"],
    available: true,
  },
  {
    id: "starter-arancini",
    name: "Arancini",
    description: "Crispy risotto balls filled with mozzarella, served with marinara",
    price: 16,
    category: "starter",
    dietary: ["vegetarian"],
    available: true,
  },
  {
    id: "starter-calamari",
    name: "Salt & Pepper Calamari",
    description: "Lightly fried calamari, aioli, lemon",
    price: 18,
    category: "starter",
    dietary: [],
    popular: true,
    available: true,
  },

  // SALADS
  {
    id: "salad-caesar",
    name: "Caesar Salad",
    description: "Cos lettuce, parmesan, croutons, anchovy dressing",
    price: 18,
    category: "salad",
    dietary: [],
    popular: true,
    available: true,
  },
  {
    id: "salad-caesar-chicken",
    name: "Caesar Salad with Chicken",
    description: "Classic Caesar with grilled chicken breast",
    price: 24,
    category: "salad",
    dietary: [],
    available: true,
  },
  {
    id: "salad-garden",
    name: "Garden Salad",
    description: "Mixed greens, cucumber, tomato, carrot, house vinaigrette",
    price: 14,
    category: "salad",
    dietary: ["vegetarian", "vegan", "gluten-free"],
    available: true,
  },
  {
    id: "salad-caprese",
    name: "Caprese Salad",
    description: "Buffalo mozzarella, vine tomatoes, fresh basil, aged balsamic",
    price: 19,
    category: "salad",
    dietary: ["vegetarian", "gluten-free"],
    available: true,
  },

  // MAINS
  {
    id: "main-salmon",
    name: "Grilled Salmon",
    description: "Atlantic salmon, lemon butter sauce, seasonal vegetables, mash",
    price: 38,
    category: "main",
    dietary: ["gluten-free"],
    popular: true,
    available: true,
  },
  {
    id: "main-beef-tenderloin",
    name: "Beef Tenderloin",
    description: "200g grass-fed tenderloin, red wine jus, roasted potatoes, greens",
    price: 45,
    category: "main",
    dietary: ["gluten-free"],
    available: true,
  },
  {
    id: "main-chicken-parmigiana",
    name: "Chicken Parmigiana",
    description: "Crumbed chicken breast, napoli sauce, mozzarella, chips & salad",
    price: 32,
    category: "main",
    dietary: [],
    popular: true,
    available: true,
  },
  {
    id: "main-carbonara",
    name: "Pasta Carbonara",
    description: "Spaghetti, pancetta, egg, parmesan, black pepper",
    price: 28,
    category: "main",
    dietary: [],
    popular: true,
    available: true,
  },
  {
    id: "main-bolognese",
    name: "Spaghetti Bolognese",
    description: "Slow-cooked beef ragu, parmesan, fresh herbs",
    price: 26,
    category: "main",
    dietary: [],
    available: true,
  },
  {
    id: "main-risotto-mushroom",
    name: "Wild Mushroom Risotto",
    description: "Arborio rice, mixed wild mushrooms, truffle oil, parmesan",
    price: 29,
    category: "main",
    dietary: ["vegetarian", "gluten-free"],
    available: true,
  },
  {
    id: "main-fish-chips",
    name: "Beer Battered Fish & Chips",
    description: "Barramundi, hand-cut chips, mushy peas, tartare sauce",
    price: 28,
    category: "main",
    dietary: [],
    available: true,
  },

  // DESSERTS
  {
    id: "dessert-tiramisu",
    name: "Tiramisu",
    description: "Classic Italian dessert, mascarpone, espresso, cocoa",
    price: 14,
    category: "dessert",
    dietary: ["vegetarian"],
    popular: true,
    available: true,
  },
  {
    id: "dessert-cheesecake",
    name: "New York Cheesecake",
    description: "Creamy cheesecake, berry compote, vanilla cream",
    price: 12,
    category: "dessert",
    dietary: ["vegetarian"],
    available: true,
  },
  {
    id: "dessert-panna-cotta",
    name: "Panna Cotta",
    description: "Vanilla bean panna cotta, passionfruit coulis",
    price: 12,
    category: "dessert",
    dietary: ["vegetarian", "gluten-free"],
    available: true,
  },
  {
    id: "dessert-gelato",
    name: "Gelato Selection",
    description: "3 scoops of housemade gelato (ask for today's flavours)",
    price: 10,
    category: "dessert",
    dietary: ["vegetarian", "gluten-free"],
    available: true,
  },
  {
    id: "dessert-affogato",
    name: "Affogato",
    description: "Vanilla gelato drowned in hot espresso",
    price: 9,
    category: "dessert",
    dietary: ["vegetarian", "gluten-free"],
    available: true,
  },

  // DRINKS
  {
    id: "drink-soft",
    name: "Soft Drinks",
    description: "Coke, Sprite, Fanta, Lemonade",
    price: 4.5,
    category: "drink",
    dietary: ["vegan", "gluten-free"],
    available: true,
  },
  {
    id: "drink-juice",
    name: "Fresh Juice",
    description: "Orange, Apple, or Pineapple",
    price: 6,
    category: "drink",
    dietary: ["vegan", "gluten-free"],
    available: true,
  },
  {
    id: "drink-water",
    name: "Sparkling Water",
    description: "San Pellegrino 750ml",
    price: 8,
    category: "drink",
    dietary: ["vegan", "gluten-free"],
    available: true,
  },
  {
    id: "drink-coffee",
    name: "Coffee",
    description: "Espresso, Long Black, Latte, Cappuccino, Flat White",
    price: 5,
    category: "drink",
    dietary: ["vegetarian"],
    available: true,
  },

  // SIDES
  {
    id: "side-chips",
    name: "Chips",
    description: "Hand-cut chips with aioli",
    price: 10,
    category: "side",
    dietary: ["vegetarian", "vegan", "gluten-free"],
    available: true,
  },
  {
    id: "side-sweet-potato",
    name: "Sweet Potato Fries",
    description: "Crispy sweet potato fries with chipotle mayo",
    price: 12,
    category: "side",
    dietary: ["vegetarian", "vegan", "gluten-free"],
    available: true,
  },
  {
    id: "side-vegetables",
    name: "Seasonal Vegetables",
    description: "Sautéed seasonal vegetables with garlic butter",
    price: 10,
    category: "side",
    dietary: ["vegetarian", "gluten-free"],
    available: true,
  },
];

// ============================================================================
// CALENDAR - Bookings for the next 2 weeks
// ============================================================================

export interface Booking {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  partySize: number;
  customerName: string;
  phone: string;
  status: "confirmed" | "cancelled" | "completed" | "no-show";
  specialRequests?: string;
  occasion?: string;
  tableNumber?: number;
}

// Generate dates for the next 2 weeks
function getNextTwoWeeksDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split("T")[0]);
  }
  
  return dates;
}

// Generate realistic bookings
function generateBookings(): Booking[] {
  const dates = getNextTwoWeeksDates();
  const bookings: Booking[] = [];
  
  const customerNames = [
    "Sarah Mitchell", "James Chen", "Emma Thompson", "Michael Brown",
    "Sophie Williams", "David Kim", "Olivia Garcia", "Daniel Smith",
    "Isabella Johnson", "William Lee", "Mia Anderson", "Alexander Taylor",
    "Charlotte Martin", "Benjamin White", "Amelia Harris", "Lucas Clark",
  ];
  
  const occasions = ["birthday", "anniversary", "business dinner", "date night", undefined, undefined, undefined];
  const specialRequests = [
    "Window seat please",
    "High chair needed",
    "Celebrating birthday - surprise cake",
    "Allergic to nuts",
    "Quiet table preferred",
    undefined, undefined, undefined, undefined,
  ];
  
  // Time slots (popular times have more bookings)
  const timeSlots = [
    { time: "12:00", weight: 2 },
    { time: "12:30", weight: 3 },
    { time: "13:00", weight: 3 },
    { time: "13:30", weight: 2 },
    { time: "18:00", weight: 2 },
    { time: "18:30", weight: 3 },
    { time: "19:00", weight: 5 }, // Most popular
    { time: "19:30", weight: 5 },
    { time: "20:00", weight: 4 },
    { time: "20:30", weight: 3 },
    { time: "21:00", weight: 2 },
  ];
  
  let bookingId = 1;
  
  dates.forEach((date, dateIndex) => {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    
    // More bookings on weekends
    const baseBookings = isWeekend ? 12 : 8;
    const variance = Math.floor(Math.random() * 4) - 2;
    const numBookings = Math.max(5, baseBookings + variance);
    
    // Select random time slots
    const selectedSlots = new Set<string>();
    
    for (let i = 0; i < numBookings && selectedSlots.size < timeSlots.length; i++) {
      // Weighted random selection
      const totalWeight = timeSlots.reduce((sum, slot) => sum + slot.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (const slot of timeSlots) {
        random -= slot.weight;
        if (random <= 0) {
          selectedSlots.add(slot.time);
          break;
        }
      }
    }
    
    // Create bookings for each slot
    selectedSlots.forEach((time) => {
      const partySize = Math.random() < 0.3 ? 2 : 
                        Math.random() < 0.5 ? 4 : 
                        Math.random() < 0.8 ? 6 : 
                        Math.floor(Math.random() * 4) + 8;
      
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      const occasion = occasions[Math.floor(Math.random() * occasions.length)];
      const specialRequest = specialRequests[Math.floor(Math.random() * specialRequests.length)];
      
      // Past dates are completed or no-show
      let status: Booking["status"] = "confirmed";
      if (dateIndex === 0) {
        // Today - some completed
        const hour = parseInt(time.split(":")[0]);
        const now = new Date();
        if (hour < now.getHours()) {
          status = Math.random() > 0.1 ? "completed" : "no-show";
        }
      }
      
      bookings.push({
        id: `BK${String(bookingId++).padStart(4, "0")}`,
        date,
        time,
        partySize,
        customerName,
        phone: `04${Math.floor(Math.random() * 100000000).toString().padStart(8, "0")}`,
        status,
        specialRequests: specialRequest,
        occasion,
        tableNumber: Math.floor(Math.random() * 20) + 1,
      });
    });
  });
  
  return bookings.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

// Export the generated bookings
export const BOOKINGS: Booking[] = generateBookings();

// ============================================================================
// AVAILABILITY HELPERS
// ============================================================================

export interface TimeSlotAvailability {
  time: string;
  displayTime: string;
  available: boolean;
  spotsLeft: number; // Approx number of tables available
  reason?: string;
}

const MAX_CONCURRENT_BOOKINGS = 8; // Restaurant capacity per time slot

export function getAvailabilityForDate(date: string): TimeSlotAvailability[] {
  const timeSlots = [
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00",
  ];
  
  const bookingsForDate = BOOKINGS.filter(b => b.date === date && b.status === "confirmed");
  
  return timeSlots.map((time) => {
    const bookingsAtTime = bookingsForDate.filter(b => b.time === time).length;
    const spotsLeft = MAX_CONCURRENT_BOOKINGS - bookingsAtTime;
    const available = spotsLeft > 0;
    
    // Convert to 12h format
    const hour = parseInt(time.split(":")[0]);
    const minutes = time.split(":")[1];
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayTime = `${displayHour}:${minutes} ${period}`;
    
    return {
      time,
      displayTime,
      available,
      spotsLeft: Math.max(0, spotsLeft),
      reason: !available ? "Fully booked" : undefined,
    };
  });
}

export function findNextAvailableSlot(date: string, preferredTime: string): TimeSlotAvailability | null {
  const availability = getAvailabilityForDate(date);
  
  // Find slots after preferred time
  const preferredIndex = availability.findIndex(s => s.time >= preferredTime);
  
  // Check forward from preferred time
  for (let i = preferredIndex; i < availability.length; i++) {
    if (availability[i].available) return availability[i];
  }
  
  // Check backward from preferred time
  for (let i = preferredIndex - 1; i >= 0; i--) {
    if (availability[i].available) return availability[i];
  }
  
  return null;
}

// ============================================================================
// RESTAURANT INFO
// ============================================================================

export const RESTAURANT_INFO = {
  name: "The Golden Fork",
  address: "123 Main Street, Sydney NSW 2000",
  phone: "+61 2 9876 5432",
  email: "hello@thegoldenfork.com.au",
  website: "www.thegoldenfork.com.au",
  
  hours: {
    monday: { open: "11:00", close: "22:00" },
    tuesday: { open: "11:00", close: "22:00" },
    wednesday: { open: "11:00", close: "22:00" },
    thursday: { open: "11:00", close: "22:00" },
    friday: { open: "11:00", close: "23:00" },
    saturday: { open: "11:00", close: "23:00" },
    sunday: { open: "11:00", close: "22:00" },
  },
  
  capacity: {
    maxPartySize: 12,
    totalSeats: 80,
    tablesPerSlot: MAX_CONCURRENT_BOOKINGS,
  },
  
  takeaway: {
    available: true,
    normalWaitTime: "15-25 min",
    peakWaitTime: "25-35 min",
    minimumOrder: 0,
  },
  
  dietary: {
    vegetarianOptions: true,
    veganOptions: true,
    glutenFreeOptions: true,
    dairyFreeOnRequest: true,
    nutFreeOnRequest: true,
    halalOnRequest: false,
  },
  
  features: [
    "Free WiFi",
    "BYO Wine (corkage $5/bottle)",
    "Private dining room available",
    "High chairs available",
    "Wheelchair accessible",
    "Outdoor seating",
  ],
};

// ============================================================================
// MENU HELPERS
// ============================================================================

export function getMenuByCategory(category: MenuItem["category"]): MenuItem[] {
  return MENU.filter(item => item.category === category && item.available);
}

export function getPopularItems(): MenuItem[] {
  return MENU.filter(item => item.popular && item.available);
}

export function searchMenu(query: string): MenuItem[] {
  const q = query.toLowerCase();
  return MENU.filter(item => 
    item.available && (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.includes(q)
    )
  );
}

export function getVegetarianOptions(): MenuItem[] {
  return MENU.filter(item => 
    item.available && 
    (item.dietary.includes("vegetarian") || item.dietary.includes("vegan"))
  );
}

export function getGlutenFreeOptions(): MenuItem[] {
  return MENU.filter(item => 
    item.available && item.dietary.includes("gluten-free")
  );
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

export function formatMenuForAI(): string {
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
    const items = getMenuByCategory(key);
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
      menu += `    ${item.description}\n`;
    });
  });
  
  return menu;
}

export function formatBookingsForDate(date: string): string {
  const bookings = BOOKINGS.filter(b => b.date === date && b.status === "confirmed");
  
  if (bookings.length === 0) {
    return "No bookings for this date.";
  }
  
  let output = `Bookings for ${date}:\n`;
  bookings.forEach(b => {
    output += `• ${b.time} - ${b.customerName} (${b.partySize} pax) [Table ${b.tableNumber}]`;
    if (b.occasion) output += ` - ${b.occasion}`;
    if (b.specialRequests) output += ` - Note: ${b.specialRequests}`;
    output += "\n";
  });
  
  return output;
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDateForDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}
