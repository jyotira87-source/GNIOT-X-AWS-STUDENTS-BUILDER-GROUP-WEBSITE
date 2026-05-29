"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authApi } from "@/lib/api-client";

type Props = { token: string };

export default function ResetPasswordForm({ token }: Props) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: password });
      setStatus("Password reset successful. You can now log in.");
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Input placeholder="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {status && <p className="text-sm text-slate-300">{status}</p>}
      <Button className="w-full" disabled={loading}>{loading ? "Resetting..." : "Reset password"}</Button>
    </form>
  );
}
