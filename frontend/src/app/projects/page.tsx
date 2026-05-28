"use client";

import { useEffect, useMemo, useState } from "react";

import { ProjectCard } from "@/components/custom/project-card";
import { ProjectSubmitForm } from "@/components/custom/project-submit-form";
import { authApi, projectsApi } from "@/lib/api-client";
import type { ProjectItem } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [loggedIn, setLoggedIn] = useState(false);

  const load = async () => {
    const [projectsRes, meRes] = await Promise.allSettled([projectsApi.list(), authApi.me()]);
    if (projectsRes.status === "fulfilled") {
      setProjects(projectsRes.value.data);
    }
    setLoggedIn(meRes.status === "fulfilled");
  };

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  const filters = useMemo(() => {
    const unique = new Set<string>(["All"]);
    projects.forEach((project) => project.tech_stack.forEach((stack) => unique.add(stack)));
    return [...unique];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (filter === "All") {
      return projects;
    }
    return projects.filter((project) => project.tech_stack.includes(filter));
  }, [filter, projects]);

  return (
    <section className="page-shell py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Project Registry</h1>
          <p className="mt-2 text-slate-400">Explore approved student projects and submit your own build.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="filter" className="text-sm text-slate-400">
            Filter by stack
          </label>
          <select
            id="filter"
            className="h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            {filters.map((stack) => (
              <option key={stack} value={stack}>
                {stack}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {filteredProjects.length === 0 && <p className="text-sm text-slate-400">No projects in this category yet.</p>}
      </div>

      {loggedIn && <ProjectSubmitForm onSubmitted={load} />}
      {!loggedIn && <p className="text-sm text-slate-400">Login to submit your project.</p>}
    </section>
  );
}
