# Warm light palette: beige, deep purple, gold

## What changes
- The site switches from dark to light: warm beige background, dark charcoal text.
- Buttons, links and highlights use deep purple with light text. Gold is used for secondary highlights and the focus outline.
- Cards are a slightly lighter, cleaner beige. Borders are soft beige lines. Secondary text is a muted charcoal-gray that stays easy to read.
- Corners stay slightly rounded (0.375rem). Buttons keep a crisp 1px border.

## Technical details
- This project has no `src/index.css`. Theme tokens live in `src/styles.css` `:root`. Convert each HSL value you gave to oklch to match the file's convention:
  - background `38 42% 90%`, foreground/card-fg/popover-fg/secondary-fg `274 13% 16%`
  - primary `303 36% 23%`, primary-foreground `38 42% 95%`
  - secondary `39 59% 61%`, ring `39 59% 61%`
  - card/popover `38 45% 94%`
  - muted `38 25% 85%`, muted-foreground `274 8% 40%`
  - border/input `38 20% 82%`
- Accent becomes the muted beige with charcoal text, so hover states on menus and outline buttons stay readable. Using gold or purple there would clash.
- Align the sidebar and chart tokens with the new palette. Destructive becomes a deeper red that reads on beige.
- Remove `className="dark"` from `<html>` in `__root.tsx` and set `color-scheme: light` in `styles.css`.
- Check hardcoded colors in components (e.g. amber dot, `bg-white/…`, `text-white`) and swap them to tokens. The "available" dot uses gold or primary.
- Check Home, Projects (case-study sheet), the admin pages and the mobile menu in the browser for contrast.
