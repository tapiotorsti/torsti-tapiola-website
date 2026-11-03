import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { experienceQuery } from "@/data";
import { Page, SectionHeader, Tag } from "@/components/site/primitives";

export const Route = createFileRoute("/experience")({
  head: () => ({
    meta: [
      { title: "Experience — Alex Lindqvist" },
      { name: "description", content: "Roles, impact and technologies across Alex Lindqvist's engineering career." },
      { property: "og:title", content: "Experience — Alex Lindqvist" },
      { property: "og:description", content: "Roles, impact and technologies across an engineering career." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(experienceQuery),
  component: ExperiencePage,
});

function ExperiencePage() {
  const { data } = useSuspenseQuery(experienceQuery);
  return (
    <Page>
      <SectionHeader index="01" title="Experience" intro="Where I've worked and what changed because I was there." />
      <ol>
        {data.map((e, i) => (
          <li key={e.id} className="reveal grid gap-4 border-b border-border py-10 md:grid-cols-12" style={{ animationDelay: `${i * 80}ms` }}>
            <p className="font-mono text-xs text-muted-foreground md:col-span-3">
              {e.start} — <span className={e.end === "Present" ? "text-primary" : ""}>{e.end}</span>
            </p>
            <div className="md:col-span-9">
              <h2 className="text-2xl font-medium tracking-tight">{e.role}</h2>
              <p className="mt-1 text-muted-foreground">{e.company} · <span className="font-mono text-xs">{e.context}</span></p>
              <ul className="mt-6 space-y-3">
                {e.impact.map((b) => (
                  <li key={b} className="flex gap-3 text-sm leading-relaxed">
                    <span className="mt-2 h-px w-3 shrink-0 bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">{e.tech.map((t) => <Tag key={t}>{t}</Tag>)}</div>
            </div>
          </li>
        ))}
      </ol>
    </Page>
  );
}
