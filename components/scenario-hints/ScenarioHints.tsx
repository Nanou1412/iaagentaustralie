"use client";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { ScenarioHint } from "@/types/industry";

interface ScenarioHintsProps {
  scenarios: ScenarioHint[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function ScenarioHints({ scenarios, onSelect, disabled }: ScenarioHintsProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-400 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-400" />
        Try a scenario:
      </p>
      <div className="flex flex-wrap gap-2">
        {scenarios.map((scenario, index) => (
          <Button
            key={scenario.id}
            variant="outline"
            size="sm"
            onClick={() => onSelect(scenario.prompt)}
            disabled={disabled}
            className="text-xs bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white hover:border-blue-500/50 transition-all animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {scenario.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
