import { ExternalLink, Github } from "lucide-react";

import type { ProjectItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <Card className="h-full border-slate-800/80">
      <CardHeader>
        <CardTitle className="text-white">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-4 text-sm text-slate-300">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.tech_stack.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
        <div className="flex gap-4 text-sm">
          <a href={project.github_repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
            <Github className="h-4 w-4" /> Repository
          </a>
          {project.live_demo_url && (
            <a href={project.live_demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200">
              <ExternalLink className="h-4 w-4" /> Live Demo
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
