---
name: portfolio-security-check
description: Security checklist for this portfolio's Supabase RLS, admin auth, secrets and link handling. Use when reviewing or making changes to migrations, auth, the admin panel, environment variables, or anything that renders user-supplied URLs or Markdown.
---

# Portfolio security check

## Threat model

- Anyone on the internet can call Supabase directly with the public
  publishable key. **RLS is the only real guard.** Client-side checks, such as
  the `/admin` `beforeLoad` gate or hidden buttons, are only for user experience.
- There is a single admin. Admin rights come only from a row in
  `public.user_roles`.

## Checklist

### Database (`drizzle/migrations/*.sql`)
- [ ] Every table has `ENABLE ROW LEVEL SECURITY`.
- [ ] Write policies (`INSERT`/`UPDATE`/`DELETE`/`ALL`) require
      `public.has_role(auth.uid(), 'admin')` in both `USING` and `WITH CHECK`.
- [ ] `anon` has no grant beyond `SELECT`, and `SELECT` only on tables the public site shows.
- [ ] Nothing reintroduces an automatic admin grant, such as a trigger on `auth.users`.
- [ ] `SECURITY DEFINER` functions set `search_path = public`, and `anon` cannot
      execute them (see `0005_security_hardening.sql`).
- [ ] `public.user_roles` stays readable only by its own user and is never writable from the client.

### Secrets and environment
- [ ] No service-role or secret key in code, in `.env`, or in any `VITE_*` variable.
      `client.server.ts` reads `SUPABASE_SERVICE_ROLE_KEY` from the server
      environment only, and only server code may import it.
- [ ] `.env` contains only `SUPABASE_*`/`VITE_SUPABASE_*` URL, project id and `sb_publishable_` key.

### Server functions (`src/data/portfolio.functions.ts`)
- [ ] They use the publishable-key `publicClient()`, so RLS still applies.
- [ ] They select explicit columns, so no private column leaks if one is added later.
- [ ] Errors are generic and do not pass on Postgres messages.

### Admin and auth
- [ ] Login error messages stay generic ("Sign-in failed"), so they do not reveal whether an account exists.
- [ ] There is no public sign-up path in the UI.
- [ ] Admin routes stay `ssr: false` with `robots: noindex`.

### Rendering
- [ ] User-supplied links are `https://` only. The admin forms validate them, and
      every render passes them through `isSafeUrl()` from `@/lib/utils`, plus
      the DB CHECK constraint on `projects`.
- [ ] External links use `target="_blank" rel="noreferrer"`, as in the existing
      code (`noreferrer` also implies `noopener`).
- [ ] Markdown is rendered with `react-markdown` without raw HTML. No `dangerouslySetInnerHTML`.

### Headers and dependencies
- [ ] `src/lib/security-headers.ts` still sets the CSP and frame protection. A new
      external origin is added to the narrowest directive (`font-src`, `connect-src`, …),
      never as a wildcard in `default-src` or `script-src`.
- [ ] `bun audit` shows no new high or critical advisories in runtime dependencies.
      Advisories in dev-only tools (eslint, drizzle-kit, the Vite dev server) are lower priority.

## Report

List each item that fails, with file and line and a concrete fix. If something
can only be checked in the Supabase or Lovable dashboard (for example "sign-ups
disabled" or "leaked password protection on"), say so instead of assuming.
