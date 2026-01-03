// Event Types for Dashboard and SMS

import { AIEvent } from "./ai";

export interface DashboardEntry {
  id: string;
  timestamp: Date;
  event: AIEvent;
  type: "new" | "modified" | "canceled";
}

export interface SMSEntry {
  id: string;
  timestamp: Date;
  to: string;
  message: string;
}
