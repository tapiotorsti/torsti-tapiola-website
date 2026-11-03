CREATE TABLE public.site_profile (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  socials jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_profile TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_profile TO authenticated;
GRANT ALL ON public.site_profile TO service_role;
ALTER TABLE public.site_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.site_profile FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage" ON public.site_profile FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.site_profile (id, name, role, tagline, location, status, email, socials) SELECT 1, 'Alex Lindqvist', 'Senior Software Engineer', 'I design and build fast, reliable web products — from typed interfaces down to the systems that keep them running.', 'Helsinki, FI', 'Available for projects', 'hello@alexlindqvist.dev', '[{"label":"GitHub","href":"https://github.com/","handle":"@alexlindqvist"},{"label":"LinkedIn","href":"https://linkedin.com/","handle":"in/alexlindqvist"}]'::jsonb;