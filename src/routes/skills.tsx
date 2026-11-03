import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { skillsQuery } from "@/data";
import { Page, SectionHeader } from "@/components/site/primitives";

export const Route = createFileRoute("/skills")({
  head: () => ({
    meta: [
      { title: "Skills — Alex Lindqvist" },
      { name: "description", content: "Technical skills and focus areas across frontend, backend and DevOps." },
      { property: "og:title", content: "Skills — Alex Lindqvist" },
      { property: "og:description", content: "Technical skills and focus areas across frontend, backend and DevOps." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(skillsQuery),
  component: SkillsPage,
});

function SkillsPage() {
  const { data } = useSuspenseQuery(skillsQuery);
  return (
    <Page>
      <SectionHeader index="03" title="Skills & focus" intro="The tools I reach for, grouped by where they live in the stack." />
      <div className="grid md:grid-cols-2">
        {data.map((g, i) => (
          <section key={g.category} className="reveal border-b border-border py-10 md:odd:border-r md:odd:pr-10 md:even:pl-10" style={{ animationDelay: `${i * 70}ms` }}>
            <p className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight">{g.category}</h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 font-mono text-sm">
              {g.items.map((s) => (
                <li key={s} className="border-b border-border py-2">{s}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Page>
  );
}
