export type UserRole = "Admin/Leader" | "Core-Team" | "Member";
export type Department = "CSE-DS" | "CSE-CyberSecurity" | "General-CSE" | "Other";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  github_url?: string | null;
  linkedin_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: User;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  rsvp_limit: number;
  rsvp_count: number;
  spots_left: number;
  is_rsvped: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_repo: string;
  live_demo_url?: string | null;
  creator_id: string;
  approved: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_members: number;
  total_events: number;
  total_rsvps: number;
  top_projects: Array<{ title: string; stack_size: number }>;
}
