"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LogOut, Sparkles } from "lucide-react";

import { authApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

const links = [
  { href: "/events", label: "Events" },
  { href: "/projects", label: "Projects" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notifications", label: "Notifications" },
];

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authApi
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const onLogout = async () => {
    await authApi.logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
      <div className="page-shell flex h-16 items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-100">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          GNIOT X AWS Builders Hub
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-xs text-slate-300 sm:block">{user.name}</span>
              <Link href="/profile">
                <Button variant="ghost" size="sm">
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Join Community</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
