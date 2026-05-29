"use client";

import { useEffect, useState } from "react";
import { authApi } from "@/lib/api-client";

type Props = { token: string };

export default function VerifyEmailStatus({ token }: Props) {
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const verify = async () => {
      try {
        await authApi.verifyEmail({ token });
        setStatus("Email verified. Thank you!");
      } catch (err: any) {
        setStatus(err?.response?.data?.detail || "Verification failed.");
      }
    };
    if (token) verify();
  }, [token]);

  return <p className="text-sm text-slate-300">{status || "Verifying..."}</p>;
}
