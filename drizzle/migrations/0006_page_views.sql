-- Privacy-friendly page view counter.
-- Stores only a count per page per day (Europe/Helsinki). No cookies, IP
-- addresses, user agents or other personal data.

CREATE TABLE public.page_views (
  day date NOT NULL,
  path text NOT NULL CHECK (path ~ '^/[a-z0-9/_-]{0,100}$'),
  views integer NOT NULL DEFAULT 0 CHECK (views >= 0),
  visits integer NOT NULL DEFAULT 0 CHECK (visits >= 0),
  PRIMARY KEY (day, path)
);

-- Only the admin can read the stats; nobody writes to the table directly.
-- Supabase grants new tables to anon/authenticated by default, so revoke first.
REVOKE ALL ON public.page_views FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read" ON public.page_views
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- The only write path: increments one counter row. Rejects malformed and admin paths.
CREATE OR REPLACE FUNCTION public.record_page_view(_path text, _new_visit boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _path IS NULL OR _path !~ '^/[a-z0-9/_-]{0,100}$' OR _path LIKE '/admin%' THEN
    RETURN;
  END IF;

  INSERT INTO public.page_views AS pv (day, path, views, visits)
  VALUES (
    (now() AT TIME ZONE 'Europe/Helsinki')::date,
    _path,
    1,
    CASE WHEN _new_visit THEN 1 ELSE 0 END
  )
  ON CONFLICT (day, path) DO UPDATE
    SET views = pv.views + 1,
        visits = pv.visits + EXCLUDED.visits;
END
$$;

REVOKE EXECUTE ON FUNCTION public.record_page_view(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_page_view(text, boolean) TO anon, authenticated, service_role;
