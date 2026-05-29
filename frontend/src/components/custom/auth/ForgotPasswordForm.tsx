"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api-client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setStatus("If an account exists, a password reset email has been sent.");
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || "Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {status && <p className="text-sm text-slate-300">{status}</p>}
      <Button className="w-full" disabled={loading}>{loading ? "Sending..." : "Send reset email"}</Button>
    </form>
  );
}
