"use client";

import { CalendarDays, Users, Clock, Trash2, Edit, Plus, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardEntry } from "@/types/events";
import { cn } from "@/lib/utils";

interface DashboardPreviewProps {
  entries: DashboardEntry[];
  className?: string;
}

function getActionIcon(action: string) {
  switch (action) {
    case "RESERVATION_CONFIRMED":
      return <Plus className="h-4 w-4" />;
    case "RESERVATION_MODIFIED":
      return <Edit className="h-4 w-4" />;
    case "RESERVATION_CANCELED":
      return <Trash2 className="h-4 w-4" />;
    case "ORDER_PLACED":
      return <ShoppingBag className="h-4 w-4" />;
    default:
      return <CalendarDays className="h-4 w-4" />;
  }
}

function getActionBadge(type: DashboardEntry["type"]) {
  switch (type) {
    case "new":
      return <Badge variant="success">New</Badge>;
    case "modified":
      return <Badge variant="secondary">Modified</Badge>;
    case "canceled":
      return <Badge variant="destructive">Canceled</Badge>;
  }
}

export function DashboardPreview({ entries, className }: DashboardPreviewProps) {
  const latestEntries = entries.slice(-5).reverse();

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-700/50 bg-gray-900/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-white" />
          <h3 className="font-semibold text-white">
            Live Dashboard
          </h3>
        </div>
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white font-medium">Live</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 min-h-[200px] max-h-[350px] overflow-y-auto">
        {latestEntries.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Dashboard entries will appear here</p>
          </div>
        ) : (
          latestEntries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700/30 animate-fade-in hover:bg-gray-800/70 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                  entry.type === "new" && "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/20",
                  entry.type === "modified" && "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/20",
                  entry.type === "canceled" && "bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-red-500/20"
                )}
              >
                {getActionIcon(entry.event.action)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm truncate text-white">
                    {entry.event.customerName}
                  </span>
                  {getActionBadge(entry.type)}
                </div>

                <p className="text-sm text-gray-400">
                  {entry.event.dashboardText}
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  {entry.event.time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.event.time}
                    </span>
                  )}
                  {entry.event.partySize && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {entry.event.partySize} guests
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
