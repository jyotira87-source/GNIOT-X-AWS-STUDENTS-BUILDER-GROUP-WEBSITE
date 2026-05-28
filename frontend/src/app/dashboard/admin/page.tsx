"use client";

import { useEffect, useState } from "react";

import { AdminProjectsPanel } from "@/components/custom/admin-projects-panel";
import { authApi } from "@/lib/api-client";
import type { User } from "@/types";

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authApi
      .me()
      .then((res) => {
        if (res.data.user.role !== "Admin/Leader") {
          window.location.href = "/dashboard";
          return;
        }
        setUser(res.data.user);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  if (!user) {
    return <section className="page-shell py-12 text-slate-300">Verifying permissions...</section>;
  }

  return (
    <section className="page-shell py-12">
      <h1 className="mb-2 text-3xl font-semibold text-white">Core Team Dashboard</h1>
      <p className="mb-8 text-slate-400">Approve project submissions and export event RSVP rosters.</p>
      <AdminProjectsPanel />
    </section>
  );
}
