import Link from "next/link";
import { ArrowRight, Github, Linkedin, Rocket } from "lucide-react";

import { Countdown } from "@/components/custom/countdown";
import { Button } from "@/components/ui/button";

export function Hero() {
  const nextEventDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString();

  return (
    <section className="page-shell py-16 sm:py-24">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
            AWS Student Builder Group
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            Build, ship, and scale with the
            <span className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent"> GNIOT X AWS Builders Hub</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg">
            A campus-first developer ecosystem for workshops, project incubation, cloud-native mentorship, and real
            deployment pipelines on AWS.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/register">
              <Button size="lg">
                Join the Community
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg">
                Explore Projects
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-slate-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
              <Github className="h-4 w-4" /> GitHub
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
              <Linkedin className="h-4 w-4" /> LinkedIn
            </a>
          </div>
        </div>
        <div className="glass-card rounded-3xl p-6">
          <div className="mb-5 inline-flex items-center gap-2 text-sm text-cyan-200">
            <Rocket className="h-4 w-4" />
            Countdown to next active event
          </div>
          <Countdown isoDate={nextEventDate} />
          <p className="mt-5 text-sm text-slate-400">
            Next up: Cloud-native Hack Sprint + Builder Demo Night.
          </p>
        </div>
      </div>
    </section>
  );
}
