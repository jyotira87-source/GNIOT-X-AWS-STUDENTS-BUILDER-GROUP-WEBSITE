"use client";

import { useEffect, useState } from "react";

import { EventCard } from "@/components/custom/event-card";
import { authApi, eventsApi } from "@/lib/api-client";
import type { EventItem } from "@/types";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const load = async () => {
    const [eventsRes, meRes] = await Promise.allSettled([eventsApi.list(), authApi.me()]);
    if (eventsRes.status === "fulfilled") {
      setEvents(eventsRes.value.data);
    }
    setIsLoggedIn(meRes.status === "fulfilled");
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const onRsvp = async (eventId: string) => {
    setLoadingId(eventId);
    try {
      await eventsApi.rsvp(eventId);
      await load();
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className="page-shell py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-white">Events Board</h1>
        <p className="mt-2 text-slate-400">Workshops, hackathons, and lightning sessions from the community.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onRsvp={onRsvp} isLoggedIn={isLoggedIn} loadingId={loadingId} />
        ))}
        {events.length === 0 && <p className="text-sm text-slate-400">No events yet. Check back soon.</p>}
      </div>
    </section>
  );
}
