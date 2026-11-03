import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { projectsQuery, type Project } from "@/data";
import { isSafeUrl } from "@/lib/utils";
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
      {isSafeUrl(p.live_url) && (
        <a href={p.live_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary">
          Live <ArrowUpRight className="h-3 w-3" />
        </a>
      )}
      {isSafeUrl(p.github_url) && (
        <a href={p.github_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
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
              <span>{String(i + 1).padStart(2, "0")}</span>
              {p.featured && <span className="text-primary">Featured</span>}
            </div>
            <h2 className="mt-8 text-3xl font-medium tracking-tight group-hover:text-primary">{p.title}</h2>
            <p className="mt-3 text-muted-foreground">{p.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">{p.tech_stack.map((t) => <Tag key={t}>{t}</Tag>)}</div>
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
              <SheetTitle className="text-4xl font-medium tracking-tight">{active.title}</SheetTitle>
              <SheetDescription className="mt-2">{active.summary}</SheetDescription>
              <div className="mt-6"><Links p={active} /></div>
              <div className="case-study mt-8 space-y-4 text-sm leading-relaxed [&_blockquote]:border-l [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_h2]:mt-8 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-6 [&_h2]:font-mono [&_h2]:text-xs [&_h2]:text-muted-foreground [&_li]:ml-4 [&_li]:list-disc [&_li]:marker:text-primary [&_strong]:font-medium">
                <ReactMarkdown>{active.content}</ReactMarkdown>
              </div>
              <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
                {active.tech_stack.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Page>
  );
}
