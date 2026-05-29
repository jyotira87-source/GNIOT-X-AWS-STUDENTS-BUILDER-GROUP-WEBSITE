"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authApi } from "@/lib/api-client";
import type { User } from "@/types";
import { ProfileForm } from "@/components/custom/profile/ProfileForm";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  if (!user) {
    return <section className="page-shell py-12 text-slate-300">Loading profile...</section>;
  }

  return (
    <section className="page-shell py-12">
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Your profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p><span className="text-slate-400">Email:</span> {user.email}</p>
            <p><span className="text-slate-400">Role:</span> {user.role}</p>
            <p><span className="text-slate-400">Department:</span> {user.department}</p>
            <p><span className="text-slate-400">Verified:</span> {user.email_verified ? "Yes" : "No"}</p>
          </div>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </section>
  );
}
