// Industry Configuration Types

export interface IndustryConfig {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  available: boolean;
  scenarios: ScenarioHint[];
  systemPromptAddition: string;
}

export interface ScenarioHint {
  id: string;
  label: string;
  prompt: string;
}

export type IndustrySlug = "restaurants" | "healthcare" | "retail" | "realestate";
