"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StatCard } from "@/components/custom/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi, dashboardApi, eventsApi, projectsApi } from "@/lib/api-client";
import type { DashboardStats, EventItem, ProjectItem, User } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [feed, setFeed] = useState<Array<{ id: string; kind: string; title: string; date: string }>>([]);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  useEffect(() => {
    if (user?.role === "Admin/Leader") {
      dashboardApi
        .stats()
        .then((res) => setStats(res.data))
        .catch(() => setStats(null));
    }
  }, [user]);

  useEffect(() => {
    Promise.allSettled([eventsApi.list(), projectsApi.list()]).then(([eventsRes, projectsRes]) => {
      const items: Array<{ id: string; kind: string; title: string; date: string }> = [];

      if (eventsRes.status === "fulfilled") {
        (eventsRes.value.data as EventItem[]).slice(0, 3).forEach((event) => {
          items.push({
            id: event.id,
            kind: "Event",
            title: event.title,
            date: event.start_time,
          });
        });
      }

      if (projectsRes.status === "fulfilled") {
        (projectsRes.value.data as ProjectItem[]).slice(0, 3).forEach((project) => {
          items.push({
            id: project.id,
            kind: "Project",
            title: project.title,
            date: project.created_at,
          });
        });
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setFeed(items.slice(0, 5));
    });
  }, []);

  if (!user) {
    return <section className="page-shell py-12 text-slate-300">Loading dashboard...</section>;
  }

  return (
    <section className="page-shell py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Hello, {user.name}</h1>
          <p className="mt-1 text-slate-400">
            Role: {user.role} • Department: {user.department}
          </p>
        </div>
        {user.role === "Admin/Leader" && (
          <Link href="/dashboard/admin">
            <Button>Open Core Team Dashboard</Button>
          </Link>
        )}
        <Link href="/profile">
          <Button variant="outline">Edit Profile</Button>
        </Link>
      </div>

      {user.role === "Admin/Leader" && stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard title="Total Members" value={stats.total_members} />
          <StatCard title="Total Events" value={stats.total_events} />
          <StatCard title="Total RSVPs" value={stats.total_rsvps} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Member Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300">
              You can RSVP to events, submit projects, and collaborate with peers from the Events and Projects sections.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feed.length === 0 ? (
              <p className="text-sm text-slate-400">No recent activity yet.</p>
            ) : (
              feed.map((item) => (
                <div key={`${item.kind}-${item.id}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-white">{item.title}</span>
                    <span className="text-xs text-cyan-300">{item.kind}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{new Date(item.date).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
