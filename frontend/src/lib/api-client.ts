import axios from "axios";

import type { AuthResponse, DashboardStats, EventItem, ProjectItem } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authApi = {
  register: (payload: {
    name: string;
    email: string;
    password: string;
    department: string;
    github_url?: string;
    linkedin_url?: string;
  }) => api.post<AuthResponse>("/api/v1/auth/register", payload),

  login: (payload: { email: string; password: string }) => api.post<AuthResponse>("/api/v1/auth/login", payload),

  logout: () => api.post("/api/v1/auth/logout"),

  me: () => api.get<AuthResponse>("/api/v1/auth/me"),
  forgotPassword: (payload: { email: string }) => api.post<string>("/api/v1/auth/forgot-password", payload),

  resetPassword: (payload: { token: string; new_password: string }) => api.post<string>("/api/v1/auth/reset-password", payload),

  verifyEmail: (payload: { token: string }) => api.post<string>("/api/v1/auth/verify-email", payload),
};

export const eventsApi = {
  list: () => api.get<EventItem[]>("/api/v1/events"),
  create: (payload: {
    title: string;
    description: string;
    location: string;
    start_time: string;
    end_time: string;
    rsvp_limit: number;
  }) => api.post<EventItem>("/api/v1/events", payload),
  rsvp: (eventId: string) => api.post<EventItem>(`/api/v1/events/${eventId}/rsvp`),
  exportCsv: (eventId: string) =>
    api.get<string>(`/api/v1/events/${eventId}/rsvps/export`, {
      responseType: "text",
    }),
};

export const projectsApi = {
  list: () => api.get<ProjectItem[]>("/api/v1/projects"),
  listAll: () => api.get<ProjectItem[]>("/api/v1/projects/all"),
  submit: (payload: {
    title: string;
    description: string;
    tech_stack: string[];
    github_repo: string;
    live_demo_url?: string;
  }) => api.post<ProjectItem>("/api/v1/projects/submit", payload),
  approve: (projectId: string, approved: boolean) =>
    api.patch<ProjectItem>(`/api/v1/projects/${projectId}/approve`, { approved }),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>("/api/v1/dashboard/stats"),
};

export default api;
