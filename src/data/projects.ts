import type { Project } from "./types";

export const projects: Project[] = [
  {
    id: "tracewell",
    title: "Tracewell",
    year: "2025",
    summary: "Open-source distributed tracing viewer for small teams.",
    role: "Creator · Full-stack",
    highlight: "Columnar storage with streaming queries over WebSockets.",
    stack: ["Rust", "React", "ClickHouse", "WebSockets"],
    liveUrl: "https://example.com",
    repoUrl: "https://github.com/",
    caseStudy: {
      problem:
        "Existing tracing tools were expensive and heavy to self-host for teams with fewer than 20 services.",
      approach:
        "A single binary ingests OpenTelemetry spans, stores them in ClickHouse, and streams query results to a lightweight UI.",
      architecture: [
        "Rust ingest service with backpressure-aware batching",
        "ClickHouse schema tuned for trace-id lookups",
        "Virtualized flamegraph rendering in React",
      ],
      metrics: [
        { label: "GitHub stars", value: "2.4k" },
        { label: "Ingest rate", value: "120k spans/s" },
        { label: "Binary size", value: "18 MB" },
      ],
    },
  },
  {
    id: "ledgerline",
    title: "Ledgerline",
    year: "2024",
    summary: "Real-time reconciliation dashboard for finance operations.",
    role: "Lead engineer",
    highlight: "Double-entry model with idempotent event replay.",
    stack: ["TypeScript", "Node.js", "PostgreSQL", "Redis"],
    liveUrl: "https://example.com",
    caseStudy: {
      problem: "Finance teams spent days each month matching transactions by hand in spreadsheets.",
      approach:
        "Automated matching rules with a human-in-the-loop review queue for exceptions.",
      architecture: [
        "Event-sourced ledger in PostgreSQL",
        "Rule engine compiled to SQL",
        "Optimistic UI with conflict resolution",
      ],
      metrics: [
        { label: "Manual work", value: "−82%" },
        { label: "Match accuracy", value: "99.7%" },
        { label: "Month-end close", value: "4d → 6h" },
      ],
    },
  },
  {
    id: "typeset",
    title: "Typeset UI",
    year: "2023",
    summary: "Accessible, headless component primitives for design systems.",
    role: "Maintainer",
    highlight: "Zero-runtime styling and full WAI-ARIA coverage.",
    stack: ["React", "TypeScript", "Vitest", "Storybook"],
    repoUrl: "https://github.com/",
    caseStudy: {
      problem: "Teams kept rebuilding the same accessible primitives with inconsistent behavior.",
      approach: "Unstyled primitives with strict a11y tests and composable APIs.",
      architecture: [
        "Compound component pattern with context slots",
        "Automated axe + keyboard interaction tests",
        "Tree-shakeable ESM packages",
      ],
      metrics: [
        { label: "Weekly downloads", value: "38k" },
        { label: "Bundle per primitive", value: "< 2 kB" },
      ],
    },
  },
  {
    id: "atlas",
    title: "Atlas CLI",
    year: "2022",
    summary: "Developer CLI for spinning up preview environments per pull request.",
    role: "Creator",
    highlight: "Ephemeral infra provisioned in under 90 seconds.",
    stack: ["Go", "Terraform", "Docker", "GitHub Actions"],
    repoUrl: "https://github.com/",
    caseStudy: {
      problem: "QA was blocked waiting on a single shared staging environment.",
      approach: "A CLI and GitHub Action that provisions isolated environments per PR.",
      architecture: [
        "Terraform modules with workspace isolation",
        "Container image caching layer",
        "Automatic teardown on merge",
      ],
      metrics: [
        { label: "Provision time", value: "87s" },
        { label: "Staging conflicts", value: "0" },
      ],
    },
  },
];
