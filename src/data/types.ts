export interface Profile {
  name: string;
  role: string;
  tagline: string;
  location: string;
  status: string;
  email: string;
  socials: { label: string; href: string; handle: string }[];
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  context: string;
  start: string;
  end: string;
  impact: string[];
  tech: string[];
}

export interface Project {
  id: string;
  title: string;
  year: string;
  summary: string;
  role: string;
  highlight: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  caseStudy: {
    problem: string;
    approach: string;
    architecture: string[];
    metrics: { label: string; value: string }[];
  };
}

export interface SkillGroup {
  id: string;
  title: string;
  description: string;
  items: string[];
}
