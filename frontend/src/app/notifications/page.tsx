"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi, eventsApi, projectsApi } from "@/lib/api-client";
import type { EventItem, ProjectItem, User } from "@/types";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  kind: string;
  date: string;
};

export default function NotificationsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    authApi.me().then((res) => setUser(res.data.user)).catch(() => setUser(null));
  }, []);

  useEffect(() => {
    Promise.allSettled([eventsApi.list(), projectsApi.list()]).then(([eventsRes, projectsRes]) => {
      const nextItems: NotificationItem[] = [];

      if (eventsRes.status === "fulfilled") {
        (eventsRes.value.data as EventItem[]).slice(0, 5).forEach((event) => {
          nextItems.push({
            id: `event-${event.id}`,
            kind: "Event",
            title: event.title,
            description: `${event.spots_left} spots left • ${event.location}`,
            date: event.start_time,
          });
        });
      }

      if (projectsRes.status === "fulfilled") {
        (projectsRes.value.data as ProjectItem[]).slice(0, 5).forEach((project) => {
          nextItems.push({
            id: `project-${project.id}`,
            kind: project.approved ? "Project Approved" : "Project Update",
            title: project.title,
            description: project.approved ? "Approved for community showcase" : `Stack: ${project.tech_stack.join(", ")}`,
            date: project.created_at,
          });
        });
      }

      if (user && !user.email_verified) {
        nextItems.unshift({
          id: "verify-email",
          kind: "Account",
          title: "Verify your email",
          description: "Finish verification to secure your account and unlock future reminders.",
          date: user.created_at,
        });
      }

      nextItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(nextItems.slice(0, 8));
    });
  }, [user]);

  const unreadCount = useMemo(() => items.length, [items]);

  return (
    <section className="page-shell py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Notifications</h1>
          <p className="mt-2 text-slate-400">A lightweight inbox for events, projects, and account reminders.</p>
        </div>
        <div className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
          {unreadCount} items
        </div>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-slate-400">No notifications yet.</CardContent>
          </Card>
        ) : (
          items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-base">
                  <span>{item.title}</span>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{item.kind}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{item.description}</p>
                <p className="mt-2 text-xs text-slate-500">{new Date(item.date).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
