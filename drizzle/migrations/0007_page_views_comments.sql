-- Records the privacy contract of the page view counters (0006_page_views.sql).
COMMENT ON TABLE public.page_views IS 'Daily page view and visit counters per public path (Europe/Helsinki). No cookies, IP addresses, user agents or other personal data.';
COMMENT ON COLUMN public.page_views.day IS 'Calendar day in Europe/Helsinki.';
COMMENT ON COLUMN public.page_views.path IS 'Public route path, e.g. /projects. Admin paths are never recorded.';
COMMENT ON COLUMN public.page_views.views IS 'Total page views on this day for this path.';
COMMENT ON COLUMN public.page_views.visits IS 'Visits that started on this day for this path.';