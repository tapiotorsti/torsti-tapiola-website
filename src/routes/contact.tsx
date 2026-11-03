import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { profileQuery } from "@/data";
import { Page, SectionHeader } from "@/components/site/primitives";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Alex Lindqvist" },
      { name: "description", content: "Get in touch with Alex Lindqvist for projects, roles or collaboration." },
      { property: "og:title", content: "Contact — Alex Lindqvist" },
      { property: "og:description", content: "Get in touch for projects, roles or collaboration." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: ContactPage,
});

function ContactPage() {
  const { data: p } = useSuspenseQuery(profileQuery);
  return (
    <Page>
      <SectionHeader index="04" title="Contact" intro="Have a project, role or idea? Email is the fastest way to reach me." />
      <a href={`mailto:${p.email}`} className="reveal group mt-12 block break-all text-3xl font-medium tracking-tight hover:text-primary md:text-6xl">
        {p.email}
        <ArrowUpRight className="ml-2 inline h-8 w-8 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 md:h-12 md:w-12" />
      </a>
      <ul className="mt-16 border-t border-border">
        {p.socials.map((s) => (
          <li key={s.label}>
            <a href={s.href} target="_blank" rel="noreferrer" className="group grid grid-cols-12 items-baseline border-b border-border py-5">
              <span className="col-span-4 font-mono text-xs text-muted-foreground md:col-span-3">{s.label}</span>
              <span className="col-span-7 group-hover:text-primary md:col-span-8">{s.handle}</span>
              <ArrowUpRight className="col-span-1 h-4 w-4 justify-self-end text-muted-foreground group-hover:text-primary" />
            </a>
          </li>
        ))}
      </ul>
    </Page>
  );
}
