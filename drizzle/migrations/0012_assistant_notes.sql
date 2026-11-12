-- Extra background for the AI assistant (hobbies, favourites, working style ...).
-- Not shown on the site. Visitors have no direct access: only the admin (through
-- RLS) and the server (service role, when building the assistant's prompt) can
-- read it. Anything here can still be repeated by the assistant to any visitor.
CREATE TABLE public.assistant_notes (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  interests text NOT NULL DEFAULT '' CHECK (char_length(interests) <= 2000),
  favourites text NOT NULL DEFAULT '' CHECK (char_length(favourites) <= 2000),
  work_style text NOT NULL DEFAULT '' CHECK (char_length(work_style) <= 2000),
  learning text NOT NULL DEFAULT '' CHECK (char_length(learning) <= 2000),
  fun_facts text NOT NULL DEFAULT '' CHECK (char_length(fun_facts) <= 2000),
  other text NOT NULL DEFAULT '' CHECK (char_length(other) <= 2000),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Supabase's default privileges grant ALL on new tables to anon and
-- authenticated; remove them before granting only what is needed.
REVOKE ALL ON public.assistant_notes FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.assistant_notes TO authenticated;
GRANT ALL ON public.assistant_notes TO service_role;

ALTER TABLE public.assistant_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage" ON public.assistant_notes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.assistant_notes (id) VALUES (1);
