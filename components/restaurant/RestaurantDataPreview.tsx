"use client";

import { useState } from "react";
import { Calendar, Clock, Users, ChefHat, Flame, Leaf, Wheat, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietary: string[];
  popular?: boolean;
  spicy?: boolean;
}

interface TimeSlot {
  time: string;
  displayTime: string;
  bookings: number;
  available: boolean;
}

interface DayBookings {
  date: string;
  displayDate: string;
  dayLabel: string;
  slots: TimeSlot[];
}

// ============================================================================
// MOCK DATA (mirrors the server data)
// ============================================================================

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
];

// Generate booking calendar
function generateCalendar(): DayBookings[] {
  const days: DayBookings[] = [];
  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
    
    const slots: TimeSlot[] = [
      { time: "12:00", displayTime: "12:00 PM", bookings: 0, available: true },
      { time: "12:30", displayTime: "12:30 PM", bookings: 0, available: true },
      { time: "13:00", displayTime: "1:00 PM", bookings: 0, available: true },
      { time: "18:00", displayTime: "6:00 PM", bookings: 0, available: true },
      { time: "18:30", displayTime: "6:30 PM", bookings: 0, available: true },
      { time: "19:00", displayTime: "7:00 PM", bookings: 0, available: true },
      { time: "19:30", displayTime: "7:30 PM", bookings: 0, available: true },
      { time: "20:00", displayTime: "8:00 PM", bookings: 0, available: true },
      { time: "20:30", displayTime: "8:30 PM", bookings: 0, available: true },
    ];
    
    // Simulate bookings (more on weekends)
    const numBookings = isWeekend ? 6 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 3);
    const bookedSlots = new Set<number>();
    
    for (let i = 0; i < numBookings; i++) {
      const idx = Math.floor(Math.random() * slots.length);
      bookedSlots.add(idx);
      slots[idx].bookings += 1 + Math.floor(Math.random() * 2);
    }
    
    // Mark full slots (8 max per slot)
    slots.forEach(slot => {
      slot.available = slot.bookings < 8;
    });
    
    days.push({
      date: dateStr,
      displayDate: `${date.getDate()} ${monthNames[date.getMonth()]}`,
      dayLabel: d === 0 ? "Today" : d === 1 ? "Tomorrow" : dayNames[dayOfWeek],
      slots,
    });
  }
  
  return days;
}

const CALENDAR = generateCalendar();

// ============================================================================
// COMPONENTS
// ============================================================================

interface RestaurantDataPreviewProps {
  className?: string;
}

export function RestaurantDataPreview({ className }: RestaurantDataPreviewProps) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [menuCategory, setMenuCategory] = useState("all");
  
  const categories = [
    { key: "all", name: "All" },
    { key: "pizza", name: "Pizzas" },
    { key: "starter", name: "Starters" },
    { key: "salad", name: "Salads" },
    { key: "main", name: "Mains" },
    { key: "dessert", name: "Desserts" },
  ];
  
  const filteredMenu = menuCategory === "all" 
    ? MENU 
    : MENU.filter(item => item.category === menuCategory);
  
  return (
    <section className={cn("py-12 px-4", className)}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">
          Emma&apos;s Database
        </h2>
        <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
          Emma has access to real-time booking availability and the full menu. 
          She knows exactly what&apos;s available and can make informed decisions.
        </p>
        
        <Tabs defaultValue="calendar" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Bookings Calendar
            </TabsTrigger>
            <TabsTrigger value="menu" className="gap-2">
              <ChefHat className="w-4 h-4" />
              Full Menu
            </TabsTrigger>
          </TabsList>
          
          {/* Calendar Tab */}
          <TabsContent value="calendar">
            <Card className="border-blue-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  2-Week Booking Calendar
                  <Badge variant="outline" className="ml-2 text-xs">Live Data</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Day selector */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                  {CALENDAR.slice(0, 7).map((day, idx) => (
                    <Button
                      key={day.date}
                      variant={selectedDay === idx ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedDay(idx)}
                      className={cn(
                        "flex-shrink-0 flex flex-col items-center min-w-[70px] h-auto py-2",
                        selectedDay === idx && "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      <span className="text-xs opacity-70">{day.dayLabel}</span>
                      <span className="text-sm font-semibold">{day.displayDate}</span>
                    </Button>
                  ))}
                </div>
                
                {/* Time slots */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {CALENDAR[selectedDay].slots.map((slot) => (
                    <div
                      key={slot.time}
                      className={cn(
                        "p-3 rounded-lg border text-center",
                        slot.available 
                          ? "border-green-500/30 bg-green-500/5" 
                          : "border-red-500/30 bg-red-500/5"
                      )}
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{slot.displayTime}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-xs">
                        <Users className="w-3 h-3" />
                        <span className={slot.available ? "text-green-400" : "text-red-400"}>
                          {slot.available ? `${8 - slot.bookings} tables left` : "Full"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Emma checks this calendar in real-time to offer accurate availability
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Menu Tab */}
          <TabsContent value="menu">
            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-orange-400" />
                  The Golden Fork Menu
                  <Badge variant="outline" className="ml-2 text-xs">{MENU.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Category filter */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                  {categories.map((cat) => (
                    <Button
                      key={cat.key}
                      variant={menuCategory === cat.key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMenuCategory(cat.key)}
                      className={cn(
                        "flex-shrink-0",
                        menuCategory === cat.key && "bg-orange-600 hover:bg-orange-700"
                      )}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
                
                {/* Menu items */}
                <div className="grid md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {filteredMenu.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{item.name}</span>
                            {item.popular && (
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            )}
                            {item.spicy && (
                              <Flame className="w-3 h-3 text-red-400" />
                            )}
                            {item.dietary.includes("vegetarian") && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 text-green-400 border-green-400/30">V</Badge>
                            )}
                            {item.dietary.includes("vegan") && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 text-green-400 border-green-400/30">VG</Badge>
                            )}
                            {item.dietary.includes("gluten-free") && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 text-amber-400 border-amber-400/30">GF</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        </div>
                        <span className="font-semibold text-orange-400">${item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> Popular</span>
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-red-400" /> Spicy</span>
                  <span className="flex items-center gap-1"><Leaf className="w-3 h-3 text-green-400" /> V = Vegetarian</span>
                  <span className="flex items-center gap-1"><Wheat className="w-3 h-3 text-amber-400" /> GF = Gluten-Free</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
