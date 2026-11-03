# The Modern Developer

Build a modern, highly responsive developer portfolio and personal website. 

### Visual & Design Direction (Avoid Generic AI Slop):

- Do NOT use generic purple-indigo gradients, floating glow orbs, frosted glassmorphism abuse, or standard SaaS landing page templates.

- Aesthetic: Editorial minimalism / technical precision. Clean grids, sharp typography, high contrast, subtle borders (1px solid border colors with subtle opacity), and restrained motion.

- Palette: Deep charcoal/near-black (#0a0a0c) background, crisp off-white text (#f4f4f5), muted slate for secondary text (#71717a), with a single precise accent color (e.g., warm amber or electric cyan).

- Typography: Monospace accents for dates, tags, and metrics (e.g., JetBrains Mono), clean sans-serif for headings and body (e.g., Inter / Geist).

- Fully responsive: Mobile-first navigation with clean drawer/sheet, responsive desktop layouts (css grid).

### Public Sections:

1. Hero:

   - Name, concise role description, status tag ("Available for projects" or similar), links to GitHub, LinkedIn, and email.

2. Work Experience (Timeline / List view):

   - Role, company/context, dates, bullet points of concrete impact, and tech tags. Clean editorial list layout rather than heavy rounded cards.

3. Featured Projects (Portfolio):

   - Grid layout showing project title, short description, architectural highlights/role, tech stack pills, and external links (Live demo, Repo).

   - Modal or expandable drawer for deeper case-study view.

4. Technical Skills & Focus Areas:

   - Grouped logically (e.g., Frontend & UI, Backend & Systems, Tooling & DevOps) rather than arbitrary percentage bars.

5. Contact / Footer:

   - Simple contact section with direct email link and social profiles.

### Architecture & Tech Stack:

- Built with React, Vite, Tailwind CSS, Lucide icons, and shadcn/ui.

- Prepare modular mock data in a dedicated `/data` folder so data fetching can be swapped cleanly to Supabase later.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/84533dc4-61dd-436e-9d9a-c30c3cd5c2bf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
