-- Courses and certifications shown on the Experience page.
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  provider text NOT NULL DEFAULT '',
  completed text NOT NULL DEFAULT '',
  credential_url text CHECK (credential_url IS NULL OR credential_url ~* '^https://'),
  learned text NOT NULL DEFAULT '',
  skills text[] NOT NULL DEFAULT '{}',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.courses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.courses
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage" ON public.courses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
