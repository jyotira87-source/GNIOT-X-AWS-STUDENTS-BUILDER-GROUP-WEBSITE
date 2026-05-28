"use client";

import { useEffect, useState } from "react";

import { eventsApi, projectsApi } from "@/lib/api-client";
import type { EventItem, ProjectItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminProjectsPanel() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const [projectRes, eventRes] = await Promise.all([projectsApi.listAll(), eventsApi.list()]);
    setProjects(projectRes.data);
    setEvents(eventRes.data);
  };

  useEffect(() => {
    load().catch(() => setMessage("Failed to load admin data."));
  }, []);

  const toggleApproval = async (projectId: string, approved: boolean) => {
    await projectsApi.approve(projectId, approved);
    await load();
  };

  const downloadRoster = async (eventId: string) => {
    const response = await eventsApi.exportCsv(eventId);
    const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `event_${eventId}_rsvps.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {message && <p className="text-sm text-rose-300">{message}</p>}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Project Approvals</h2>
        <div className="grid gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{project.title}</CardTitle>
                <Badge className={project.approved ? "text-emerald-300" : "text-amber-300"}>
                  {project.approved ? "Approved" : "Pending"}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Button onClick={() => toggleApproval(project.id, true)} disabled={project.approved}>
                  Approve
                </Button>
                <Button variant="outline" onClick={() => toggleApproval(project.id, false)}>
                  Mark Pending
                </Button>
              </CardContent>
            </Card>
          ))}
          {projects.length === 0 && <p className="text-sm text-slate-400">No projects found.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-white">Event RSVP Roster</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{event.rsvp_count} RSVPs</p>
                <Button variant="outline" onClick={() => downloadRoster(event.id)}>
                  Download CSV
                </Button>
              </CardContent>
            </Card>
          ))}
          {events.length === 0 && <p className="text-sm text-slate-400">No events available.</p>}
        </div>
      </section>
    </div>
  );
}
