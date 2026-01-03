"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Scenario {
  id: string;
  label: string;
  prompt: string;
  category: "booking" | "takeaway";
}

const scenarios: Scenario[] = [
  // Booking scenarios
  { id: "book", label: "Book a table for 2 at 7:30pm", prompt: "Hi, I'd like to book a table for 2 at 7:30pm tonight please", category: "booking" },
  { id: "modify", label: "Modify my booking", prompt: "Hi, I need to change my booking from 7pm to 8pm, the name is Smith", category: "booking" },
  { id: "cancel", label: "Cancel my booking", prompt: "Hi, I need to cancel my reservation for tonight, the name is Johnson", category: "booking" },
  // Takeaway scenarios
  { id: "takeaway", label: "Place a takeaway order", prompt: "Hi, I'd like to place a takeaway order please. Can I get a margherita pizza and a caesar salad?", category: "takeaway" },
  { id: "add-item", label: "Add to my order", prompt: "Can I also add a tiramisu and a bottle of sparkling water to that order?", category: "takeaway" },
  { id: "pickup", label: "What's the pickup time?", prompt: "When will my order be ready for pickup?", category: "takeaway" },
];

interface GuidedScenariosProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function GuidedScenarios({ onSelect, disabled }: GuidedScenariosProps) {
  const bookingScenarios = scenarios.filter((s) => s.category === "booking");
  const takeawayScenarios = scenarios.filter((s) => s.category === "takeaway");

  return (
    <section className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold text-center mb-2">
          Try saying...
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Click a scenario to auto-send it
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking Scenarios */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-xs">📅</span>
              <span className="text-sm font-medium text-blue-400">Bookings</span>
            </div>
            <div className="space-y-2">
              {bookingScenarios.map((scenario) => (
                <ScenarioButton
                  key={scenario.id}
                  scenario={scenario}
                  onSelect={onSelect}
                  disabled={disabled}
                  variant="booking"
                />
              ))}
            </div>
          </div>

          {/* Takeaway Scenarios */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-xs">🥡</span>
              <span className="text-sm font-medium text-green-400">Takeaway</span>
            </div>
            <div className="space-y-2">
              {takeawayScenarios.map((scenario) => (
                <ScenarioButton
                  key={scenario.id}
                  scenario={scenario}
                  onSelect={onSelect}
                  disabled={disabled}
                  variant="takeaway"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScenarioButton({
  scenario,
  onSelect,
  disabled,
  variant,
}: {
  scenario: Scenario;
  onSelect: (prompt: string) => void;
  disabled?: boolean;
  variant: "booking" | "takeaway";
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onSelect(scenario.prompt)}
      disabled={disabled}
      className={cn(
        "w-full justify-start text-left h-auto py-3 px-4",
        variant === "booking"
          ? "hover:border-blue-500/50 hover:bg-blue-500/5"
          : "hover:border-green-500/50 hover:bg-green-500/5"
      )}
    >
      <span className="text-sm">{scenario.label}</span>
    </Button>
  );
}
