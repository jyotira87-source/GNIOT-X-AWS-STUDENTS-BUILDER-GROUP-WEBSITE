import Link from "next/link";

import { LoginForm } from "@/components/custom/auth/login-form";

export default function LoginPage() {
  return (
    <section className="page-shell py-14">
      <LoginForm />
      <p className="mt-4 text-center text-sm text-slate-400">
        New here? <Link href="/register" className="text-cyan-300 hover:text-cyan-200">Create an account</Link>
      </p>
    </section>
  );
}
