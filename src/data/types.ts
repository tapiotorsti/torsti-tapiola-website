export interface Profile {
  name: string;
  role: string;
  tagline: string;
  location: string;
  status: string;
  years_experience: string;
  email: string;
  socials: { label: string; href: string; handle: string }[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
  sort_order: number;
  kind: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  tech_stack: string[];
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  sort_order: number;
}

export interface Course {
  id: string;
  title: string;
  provider: string;
  completed: string;
  credential_url: string | null;
  learned: string;
  skills: string[];
  sort_order: number;
}

export interface SkillGroup {
  category: string;
  items: string[];
}
