// Admin-only page view statistics (read through the signed-in browser client; RLS allows admins only).
import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export interface PageViewRow {
  day: string; // YYYY-MM-DD, Europe/Helsinki
  path: string;
  views: number;
  visits: number;
}

export interface Counts {
  views: number;
  visits: number;
}

export interface PageViewStats {
  today: Counts;
  last30: Counts;
  allTime: Counts;
  daily: ({ day: string } & Counts)[]; // oldest first
  byPath: ({ path: string; last30Views: number } & Counts)[]; // most viewed first
}

export class StatsNotSetUpError extends Error {}

const PAGE_SIZE = 1000;

export const pageViewsQuery = queryOptions({
  queryKey: ["page-views"],
  queryFn: async (): Promise<PageViewRow[]> => {
    const rows: PageViewRow[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("page_views")
        .select("day, path, views, visits")
        .order("day")
        .order("path")
        .range(from, from + PAGE_SIZE - 1);
      if (error) {
        // Table missing: migration 0006 has not been applied yet.
        if (error.code === "PGRST205" || error.code === "42P01") throw new StatsNotSetUpError();
        throw new Error("Could not load stats");
      }
      rows.push(...data);
      if (data.length < PAGE_SIZE) return rows;
    }
  },
});

export function helsinkiToday(now = new Date()): string {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" }).format(now);
}

export function shiftDay(day: string, deltaDays: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

const add = (a: Counts, r: Counts) => {
  a.views += r.views;
  a.visits += r.visits;
};

export function summarizePageViews(
  rows: PageViewRow[],
  today: string,
  dailyDays = 14,
): PageViewStats {
  const since30 = shiftDay(today, -29);
  const sinceDaily = shiftDay(today, -(dailyDays - 1));

  const stats: PageViewStats = {
    today: { views: 0, visits: 0 },
    last30: { views: 0, visits: 0 },
    allTime: { views: 0, visits: 0 },
    daily: Array.from({ length: dailyDays }, (_, i) => ({
      day: shiftDay(sinceDaily, i),
      views: 0,
      visits: 0,
    })),
    byPath: [],
  };

  const paths = new Map<string, PageViewStats["byPath"][number]>();
  for (const r of rows) {
    add(stats.allTime, r);
    if (r.day === today) add(stats.today, r);
    if (r.day >= since30 && r.day <= today) add(stats.last30, r);

    const d = stats.daily.find((x) => x.day === r.day);
    if (d) add(d, r);

    let p = paths.get(r.path);
    if (!p) paths.set(r.path, (p = { path: r.path, views: 0, visits: 0, last30Views: 0 }));
    add(p, r);
    if (r.day >= since30 && r.day <= today) p.last30Views += r.views;
  }

  stats.byPath = [...paths.values()].sort((a, b) => b.views - a.views);
  return stats;
}
