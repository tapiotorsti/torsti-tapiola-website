// Privacy-friendly page view counting: one RPC per page view, nothing stored on
// the visitor's device and no personal data sent. See drizzle/migrations/0006_page_views.sql.
import { useEffect } from "react";
import { rootRouteId, useRouterState } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { isPreviewHost } from "@/lib/security-headers";

// The first counted view of a page load is a "visit"; later client-side
// navigations in the same tab are page views of that visit.
let firstViewOfPageLoad = true;

export function toTrackedPath(routeId: string | undefined): string | null {
  if (!routeId || routeId === rootRouteId || routeId.startsWith("/admin")) return null;
  return routeId.length > 1 ? routeId.replace(/\/$/, "") : routeId;
}

export function usePageViewTracking() {
  // The leaf route id is one of a fixed set (e.g. "/projects"), so arbitrary
  // or 404 URLs never become counter rows.
  const routeId = useRouterState({
    select: (s) => (s.status === "idle" ? s.matches.at(-1)?.routeId : undefined),
  });

  useEffect(() => {
    const path = toTrackedPath(routeId);
    if (!path) return;
    if (import.meta.env.DEV || isPreviewHost(window.location.hostname) || navigator.webdriver) {
      return;
    }

    const newVisit = firstViewOfPageLoad;
    firstViewOfPageLoad = false;

    void (async () => {
      try {
        // The only account is the admin: don't count the owner's own visits.
        const { data } = await supabase.auth.getSession();
        if (data.session) return;
        await supabase.rpc("record_page_view", { _path: path, _new_visit: newVisit });
      } catch {
        // Counting must never break the site.
      }
    })();
  }, [routeId]);
}
