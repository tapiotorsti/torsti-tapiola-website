---
name: add-page-section
description: Add a new public page or portfolio section to the TanStack Start site, with server-side data loading, SEO head tags, navigation link and the site's editorial styling. Use when asked to add a route, page or section such as "talks", "writing" or "testimonials".
---

# Add a page or section

Use `src/routes/skills.tsx` as the reference implementation: it is short and shows
every part of the pattern.

## Steps

1. **Data.** If the section shows new kinds of content, first follow the
   `database-change` skill to add the table, server fn and `queryOptions`. If
   the page is static, skip the loader's data query and keep only
   `loadSiteIdentity()`.

2. **Route file.** Create `src/routes/<name>.tsx`. Bare `$` marks a dynamic
   segment, and `routeTree.gen.ts` regenerates on its own:

   ```tsx
   import { createFileRoute } from "@tanstack/react-router";
   import { useSuspenseQuery } from "@tanstack/react-query";
   import { loadSiteIdentity, pageTitle, siteName, thingsQuery } from "@/data";
   import { Page, SectionHeader } from "@/components/site/primitives";
   import { seo } from "@/lib/seo";

   export const Route = createFileRoute("/things")({
     // loader before head, so loaderData is typed in head()
     loader: async ({ context }) => {
       await context.queryClient.ensureQueryData(thingsQuery);
       return loadSiteIdentity(context.queryClient);
     },
     // seo() adds description, canonical, Open Graph and Twitter tags.
     // Write a specific 120–160 character description that names the person.
     head: ({ loaderData }) =>
       seo({
         title: pageTitle("Things", loaderData),
         description: `Things by ${siteName(loaderData)}: one specific sentence about this page.`,
         path: "/things",
         siteName: siteName(loaderData),
       }),
     component: ThingsPage,
   });

   function ThingsPage() {
     const { data } = useSuspenseQuery(thingsQuery);
     return (
       <Page>
         <SectionHeader index="05" title="Things" intro="Short intro line." />
         {/* content */}
       </Page>
     );
   }
   ```

   Add the page to `public/sitemap.xml` with a `<url><loc>https://torsti.dev/things</loc></url>` entry.

3. **Navigation.** Add an entry to the nav array in
   `src/components/site/SiteHeader.tsx`, for example
   `{ to: "/things", label: "Things", n: "05" }`. Keep its `n` number the same
   as the `index` in the page's `SectionHeader`, and keep the numbers in order.

   If the page renders external links, filter them with `isSafeUrl()` from
   `@/lib/utils` and use `target="_blank" rel="noreferrer"`.

4. **Styling.** Follow the editorial style:
   - 1px `border-border` dividers, no heavy cards, shadows or gradients
   - `font-mono text-xs` for indices, dates and tags
   - `text-primary` only for accents
   - `reveal` class with a staggered `animationDelay` for list items

   Check the page at about 375px width and on desktop.

5. **Admin (optional).** If the content is editable, add
   `src/routes/admin.<name>.tsx` and a tab in the `tabs` array in
   `src/routes/admin.tsx`. Reuse `useAdminCrud`, `TagInput` and
   `ConfirmDelete` from `src/components/admin/`.

6. **Tests.** Add a case to `src/test/app-routing.test.tsx` checking that the
   new path matches a route (copy the `/` case).

7. **Verify.** Run the `verify-changes` skill.
