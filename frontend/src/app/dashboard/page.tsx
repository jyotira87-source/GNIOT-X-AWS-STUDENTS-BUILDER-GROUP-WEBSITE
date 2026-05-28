"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StatCard } from "@/components/custom/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi, dashboardApi } from "@/lib/api-client";
import type { DashboardStats, User } from "@/types";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

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
    </section>
  );
}
