import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import { projectsQuery, type Project } from "@/data";
import { Page, SectionHeader, Tag } from "@/components/site/primitives";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Alex Lindqvist" },
      { name: "description", content: "Featured projects and case studies: architecture, stack and outcomes." },
      { property: "og:title", content: "Projects — Alex Lindqvist" },
      { property: "og:description", content: "Featured projects and case studies with architecture and outcomes." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(projectsQuery),
  component: ProjectsPage,
});

function Links({ p }: { p: Project }) {
  return (
    <div className="flex gap-4 font-mono text-xs">
      {p.liveUrl && (
        <a href={p.liveUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
          Live <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
      {p.repoUrl && (
        <a href={p.repoUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
          <Github className="h-3 w-3" /> Repo
        </a>
      )}
    </div>
  );
}

function ProjectsPage() {
  const { data } = useSuspenseQuery(projectsQuery);
  const [active, setActive] = useState<Project | null>(null);

  return (
    <Page>
      <SectionHeader index="02" title="Projects" intro="Selected builds. Open any project for the full case study." />
      <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2">
        {data.map((p, i) => (
          <article
            key={p.id}
            role="button"
            tabIndex={0}
            onClick={() => setActive(p)}
            onKeyDown={(e) => e.key === "Enter" && setActive(p)}
            className="reveal group flex cursor-pointer flex-col bg-background p-6 transition-colors hover:bg-card md:p-8"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>{String(i + 1).padStart(2, "0")} — {p.year}</span>
              <span>{p.role}</span>
            </div>
            <h2 className="mt-8 text-3xl font-medium tracking-tight group-hover:text-primary">{p.title}</h2>
            <p className="mt-3 text-muted-foreground">{p.summary}</p>
            <p className="mt-6 border-l border-primary pl-3 text-sm">{p.highlight}</p>
            <div className="mt-6 flex flex-wrap gap-2">{p.stack.map((t) => <Tag key={t}>{t}</Tag>)}</div>
            <div className="mt-auto flex items-center justify-between pt-8">
              <Links p={p} />
              <span className="font-mono text-xs text-muted-foreground group-hover:text-primary">Case study →</span>
            </div>
          </article>
        ))}
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto border-border bg-background sm:max-w-xl">
          {active && (
            <div className="pt-6">
              <p className="font-mono text-xs text-primary">{active.year} · {active.role}</p>
              <SheetTitle className="mt-3 text-4xl font-medium tracking-tight">{active.title}</SheetTitle>
              <SheetDescription className="mt-2">{active.summary}</SheetDescription>
              <div className="mt-6"><Links p={active} /></div>

              {active.caseStudy.metrics.length > 0 && (
                <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3">
                  {active.caseStudy.metrics.map((m) => (
                    <div key={m.label} className="bg-background p-4">
                      <dt className="font-mono text-[10px] uppercase text-muted-foreground">{m.label}</dt>
                      <dd className="mt-1 font-mono text-lg">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {[["Problem", active.caseStudy.problem], ["Approach", active.caseStudy.approach]].map(([k, v]) => (
                <section key={k} className="mt-8 border-t border-border pt-6">
                  <h3 className="font-mono text-xs text-muted-foreground">{k} /</h3>
                  <p className="mt-3 leading-relaxed">{v}</p>
                </section>
              ))}
              <section className="mt-8 border-t border-border pt-6">
                <h3 className="font-mono text-xs text-muted-foreground">Architecture /</h3>
                <ul className="mt-3 space-y-2">
                  {active.caseStudy.architecture.map((a) => (
                    <li key={a} className="flex gap-3 text-sm"><span className="mt-2 h-px w-3 shrink-0 bg-primary" />{a}</li>
                  ))}
                </ul>
              </section>
              <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
                {active.stack.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Page>
  );
}
