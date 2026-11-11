# Copilot instructions

Follow the project rules in [`AGENTS.md`](../AGENTS.md) at the repository root.
For multi-step tasks, read the matching guide in [`.agents/skills/`](../.agents/skills).

Key points:
- TanStack Start with file-based routes in `src/routes/`. Never edit `src/routeTree.gen.ts`.
- Public data: server fn (`src/data/portfolio.functions.ts`) → `queryOptions` (`src/data/index.ts`) → route `loader` → `useSuspenseQuery`.
- Site content lives in the database and is edited in `/admin`, not in code.
- Every table uses RLS. Writes are allowed only through `public.has_role(auth.uid(), 'admin')`. Never use a service-role key on the client.
- Do not hand-edit `src/components/ui/*`, `src/integrations/supabase/types.ts` or applied migrations.
- Before you finish: `bunx eslint <changed files>`, `bunx tsc --noEmit`, `bun run test`, `bun run build`. Full `bun run lint` has known Prettier errors in existing code.
