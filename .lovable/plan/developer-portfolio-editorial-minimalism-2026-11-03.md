# Developer Portfolio — Editorial Minimalism

## Design
- Palette: background #0a0a0c, text #f4f4f5, secondary #71717a, single accent warm amber; 1px borders at low opacity. Dark-only.
- Type: Geist (headings/body), JetBrains Mono (dates, tags, metrics, section indices like `01 /`).
- Sharp grids, minimal radius, restrained fade/translate motion. No gradients, orbs, or glass.

## Pages (separate routes, shared header/footer)
- `/` Hero: name, role, "Available for projects" status tag with amber dot, GitHub/LinkedIn/email links, plus short previews linking to sections.
- `/experience` Editorial timeline list: dates (mono) left column, role/company, impact bullets, tech tags.
- `/projects` Grid of projects: title, description, role/architecture highlight, stack pills, Live/Repo links; clicking opens a sheet with the full case study (problem, approach, architecture, outcomes/metrics).
- `/skills` Grouped focus areas: Frontend & UI, Backend & Systems, Tooling & DevOps, etc.
- `/contact` Large email link, social profiles.
- Header: desktop inline nav; mobile shadcn Sheet drawer. Footer with socials and mono meta line.

## Data
- `src/data/` modules: profile, experience, projects, skills — typed, with async getter functions (`getProjects()` etc.) consumed via TanStack Query so they can later be swapped to Lovable Cloud.
- Placeholder content (name, links, history) — you'll replace with real details.

## Technical
- Tokens in `src/styles.css` (oklch), fonts via `<link>` in root head, Lucide icons, shadcn Sheet/Badge.
- Per-route head() metadata.
