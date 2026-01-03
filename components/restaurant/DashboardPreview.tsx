"use client";

import { Calendar, Clock, Users, ShoppingBag, CheckCircle, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Reservation {
  id: string;
  name: string;
  time: string;
  partySize: number;
  status: "confirmed" | "modified" | "cancelled";
  timestamp: Date;
}

export interface TakeawayOrder {
  id: string;
  items: string[];
  pickupTime: string;
  status: "new" | "preparing" | "ready";
  timestamp: Date;
}

export interface AIAction {
  id: string;
  action: string;
  timestamp: Date;
}

interface DashboardPreviewProps {
  reservations: Reservation[];
  takeawayOrders: TakeawayOrder[];
  aiActions: AIAction[];
  className?: string;
}

export function DashboardPreview({
  reservations,
  takeawayOrders,
  aiActions,
  className,
}: DashboardPreviewProps) {
  return (
    <section className="py-8 px-4">
      <div className={cn("max-w-4xl mx-auto", className)}>
        <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          Your dashboard updates
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Staff sees everything in real-time
        </p>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Reservations */}
          <Card className="border-blue-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Reservations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[250px] overflow-y-auto">
              {reservations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No reservations yet
                </p>
              ) : (
                reservations.slice(-4).reverse().map((res) => (
                  <ReservationItem key={res.id} reservation={res} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Takeaway Orders */}
          <Card className="border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-green-400" />
                Takeaway Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[250px] overflow-y-auto">
              {takeawayOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No orders yet
                </p>
              ) : (
                takeawayOrders.slice(-4).reverse().map((order) => (
                  <TakeawayItem key={order.id} order={order} />
                ))
              )}
            </CardContent>
          </Card>

          {/* AI Actions Log */}
          <Card className="border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-purple-400" />
                Latest AI Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[250px] overflow-y-auto">
              {aiActions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No actions yet
                </p>
              ) : (
                aiActions.slice(-6).reverse().map((action) => (
                  <ActionItem key={action.id} action={action} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ReservationItem({ reservation }: { reservation: Reservation }) {
  const statusConfig = {
    confirmed: { color: "bg-green-500/10 text-green-400 border-green-500/30", icon: CheckCircle },
    modified: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", icon: AlertCircle },
    cancelled: { color: "bg-red-500/10 text-red-400 border-red-500/30", icon: XCircle },
  };

  const config = statusConfig[reservation.status];
  const Icon = config.icon;

  return (
    <div className={cn("p-3 rounded-lg border animate-fade-in", config.color)}>
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm">{reservation.name}</span>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex items-center gap-3 text-xs opacity-80">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {reservation.time}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {reservation.partySize}
        </span>
      </div>
    </div>
  );
}

function TakeawayItem({ order }: { order: TakeawayOrder }) {
  const statusConfig = {
    new: { color: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "New", icon: AlertCircle },
    preparing: { color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", label: "Preparing", icon: Loader2 },
    ready: { color: "bg-green-500/10 text-green-400 border-green-500/30", label: "Ready", icon: CheckCircle },
  };

  const config = statusConfig[order.status];
  const Icon = config.icon;

  return (
    <div className={cn("p-3 rounded-lg border animate-fade-in", config.color)}>
      <div className="flex items-center justify-between mb-1">
        <Badge variant="outline" className="text-[10px]">
          {config.label}
        </Badge>
        <Icon className={cn("w-4 h-4", order.status === "preparing" && "animate-spin")} />
      </div>
      <p className="text-xs mb-1 line-clamp-2">{order.items.join(", ")}</p>
      <div className="flex items-center gap-1 text-xs opacity-80">
        <Clock className="w-3 h-3" />
        Pickup: {order.pickupTime}
      </div>
    </div>
  );
}

function ActionItem({ action }: { action: AIAction }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-500/5 border border-purple-500/20 animate-fade-in">
      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs">{action.action}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {action.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
