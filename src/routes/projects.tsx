import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { loadSiteIdentity, pageTitle, projectsQuery, siteName, type Project } from "@/data";
import { seo } from "@/lib/seo";
import { isSafeUrl } from "@/lib/utils";
import { NewTabHint, Page, SectionHeader, Tag } from "@/components/site/primitives";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/projects")({
  head: ({ loaderData }) =>
    seo({
      title: pageTitle("Projects", loaderData),
      description: `Projects by ${siteName(loaderData)}, software developer: case studies with architecture, tech stack and outcomes.`,
      path: "/projects",
      siteName: siteName(loaderData),
    }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(projectsQuery);
    return loadSiteIdentity(context.queryClient);
  },
  component: ProjectsPage,
});

// `relative z-10` lifts the links above the card's full-size click target.
function Links({ p }: { p: Project }) {
  return (
    <div className="relative z-10 flex gap-4 font-mono text-xs">
      {isSafeUrl(p.live_url) && (
        <a
          href={p.live_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
        >
          Live <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          <span className="sr-only"> demo of {p.title}</span>
          <NewTabHint />
        </a>
      )}
      {isSafeUrl(p.github_url) && (
        <a
          href={p.github_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"
        >
          <Github className="h-3 w-3" aria-hidden="true" /> Repo
          <span className="sr-only"> of {p.title}</span>
          <NewTabHint />
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
      <SectionHeader
        index="02"
        title="Projects"
        intro="Selected builds. Open any project for the full case study."
      />
      <div className="mt-10 grid gap-px border border-border bg-border md:grid-cols-2">
        {data.map((p, i) => (
          <article
            key={p.id}
            className="reveal group relative flex flex-col bg-background p-6 transition-colors hover:bg-card md:p-8"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div aria-hidden="true" className="font-mono text-xs text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </div>
            <h2 className="mt-8 text-3xl font-medium tracking-tight group-hover:text-primary">
              {/* Real button (Enter + Space). Its ::after covers the card, so the whole card is
                  clickable and the keyboard focus ring is drawn around the whole card. */}
              <button
                type="button"
                onClick={() => setActive(p)}
                className="cursor-pointer text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ring focus-visible:after:outline-solid"
              >
                {p.title}
                <span className="sr-only">: open case study</span>
              </button>
            </h2>
            <p className="mt-3 text-muted-foreground">{p.summary}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {p.tech_stack.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            <div className="mt-auto flex items-center justify-between pt-8">
              <Links p={p} />
              <span
                aria-hidden="true"
                className="font-mono text-xs text-muted-foreground group-hover:text-primary"
              >
                Case study →
              </span>
            </div>
          </article>
        ))}
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-border bg-background sm:max-w-xl"
        >
          {active && (
            <div className="pt-6">
              <SheetTitle className="text-4xl font-medium tracking-tight">
                {active.title}
              </SheetTitle>
              <SheetDescription className="mt-2">{active.summary}</SheetDescription>
              <div className="mt-6">
                <Links p={active} />
              </div>
              <div className="case-study mt-8 space-y-4 text-sm leading-relaxed [&_blockquote]:border-l [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_h2]:mt-8 [&_h2]:border-t [&_h2]:border-border [&_h2]:pt-6 [&_h2]:font-mono [&_h2]:text-xs [&_h2]:text-muted-foreground [&_li]:ml-4 [&_li]:list-disc [&_li]:marker:text-primary [&_strong]:font-medium">
                <ReactMarkdown>{active.content}</ReactMarkdown>
              </div>
              <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
                {active.tech_stack.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </Page>
  );
}
