import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import {
  helsinkiToday,
  pageViewsQuery,
  StatsNotSetUpError,
  summarizePageViews,
  type Counts,
} from "@/data/page-views";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/stats")({ component: AdminStats });

const fmt = new Intl.NumberFormat("en-US");

function AdminStats() {
  const { data, error, isPending } = useQuery(pageViewsQuery);

  return (
    <section>
      <h1 className="text-2xl font-medium tracking-tight">Stats</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Page views and visits on the public site. No cookies or personal data; your own visits while
        signed in are not counted. Days are in Finnish time.
      </p>

      {isPending && <p className="mt-8 font-mono text-xs text-muted-foreground">Loading…</p>}
      {error && (
        <p className="mt-8 text-sm text-muted-foreground">
          {error instanceof StatsNotSetUpError
            ? "Stats are not set up yet: apply migration 0006_page_views.sql to the database."
            : "Could not load stats."}
        </p>
      )}
      {data && <StatsView stats={summarizePageViews(data, helsinkiToday())} />}
    </section>
  );
}

function StatsView({ stats }: { stats: ReturnType<typeof summarizePageViews> }) {
  const max = Math.max(1, ...stats.daily.map((d) => d.views));

  return (
    <>
      <div className="mt-8 grid border-l border-t border-border sm:grid-cols-3">
        <Tile label="Today" counts={stats.today} />
        <Tile label="Last 30 days" counts={stats.last30} />
        <Tile label="All time" counts={stats.allTime} />
      </div>

      <h2 className="mt-12 font-mono text-xs text-muted-foreground">
        Page views, last {stats.daily.length} days
      </h2>
      <div className="mt-4 flex h-40 items-end gap-1 border-b border-border">
        {stats.daily.map((d) => (
          <div
            key={d.day}
            className="group relative flex h-full flex-1 flex-col justify-end"
            title={`${d.day}: ${d.views} views, ${d.visits} visits`}
          >
            <div
              className="bg-primary/80 transition-colors group-hover:bg-primary"
              style={{ height: `${(d.views / max) * 100}%`, minHeight: d.views ? 2 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-xs text-muted-foreground">
        <span>{stats.daily[0]?.day}</span>
        <span>{stats.daily.at(-1)?.day}</span>
      </div>

      <h2 className="mt-12 font-mono text-xs text-muted-foreground">By page</h2>
      {stats.byPath.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No views recorded yet.</p>
      ) : (
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Last 30 days</TableHead>
              <TableHead className="text-right">All-time views</TableHead>
              <TableHead className="text-right">Visits started here</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.byPath.map((p) => (
              <TableRow key={p.path}>
                <TableCell className="font-mono text-sm">{p.path}</TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {fmt.format(p.last30Views)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {fmt.format(p.views)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {fmt.format(p.visits)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

function Tile({ label, counts }: { label: string; counts: Counts }) {
  return (
    <div className="border-b border-r border-border p-6">
      <p className="font-mono text-xs text-muted-foreground">{label}</p>
      <p className="mt-3 text-4xl font-medium tracking-tight">{fmt.format(counts.visits)}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        visits · {fmt.format(counts.views)} page views
      </p>
    </div>
  );
}
