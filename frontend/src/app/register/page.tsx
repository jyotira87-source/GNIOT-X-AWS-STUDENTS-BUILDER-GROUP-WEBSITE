import Link from "next/link";

import { RegisterForm } from "@/components/custom/auth/register-form";

export default function RegisterPage() {
  return (
    <section className="page-shell py-14">
      <RegisterForm />
      <p className="mt-4 text-center text-sm text-slate-400">
        Already registered? <Link href="/login" className="text-cyan-300 hover:text-cyan-200">Sign in</Link>
      </p>
    </section>
  );
}
