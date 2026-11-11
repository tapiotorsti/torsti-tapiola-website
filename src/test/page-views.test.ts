import { describe, expect, it } from "vitest";

import { helsinkiToday, shiftDay, summarizePageViews } from "@/data/page-views";
import { toTrackedPath } from "@/lib/page-view-tracking";

describe("summarizePageViews", () => {
  const rows = [
    { day: "2026-09-01", path: "/", views: 10, visits: 8 },
    { day: "2026-11-01", path: "/", views: 5, visits: 4 },
    { day: "2026-11-01", path: "/projects", views: 7, visits: 1 },
    { day: "2026-11-11", path: "/", views: 3, visits: 2 },
    { day: "2026-11-11", path: "/skills", views: 1, visits: 0 },
  ];
  const stats = summarizePageViews(rows, "2026-11-11", 14);

  it("totals today, last 30 days and all time", () => {
    expect(stats.today).toEqual({ views: 4, visits: 2 });
    expect(stats.last30).toEqual({ views: 16, visits: 7 });
    expect(stats.allTime).toEqual({ views: 26, visits: 15 });
  });

  it("returns one daily bucket per day, oldest first, including empty days", () => {
    expect(stats.daily).toHaveLength(14);
    expect(stats.daily[0]?.day).toBe("2026-10-29");
    expect(stats.daily.at(-1)).toEqual({ day: "2026-11-11", views: 4, visits: 2 });
    expect(stats.daily.find((d) => d.day === "2026-11-05")).toEqual({
      day: "2026-11-05",
      views: 0,
      visits: 0,
    });
  });

  it("ranks pages by all-time views with a last-30-days column", () => {
    expect(stats.byPath.map((p) => p.path)).toEqual(["/", "/projects", "/skills"]);
    expect(stats.byPath[0]).toEqual({ path: "/", views: 18, visits: 14, last30Views: 8 });
  });
});

describe("date helpers", () => {
  it("shifts across month and year boundaries", () => {
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
    expect(shiftDay("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("uses Finnish time for today", () => {
    // 22:30 UTC on 11 Nov is already 12 Nov in Helsinki (UTC+2).
    expect(helsinkiToday(new Date("2026-11-11T22:30:00Z"))).toBe("2026-11-12");
  });
});

describe("toTrackedPath", () => {
  it("tracks public routes and skips admin, root and unknown", () => {
    expect(toTrackedPath("/")).toBe("/");
    expect(toTrackedPath("/projects")).toBe("/projects");
    expect(toTrackedPath("/admin/")).toBeNull();
    expect(toTrackedPath("/admin_/login")).toBeNull();
    expect(toTrackedPath("__root__")).toBeNull();
    expect(toTrackedPath(undefined)).toBeNull();
  });
});
