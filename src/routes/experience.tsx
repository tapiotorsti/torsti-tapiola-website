import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import {
  coursesQuery,
  experienceQuery,
  loadSiteIdentity,
  pageTitle,
  siteName,
  type Course,
  type Experience,
} from "@/data";
import { seo } from "@/lib/seo";
import { isSafeUrl } from "@/lib/utils";
import { NewTabHint, Page, SectionHeader, Tag } from "@/components/site/primitives";

export const Route = createFileRoute("/experience")({
  head: ({ loaderData }) =>
    seo({
      title: pageTitle("Experience", loaderData),
      description: `Work experience, education and courses of ${siteName(loaderData)}: roles, impact and the technologies used.`,
      path: "/experience",
      siteName: siteName(loaderData),
    }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(experienceQuery),
      context.queryClient.ensureQueryData(coursesQuery),
    ]);
    return loadSiteIdentity(context.queryClient);
  },
  component: ExperiencePage,
});

function EntryList({ items }: { items: Experience[] }) {
  return (
    <ol>
      {items.map((e, i) => (
        <li
          key={e.id}
          className="reveal grid gap-4 border-b border-border py-10 md:grid-cols-12"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <p className="font-mono text-xs text-muted-foreground md:col-span-3">
            <span className={e.period.includes("Present") ? "text-primary" : ""}>{e.period}</span>
          </p>
          <div className="md:col-span-9">
            <h2 className="text-2xl font-medium tracking-tight">{e.role}</h2>
            <p className="mt-1 text-muted-foreground">{e.company}</p>
            {e.description.trim() && (
              <ul className="mt-6 space-y-3">
                {e.description
                  .split("\n")
                  .filter(Boolean)
                  .map((b) => (
                    <li key={b} className="flex gap-3 text-sm leading-relaxed">
                      <span className="mt-2 h-px w-3 shrink-0 bg-primary" />
                      {b}
                    </li>
                  ))}
              </ul>
            )}
            {e.skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {e.skills.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function CourseList({ items }: { items: Course[] }) {
  return (
    <ol>
      {items.map((c, i) => (
        <li
          key={c.id}
          className="reveal grid gap-4 border-b border-border py-10 md:grid-cols-12"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <p className="font-mono text-xs text-muted-foreground md:col-span-3">{c.completed}</p>
          <div className="md:col-span-9">
            <h3 className="text-2xl font-medium tracking-tight">{c.title}</h3>
            {c.provider.trim() && <p className="mt-1 text-muted-foreground">{c.provider}</p>}
            {c.learned.trim() && (
              <div className="mt-6">
                <p className="font-mono text-xs text-primary">What I learned</p>
                <div className="mt-2 space-y-3 text-sm leading-relaxed">
                  {c.learned
                    .trim()
                    .split(/\n\s*\n/)
                    .map((para) => (
                      <p key={para} className="whitespace-pre-line">
                        {para.trim()}
                      </p>
                    ))}
                </div>
              </div>
            )}
            {c.skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {c.skills.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            )}
            {isSafeUrl(c.credential_url) && (
              <a
                href={c.credential_url}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
              >
                View certificate
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                <NewTabHint />
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function ExperiencePage() {
  const { data } = useSuspenseQuery(experienceQuery);
  const { data: courses } = useSuspenseQuery(coursesQuery);
  const work = data.filter((e) => e.kind !== "education");
  const education = data.filter((e) => e.kind === "education");
  return (
    <Page>
      <SectionHeader index="01" title="Experience" />
      <EntryList items={work} />
      {education.length > 0 && (
        <div className="mt-20">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Education
          </h2>
          <EntryList items={education} />
        </div>
      )}
      {courses.length > 0 && (
        <div className="mt-20">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Courses &amp; certifications
          </h2>
          <CourseList items={courses} />
        </div>
      )}
    </Page>
  );
}
