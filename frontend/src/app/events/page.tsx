"use client";

import { useEffect, useMemo, useState } from "react";

import { EventCard } from "@/components/custom/event-card";
import { Input } from "@/components/ui/input";
import { authApi, eventsApi } from "@/lib/api-client";
import type { EventItem } from "@/types";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState("");
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

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return events;
    }

    return events.filter((event) => {
      const haystack = [event.title, event.description, event.location].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [events, search]);

  const onRsvp = async (eventId: string) => {
    setLoadingId(eventId);
    try {
      await eventsApi.rsvp(eventId);
      await load();
    } catch (err: any) {
      // If the event is full, automatically join the waitlist
      const message = err?.response?.data?.detail || err?.message;
      if (message && message.toString().toLowerCase().includes("rsvp limit")) {
        try {
          await eventsApi.joinWaitlist(eventId);
        } catch {
          // ignore
        }
        await load();
      }
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
      <div className="mb-6 max-w-xl">
        <Input
          placeholder="Search events by title, location, or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} onRsvp={onRsvp} isLoggedIn={isLoggedIn} loadingId={loadingId} />
        ))}
        {filteredEvents.length === 0 && <p className="text-sm text-slate-400">No matching events found.</p>}
      </div>
    </section>
  );
}
