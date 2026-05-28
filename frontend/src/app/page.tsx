import Link from "next/link";

import { Hero } from "@/components/custom/hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <section className="page-shell pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: "Weekly Workshops", text: "Cloud, frontend, backend, and AI tracks led by core team mentors." },
            { title: "Build Sprints", text: "Ship projects with code reviews, design critiques, and deployment support." },
            { title: "Career Momentum", text: "Portfolio, open-source, and interview readiness through peer collaboration." },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link href="/events">
            <Button size="lg">View Upcoming Events</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
