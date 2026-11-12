---
name: database-change
description: Add or change a Supabase/Postgres table, column, constraint or RLS policy for this project, and wire it through types, server functions, query options and the admin UI. Use for any schema or data-access change.
---

# Database change

The database is Supabase, managed through Lovable Cloud. Schema history is the
numbered SQL files in `drizzle/migrations/`. Applied migrations are never edited.

## Who applies migrations

- **Inside Lovable:** Lovable Cloud writes and applies the migration and
  regenerates `src/integrations/supabase/types.ts` and `drizzle/migrations/meta/*`.
- **Any other agent:** write the migration SQL and the app code, but do not try
  to connect to the database or invent a connection string. In your report, say
  that the owner must apply the migration in Lovable, or in the Supabase SQL
  editor for a fork, before the code works.
- **Don't add entries to `drizzle/migrations/meta/_journal.json` yourself.** A
  migration that is listed in the journal but was not applied by Lovable's
  migrator breaks it: with `0008_chat_rate_limit` Lovable had to comment the file
  out and re-apply the same SQL as `0009`. Add only the `.sql` file and ask the
  owner to have Lovable apply it ("Apply the database migration
  drizzle/migrations/NNNN_….sql"). Lovable then registers it.

## 1. Write the migration

Create `drizzle/migrations/NNNN_<short_description>.sql`, where `NNNN` is the next
number. Template for a new public-read, admin-write table:

```sql
CREATE TABLE public.talks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text CHECK (url IS NULL OR url ~* '^https://'),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.talks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.talks TO authenticated;
GRANT ALL ON public.talks TO service_role;

ALTER TABLE public.talks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON public.talks
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage" ON public.talks
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

Rules:
- Every table gets RLS, explicit grants and the `"Admins manage"` policy.
  Add `"Public read"` only for data the public site shows.
- New columns on existing tables need a `DEFAULT` or must be nullable, so
  existing rows still work.
- URL columns get an `https://` CHECK constraint, like `projects` in
  `0005_security_hardening.sql`.
- Never grant `anon` anything beyond `SELECT`. Never weaken `has_role` grants.

## 2. Types

- `src/integrations/supabase/types.ts` is generated. Outside Lovable, leave it
  alone and say in your report that it must be regenerated. If the type check
  fails because the table is missing, note this instead of hand-editing the
  generated file.
- Add or extend the app-level interface in `src/data/types.ts`.

## 3. Server function and query

In `src/data/portfolio.functions.ts`, copy `fetchSkills`:
- Use `publicClient()` and select an explicit column list.
- `.order("sort_order")`.
- On error, `throw new Error("Could not load <thing>")`. Never pass the raw error on.

In `src/data/index.ts`, add `export const thingsQuery = queryOptions({ queryKey: ["things"], queryFn: ... })`.
If the admin table needs raw rows, use a sub-key such as `["things", "rows"]` so
that invalidating `["things"]` refreshes both.

## 4. Admin UI (if editable)

Extend the `Table` union in `src/components/admin/useAdminCrud.ts`, then build
`src/routes/admin.<things>.tsx` by following `admin.skills.tsx`.

## 5. Verify

Run the `portfolio-security-check` skill on the migration, then `verify-changes`.
