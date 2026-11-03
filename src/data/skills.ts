import type { SkillGroup } from "./types";

export const skills: SkillGroup[] = [
  {
    id: "frontend",
    title: "Frontend & UI",
    description: "Interfaces that are fast, accessible and built to last.",
    items: ["TypeScript", "React", "TanStack", "Tailwind CSS", "Design systems", "Accessibility", "Web performance"],
  },
  {
    id: "backend",
    title: "Backend & Systems",
    description: "Services and data models that stay simple under load.",
    items: ["Node.js", "Go", "Rust", "PostgreSQL", "Redis", "Kafka", "API design"],
  },
  {
    id: "tooling",
    title: "Tooling & DevOps",
    description: "Pipelines and infrastructure that get out of the way.",
    items: ["Docker", "Terraform", "AWS", "Cloudflare", "GitHub Actions", "Observability"],
  },
  {
    id: "practice",
    title: "Practice",
    description: "How I work with teams.",
    items: ["Technical writing", "RFCs", "Mentoring", "Code review", "Product thinking"],
  },
];
