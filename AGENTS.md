<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Projects, experience and skills live in Cloud tables, read via public server fns in `src/data/portfolio.functions.ts` and exposed as queryOptions in `src/data/index.ts`; profile stays static in `src/data/profile.ts`. Writes are admin-only (`has_role`) so signed-up visitors can't edit content.
- Each portfolio section is its own route with its own head(); shared header/footer wrap `<Outlet />` in `__root.tsx`.
- Admin lives at `/admin` (layout `admin.tsx`, client-only `beforeLoad` gate → `/admin/login` via un-nested `admin_.login.tsx`); writes go through the browser client so RLS `has_role('admin')` is the real guard. The first account created becomes admin via an `auth.users` trigger.
