"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { authApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email().endsWith("@gniot.edu.in", "Use institutional email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  department: z.enum(["CSE-DS", "CSE-CyberSecurity", "General-CSE", "Other"]),
  github_url: z.string().url("Enter a valid GitHub URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Enter a valid LinkedIn URL").optional().or(z.literal("")),
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { department: "General-CSE", github_url: "", linkedin_url: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    setError(null);
    try {
      await authApi.register({
        ...values,
        github_url: values.github_url || undefined,
        linkedin_url: values.linkedin_url || undefined,
      });
      window.location.href = "/dashboard";
    } catch {
      setError("Registration failed. Email may already exist.");
    }
  };

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle>Create your Builder Hub profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Input placeholder="Your full name" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-rose-300">{errors.name.message}</p>}
          </div>
          <div>
            <Input placeholder="you@gniot.edu.in" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-rose-300">{errors.email.message}</p>}
          </div>
          <div>
            <Input placeholder="Create password" type="password" {...register("password")} />
            {errors.password && <p className="mt-1 text-xs text-rose-300">{errors.password.message}</p>}
          </div>
          <div>
            <select
              className="h-10 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100"
              {...register("department")}
            >
              <option value="CSE-DS">CSE-DS</option>
              <option value="CSE-CyberSecurity">CSE-CyberSecurity</option>
              <option value="General-CSE">General-CSE</option>
              <option value="Other">Other</option>
            </select>
            {errors.department && <p className="mt-1 text-xs text-rose-300">{errors.department.message}</p>}
          </div>
          <div>
            <Input placeholder="GitHub profile URL (optional)" {...register("github_url")} />
            {errors.github_url && <p className="mt-1 text-xs text-rose-300">{errors.github_url.message}</p>}
          </div>
          <div>
            <Input placeholder="LinkedIn profile URL (optional)" {...register("linkedin_url")} />
            {errors.linkedin_url && <p className="mt-1 text-xs text-rose-300">{errors.linkedin_url.message}</p>}
          </div>
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <Button className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
