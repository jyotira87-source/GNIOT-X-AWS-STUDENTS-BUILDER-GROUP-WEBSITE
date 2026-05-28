"use client";

import { useState } from "react";

import { projectsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onSubmitted: () => void;
}

export function ProjectSubmitForm({ onSubmitted }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStack, setTechStack] = useState("Python, Next.js, AWS");
  const [githubRepo, setGithubRepo] = useState("");
  const [liveDemoUrl, setLiveDemoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await projectsApi.submit({
        title,
        description,
        tech_stack: techStack
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        github_repo: githubRepo,
        live_demo_url: liveDemoUrl || undefined,
      });
      setMessage("Project submitted for admin review.");
      setTitle("");
      setDescription("");
      setGithubRepo("");
      setLiveDemoUrl("");
      onSubmitted();
    } catch {
      setMessage("Unable to submit project. Ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit your project</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder="Project title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <Textarea
          placeholder="Describe the project impact and implementation"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <Input
          placeholder="Tech stack (comma separated)"
          value={techStack}
          onChange={(event) => setTechStack(event.target.value)}
        />
        <Input placeholder="GitHub repository URL" value={githubRepo} onChange={(event) => setGithubRepo(event.target.value)} />
        <Input
          placeholder="Live demo URL (optional)"
          value={liveDemoUrl}
          onChange={(event) => setLiveDemoUrl(event.target.value)}
        />
        {message && <p className="text-sm text-cyan-300">{message}</p>}
        <Button onClick={submit} disabled={loading || !title || !description || !githubRepo}>
          {loading ? "Submitting..." : "Submit Project"}
        </Button>
      </CardContent>
    </Card>
  );
}
