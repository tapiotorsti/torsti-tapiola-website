import type { Experience } from "./types";

export const experience: Experience[] = [
  {
    id: "northwind",
    role: "Senior Software Engineer",
    company: "Northwind Labs",
    context: "Developer platform · Remote",
    start: "2023",
    end: "Present",
    impact: [
      "Led the rewrite of the dashboard into a typed React app, cutting p75 load time from 3.8s to 1.1s.",
      "Designed an event pipeline processing 40M events/day with exactly-once delivery.",
      "Mentored 5 engineers and introduced an RFC process adopted company-wide.",
    ],
    tech: ["TypeScript", "React", "Go", "PostgreSQL", "Kafka"],
  },
  {
    id: "fjord",
    role: "Software Engineer",
    company: "Fjord Payments",
    context: "Fintech · Stockholm",
    start: "2020",
    end: "2023",
    impact: [
      "Built the merchant onboarding flow, raising completion rate by 34%.",
      "Owned the ledger reconciliation service handling €2B in annual volume.",
      "Reduced CI time by 60% via build caching and test sharding.",
    ],
    tech: ["Node.js", "React", "AWS", "Terraform"],
  },
  {
    id: "freelance",
    role: "Frontend Developer",
    company: "Independent",
    context: "Agencies & startups",
    start: "2018",
    end: "2020",
    impact: [
      "Shipped 12+ production sites and apps for clients across Europe.",
      "Built a reusable component library used across 6 client projects.",
    ],
    tech: ["JavaScript", "Vue", "Sass", "Figma"],
  },
];
