// Industry Configuration

import { IndustryConfig } from "@/types/industry";

export const industries: IndustryConfig[] = [
  {
    slug: "restaurants",
    name: "Restaurants",
    tagline: "Never miss a reservation again",
    description:
      "Emma handles reservations, modifications, cancellations, and takeaway orders — just like a real team member.",
    icon: "UtensilsCrossed",
    available: true,
    scenarios: [
      {
        id: "book-table",
        label: "Book a table for tonight",
        prompt:
          "Hey, I was hoping to book a table for tonight? There'd be 4 of us, around 7pm if you've got space. Name's Sarah, and you can reach me on 0412 345 678.",
      },
      {
        id: "cancel-reservation",
        label: "Cancel a reservation",
        prompt:
          "Hi there, really sorry but I need to cancel my booking. It's under Michael Brown, was meant to be tomorrow night at 8. Something came up.",
      },
      {
        id: "modify-booking",
        label: "Modify a booking",
        prompt:
          "Hey, I've got a reservation for Saturday at 6pm under David Lee. Any chance we could push it to 7:30? Oh and actually, we'll be 6 people now instead of 4.",
      },
      {
        id: "place-order",
        label: "Place an order",
        prompt:
          "Hi! I'd love to order some takeaway. Could I get 2 margherita pizzas, a caesar salad, and like 3 garlic breads? It's for Emma Wilson, my number is 0423 456 789.",
      },
    ],
    systemPromptAddition: `You are Emma, the friendly receptionist at "The Golden Fork", a premium restaurant in Sydney.
Restaurant hours: 11:00 AM - 10:00 PM daily.
Max party size: 12 people.
Takeaway available: Yes.
Popular dishes: Margherita Pizza, Caesar Salad, Garlic Bread, Grilled Salmon, Beef Tenderloin.`,
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    tagline: "Streamline patient appointments",
    description:
      "Manage patient scheduling, reminders, and follow-up appointments.",
    icon: "Stethoscope",
    available: false,
    scenarios: [],
    systemPromptAddition: "",
  },
  {
    slug: "retail",
    name: "Retail",
    tagline: "Enhance customer service",
    description: "Handle product inquiries, orders, and customer support.",
    icon: "ShoppingBag",
    available: false,
    scenarios: [],
    systemPromptAddition: "",
  },
  {
    slug: "realestate",
    name: "Real Estate",
    tagline: "Never miss a lead",
    description:
      "Manage property inquiries, schedule viewings, and follow up with leads.",
    icon: "Building",
    available: false,
    scenarios: [],
    systemPromptAddition: "",
  },
];

export function getIndustryBySlug(slug: string): IndustryConfig | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getAvailableIndustries(): IndustryConfig[] {
  return industries.filter((i) => i.available);
}
