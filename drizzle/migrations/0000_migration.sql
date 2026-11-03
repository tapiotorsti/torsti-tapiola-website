CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role public.app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE TABLE public.projects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, slug text NOT NULL UNIQUE, summary text NOT NULL DEFAULT '', content text NOT NULL DEFAULT '', tech_stack text[] NOT NULL DEFAULT '{}', live_url text, github_url text, featured boolean NOT NULL DEFAULT false, sort_order int NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.experience (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), role text NOT NULL, company text NOT NULL, period text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '', skills text[] NOT NULL DEFAULT '{}', sort_order int NOT NULL DEFAULT 0);
CREATE TABLE public.skills (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), category text NOT NULL, name text NOT NULL, sort_order int NOT NULL DEFAULT 0);

GRANT SELECT ON public.projects, public.experience, public.skills TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects, public.experience, public.skills TO authenticated;
GRANT ALL ON public.projects, public.experience, public.skills TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.projects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON public.experience FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read" ON public.skills FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage" ON public.projects FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage" ON public.experience FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage" ON public.skills FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.projects (title, slug, summary, content, tech_stack, live_url, github_url, featured, sort_order) VALUES
('Tracewell','tracewell','Open-source distributed tracing viewer for small teams.',
E'**2025 · Creator · Full-stack**\n\n> Columnar storage with streaming queries over WebSockets.\n\n## Problem\nExisting tracing tools were expensive and heavy to self-host for teams with fewer than 20 services.\n\n## Approach\nA single binary ingests OpenTelemetry spans, stores them in ClickHouse, and streams query results to a lightweight UI.\n\n## Architecture\n- Rust ingest service with backpressure-aware batching\n- ClickHouse schema tuned for trace-id lookups\n- Virtualized flamegraph rendering in React\n\n## Results\n- **GitHub stars:** 2.4k\n- **Ingest rate:** 120k spans/s\n- **Binary size:** 18 MB',
ARRAY['Rust','React','ClickHouse','WebSockets'],'https://example.com','https://github.com/',true,1),
('Ledgerline','ledgerline','Real-time reconciliation dashboard for finance operations.',
E'**2024 · Lead engineer**\n\n> Double-entry model with idempotent event replay.\n\n## Problem\nFinance teams spent days each month matching transactions by hand in spreadsheets.\n\n## Approach\nAutomated matching rules with a human-in-the-loop review queue for exceptions.\n\n## Architecture\n- Event-sourced ledger in PostgreSQL\n- Rule engine compiled to SQL\n- Optimistic UI with conflict resolution\n\n## Results\n- **Manual work:** −82%\n- **Match accuracy:** 99.7%\n- **Month-end close:** 4d → 6h',
ARRAY['TypeScript','Node.js','PostgreSQL','Redis'],'https://example.com',NULL,true,2),
('Typeset UI','typeset','Accessible, headless component primitives for design systems.',
E'**2023 · Maintainer**\n\n> Zero-runtime styling and full WAI-ARIA coverage.\n\n## Problem\nTeams kept rebuilding the same accessible primitives with inconsistent behavior.\n\n## Approach\nUnstyled primitives with strict a11y tests and composable APIs.\n\n## Architecture\n- Compound component pattern with context slots\n- Automated axe + keyboard interaction tests\n- Tree-shakeable ESM packages\n\n## Results\n- **Weekly downloads:** 38k\n- **Bundle per primitive:** < 2 kB',
ARRAY['React','TypeScript','Vitest','Storybook'],NULL,'https://github.com/',true,3),
('Atlas CLI','atlas','Developer CLI for spinning up preview environments per pull request.',
E'**2022 · Creator**\n\n> Ephemeral infra provisioned in under 90 seconds.\n\n## Problem\nQA was blocked waiting on a single shared staging environment.\n\n## Approach\nA CLI and GitHub Action that provisions isolated environments per PR.\n\n## Architecture\n- Terraform modules with workspace isolation\n- Container image caching layer\n- Automatic teardown on merge\n\n## Results\n- **Provision time:** 87s\n- **Staging conflicts:** 0',
ARRAY['Go','Terraform','Docker','GitHub Actions'],NULL,'https://github.com/',false,4);

INSERT INTO public.experience (role, company, period, description, skills, sort_order) VALUES
('Senior Software Engineer','Northwind Labs · Remote','2023 — Present',E'Led the rewrite of the dashboard into a typed React app, cutting p75 load time from 3.8s to 1.1s.\nDesigned an event pipeline processing 40M events/day with exactly-once delivery.\nMentored 5 engineers and introduced an RFC process adopted company-wide.',ARRAY['TypeScript','React','Go','PostgreSQL','Kafka'],1),
('Software Engineer','Fjord Payments · Stockholm','2020 — 2023',E'Built the merchant onboarding flow, raising completion rate by 34%.\nOwned the ledger reconciliation service handling €2B in annual volume.\nReduced CI time by 60% via build caching and test sharding.',ARRAY['Node.js','React','AWS','Terraform'],2),
('Frontend Developer','Independent · Agencies & startups','2018 — 2020',E'Shipped 12+ production sites and apps for clients across Europe.\nBuilt a reusable component library used across 6 client projects.',ARRAY['JavaScript','Vue','Sass','Figma'],3);

INSERT INTO public.skills (category, name, sort_order)
SELECT c.category, s.name, c.base + s.ord FROM (VALUES
 ('Frontend & UI',100,ARRAY['TypeScript','React','TanStack','Tailwind CSS','Design systems','Accessibility','Web performance']),
 ('Backend & Systems',200,ARRAY['Node.js','Go','Rust','PostgreSQL','Redis','Kafka','API design']),
 ('Tooling & DevOps',300,ARRAY['Docker','Terraform','AWS','Cloudflare','GitHub Actions','Observability']),
 ('Practice',400,ARRAY['Technical writing','RFCs','Mentoring','Code review','Product thinking'])
) AS c(category, base, items), unnest(c.items) WITH ORDINALITY AS s(name, ord);