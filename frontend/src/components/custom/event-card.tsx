"use client";

import { CalendarClock, MapPin, Users } from "lucide-react";

import type { EventItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventCardProps {
  event: EventItem;
  isLoggedIn: boolean;
  onRsvp: (eventId: string) => Promise<void>;
  loadingId: string | null;
}

export function EventCard({ event, isLoggedIn, onRsvp, loadingId }: EventCardProps) {
  const isFull = event.spots_left <= 0;

  return (
    <Card className="h-full border-slate-800/80 transition-transform hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="text-white">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 text-sm text-slate-300">{event.description}</p>
        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> {event.location}
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-3.5 w-3.5" /> {new Date(event.start_time).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" /> {event.rsvp_count}/{event.rsvp_limit} RSVPs
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge className={isFull ? "border-rose-500/50 text-rose-300" : "border-emerald-500/50 text-emerald-300"}>
            {isFull ? "Slots Full" : `${event.spots_left} spots left`}
          </Badge>
          <Button
            onClick={() => onRsvp(event.id)}
            disabled={!isLoggedIn || event.is_rsvped || isFull || loadingId === event.id}
            variant={event.is_rsvped ? "secondary" : "default"}
          >
            {!isLoggedIn ? "Login to RSVP" : event.is_rsvped ? "RSVP Confirmed" : loadingId === event.id ? "Saving..." : "RSVP"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
