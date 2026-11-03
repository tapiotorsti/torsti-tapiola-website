# Dark technical palette

## What changes
- Background goes deeper (near-black #0a0a0c). Cards and pop-ups get a slightly lighter shade (#0e0e11). Text is crisp off-white, and secondary text is a muted slate.
- Borders become a solid, subtle gray tone instead of a see-through white.
- The accent stays amber (for buttons, links, highlights and the focus outline). Text on amber buttons stays near-black.
- Corners become slightly softer: 0.375rem instead of 0.25rem.
- The site is already dark by default, because the page is marked dark. That stays as it is.

## Technical details
- Theme tokens live in `src/styles.css`; this project has no `src/index.css`. Edit the `:root` block there. The project stores colors as oklch, so each HSL value you gave is converted to oklch:
  - background `hsl(240 10% 3.9%)`
  - card/popover `hsl(240 10% 5.5%)`
  - foreground and card/popover foreground `hsl(240 5% 96%)`
  - muted, border and input `hsl(240 4% 16%)`
  - muted-foreground `hsl(240 5% 65%)`
  - primary-foreground matches background
- Primary, ring and accent stay amber `oklch(0.8 0.15 75)`.
- Align the matching secondary and sidebar tokens with the new values so menus and drawers don't keep the old tones.
- `--radius: 0.375rem`.
- `<html className="dark">` and `color-scheme: dark` are already set in `__root.tsx`/`styles.css`; no change needed.
