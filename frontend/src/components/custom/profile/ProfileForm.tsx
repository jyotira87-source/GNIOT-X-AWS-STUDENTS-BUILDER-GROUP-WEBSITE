"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { userApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/types";

const profileSchema = z.object({
  name: z.string().min(2, "Enter your full name").optional().or(z.literal("")),
  github_url: z.string().url("Enter a valid GitHub URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Enter a valid LinkedIn URL").optional().or(z.literal("")),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileForm({ user }: { user: User }) {
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      github_url: user.github_url || "",
      linkedin_url: user.linkedin_url || "",
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    setStatus(null);
    setSaving(true);
    try {
      await userApi.updateMe({
        name: values.name || undefined,
        github_url: values.github_url || null,
        linkedin_url: values.linkedin_url || null,
      });
      setStatus("Profile updated successfully.");
    } catch (err: any) {
      setStatus(err?.response?.data?.detail || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Input placeholder="Your full name" {...register("name")} />
        {errors.name && <p className="mt-1 text-xs text-rose-300">{errors.name.message}</p>}
      </div>
      <div>
        <Input placeholder="GitHub URL" {...register("github_url")} />
        {errors.github_url && <p className="mt-1 text-xs text-rose-300">{errors.github_url.message}</p>}
      </div>
      <div>
        <Input placeholder="LinkedIn URL" {...register("linkedin_url")} />
        {errors.linkedin_url && <p className="mt-1 text-xs text-rose-300">{errors.linkedin_url.message}</p>}
      </div>
      {status && <p className="text-sm text-slate-300">{status}</p>}
      <Button className="w-full" disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
    </form>
  );
}
