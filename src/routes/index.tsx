import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight, Github, Linkedin, Mail } from "lucide-react";
import { experienceQuery, profileQuery, projectsQuery } from "@/data";
import { Page, Tag } from "@/components/site/primitives";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alex Lindqvist — Senior Software Engineer" },
      { name: "description", content: "Portfolio of Alex Lindqvist, a software engineer building fast, reliable web products." },
      { property: "og:title", content: "Alex Lindqvist — Senior Software Engineer" },
      { property: "og:description", content: "Selected work, experience and contact for Alex Lindqvist." },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(projectsQuery),
      context.queryClient.ensureQueryData(experienceQuery),
    ]),
  component: Home,
});

function Home() {
  const { data: p } = useSuspenseQuery(profileQuery);
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const { data: exp } = useSuspenseQuery(experienceQuery);
  const icons: Record<string, typeof Github> = { GitHub: Github, LinkedIn: Linkedin };

  return (
    <Page>
      <section className="reveal grid gap-10 border-b border-border pb-16 md:grid-cols-12 md:pb-24">
        <div className="md:col-span-9">
          <span className="inline-flex items-center gap-2 border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            {p.status}
          </span>
          <h1 className="mt-8 text-5xl font-medium tracking-tighter md:text-8xl">{p.name}</h1>
          <p className="mt-3 font-mono text-sm text-primary">{p.role} · {p.location}</p>
          <p className="mt-8 max-w-2xl text-lg text-muted-foreground md:text-xl">{p.tagline}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            {p.socials.map((s) => {
              const Icon = icons[s.label] ?? ArrowUpRight;
              return (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary">
                  <Icon className="h-4 w-4" /> {s.label}
                </a>
              );
            })}
            <a href={`mailto:${p.email}`}
              className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90">
              <Mail className="h-4 w-4" /> {p.email}
            </a>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-px self-end border border-border bg-border md:col-span-3 md:grid-cols-1">
          {[
            ["Years", "8+"],
            ["Projects", String(projects.length).padStart(2, "0")],
            ["Roles", String(exp.length).padStart(2, "0")],
          ].map(([k, v]) => (
            <div key={k} className="bg-background p-4">
              <dt className="font-mono text-[10px] uppercase text-muted-foreground">{k}</dt>
              <dd className="mt-1 font-mono text-2xl">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-8 py-16 md:grid-cols-12">
        <h2 className="font-mono text-xs text-primary md:col-span-3">Selected work /</h2>
        <ul className="md:col-span-9">
          {projects.slice(0, 3).map((pr) => (
            <li key={pr.id}>
              <Link to="/projects" className="group grid grid-cols-12 items-baseline gap-4 border-b border-border py-5">
                <span className="col-span-2 font-mono text-xs text-muted-foreground">{pr.year}</span>
                <span className="col-span-10 text-xl group-hover:text-primary md:col-span-4">{pr.title}</span>
                <span className="col-span-12 text-sm text-muted-foreground md:col-span-5">{pr.summary}</span>
                <ArrowUpRight className="hidden h-4 w-4 text-muted-foreground group-hover:text-primary md:col-span-1 md:block md:justify-self-end" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-8 md:grid-cols-12">
        <h2 className="font-mono text-xs text-primary md:col-span-3">Currently /</h2>
        <div className="md:col-span-9">
          <p className="text-xl">{exp[0].role} at {exp[0].company}</p>
          <div className="mt-4 flex flex-wrap gap-2">{exp[0].tech.map((t) => <Tag key={t}>{t}</Tag>)}</div>
          <Link to="/experience" className="mt-6 inline-block font-mono text-xs text-muted-foreground hover:text-primary">
            Full experience →
          </Link>
        </div>
      </section>
    </Page>
  );
}
