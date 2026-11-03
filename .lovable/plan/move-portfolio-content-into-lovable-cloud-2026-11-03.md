# Move portfolio content into Lovable Cloud

## What changes for visitors
Nothing visible. Home, Experience, Projects and Skills look the same but read their content from the database instead of files in the project.

## Steps
1. Enable Lovable Cloud.
2. Create three tables with the columns you listed:
   - `projects` (title, slug, summary, content as markdown, tech_stack, live_url, github_url, featured, sort_order, created_at)
   - `experience` (role, company, period, description, skills, sort_order)
   - `skills` (category, name, sort_order) — one row per skill
3. Security:
   - Row Level Security on all three tables.
   - Anyone can read.
   - Writing (add/edit/delete) is limited to signed-in **admins**, not every signed-in user. Otherwise anyone who creates an account could rewrite the portfolio. Admin status lives in a separate roles table; you'd be made admin once you have an account.
4. Copy all current mock content into the tables in the same setup step, so the site is populated immediately.
5. Point the existing data getters at the database; pages keep working unchanged.

## How current content maps to the new shape
- Project case study (problem, approach, architecture, metrics) and highlight become one markdown `content` field, shown in the case-study drawer as formatted text. The "highlight" line on cards will show the first line of the summary area instead — or I can add a `highlight` column if you'd rather keep it.
- Experience: start/end become one `period` text (e.g. "2023 — Present"); impact bullets become `description` (one bullet per line, still rendered as a list); the "context" line (e.g. "Remote") is folded into `company`... or dropped.
- Skills: group descriptions ("Interfaces that are fast...") have no column and will be dropped; groups are rebuilt from `category`.
- Profile/contact info stays in the project files (no table was requested).

## Not included
- No admin screen or sign-in page yet; content is edited in the Cloud table view. Can be added next.

## Technical details
- Migration: tables + GRANTs (SELECT to anon/authenticated, ALL to authenticated + service_role), `app_role` enum, `user_roles` table, `has_role()` security-definer function, policies: `SELECT USING (true)` for anon/authenticated; `ALL` for authenticated `USING/WITH CHECK has_role(auth.uid(),'admin')`. Seed INSERTs in the same migration.
- `src/data/index.ts` getters become public `createServerFn` reads using a server publishable client (with sb_ apikey shim) so SSR works; types updated to the new row shapes; routes adjusted for `content` (render with `react-markdown`), `period`, `description`, and skills grouped by category.
- Update `src/test/app-routing.test.tsx` mocks if it relies on old data shapes.
