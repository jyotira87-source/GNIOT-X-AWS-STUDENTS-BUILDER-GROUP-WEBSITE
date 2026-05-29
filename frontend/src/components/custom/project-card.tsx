"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Github, Heart } from "lucide-react";

import type { ProjectItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projectsApi } from "@/lib/api-client";

export function ProjectCard({ project }: { project: ProjectItem }) {
  const [upvotes, setUpvotes] = useState<number | null>(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comments, setComments] = useState<{ id: string; content: string; user_id: string; created_at: string }[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    projectsApi.upvotes
      .count(project.id)
      .then((res) => setUpvotes(res.data.total))
      .catch(() => setUpvotes(0));
  }, [project.id]);

  function handleUpvote() {
    projectsApi.upvotes
      .upvote(project.id)
      .then((res) => setUpvotes(res.data.total))
      .catch(() => {
        // ignore errors for now (could be 401)
      });
  }

  function toggleComments() {
    if (!commentsVisible) {
      projectsApi.comments.list(project.id).then((res) => setComments(res.data as any)).catch(() => setComments([]));
    }
    setCommentsVisible(!commentsVisible);
  }

  function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    projectsApi.comments
      .create(project.id, { content: newComment.trim() })
      .then((res) => setComments((c) => [...c, res.data as any]))
      .then(() => setNewComment(""))
      .catch(() => {
        // ignore for now
      });
  }

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
        <div className="flex items-center gap-4 text-sm">
          <a href={project.github_repo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
            <Github className="h-4 w-4" /> Repository
          </a>
          {project.live_demo_url && (
            <a href={project.live_demo_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-200">
              <ExternalLink className="h-4 w-4" /> Live Demo
            </a>
          )}
          <button onClick={handleUpvote} className="ml-auto inline-flex items-center gap-2 text-pink-400 hover:text-pink-300">
            <Heart className="h-4 w-4" /> <span>{upvotes ?? "-"}</span>
          </button>
          <button onClick={toggleComments} className="inline-flex items-center gap-1 text-slate-300 hover:text-slate-200">
            Comments
          </button>
        </div>

        {commentsVisible && (
          <div className="mt-2 border-t pt-2">
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="rounded bg-slate-800/40 p-2 text-sm">
                  <div className="text-slate-200">{c.content}</div>
                  <div className="text-xs text-slate-400">{new Date(c.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} className="mt-2 flex gap-2">
              <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment" className="flex-1 rounded bg-slate-900/40 px-2 py-1 text-sm" />
              <button type="submit" className="rounded bg-cyan-600 px-3 py-1 text-sm">Post</button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
