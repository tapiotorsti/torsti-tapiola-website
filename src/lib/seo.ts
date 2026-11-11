// Shared SEO tags for public routes: description, canonical URL, Open Graph and
// Twitter cards. Use in a route's head(): `head: ({ loaderData }) => seo({...})`.

/** Canonical origin of the production site. Forks can override with VITE_SITE_URL. */
export const SITE_URL = (import.meta.env["VITE_SITE_URL"] || "https://torsti.dev").replace(
  /\/+$/,
  "",
);

/** Social share card, 1200×630 (public/og-image.png). */
export const OG_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  width: 1200,
  height: 630,
};

export const absoluteUrl = (path: string) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);

/** Trim to a search-snippet friendly length on a word boundary. */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  // Prefer ending on a full sentence if one fills at least half the space.
  const sentenceEnd = clean.slice(0, max).search(/[.!?](?=\s)[^.!?]*$/);
  if (sentenceEnd >= max / 2) return clean.slice(0, sentenceEnd + 1);
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s-]+$/, "")}…`;
}

/** Serialize JSON-LD safely for an inline <script>: "<" is escaped so content can't close the tag. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

interface PersonInput {
  name: string;
  role?: string | undefined;
  tagline?: string | undefined;
  location?: string | undefined;
  sameAs?: string[] | undefined;
}

/** schema.org WebSite + Person graph for the home page. */
export function personJsonLd({ name, role, tagline, location, sameAs = [] }: PersonInput) {
  const loc = location?.trim();
  const m = loc?.match(/^(.+?),\s*([A-Z]{2})$/); // "Jyväskylä, FI"
  const address = loc
    ? {
        "@type": "PostalAddress",
        addressLocality: m ? m[1] : loc,
        ...(m ? { addressCountry: m[2] } : {}),
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name,
        url: `${SITE_URL}/`,
        ...(role?.trim() ? { jobTitle: role.trim() } : {}),
        ...(tagline?.trim() ? { description: clampDescription(tagline, 300) } : {}),
        ...(address ? { address } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
    ],
  };
}

interface SeoInput {
  title: string;
  description: string;
  /** Route path, e.g. "/projects". Used for canonical and og:url. */
  path: string;
  siteName?: string | undefined;
  imageAlt?: string | undefined;
}

export function seo({ title, description, path, siteName, imageAlt }: SeoInput) {
  const url = absoluteUrl(path);
  const desc = clampDescription(description);
  const alt = imageAlt ?? (siteName ? `${siteName}, developer portfolio` : title);

  return {
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:url", content: url },
      ...(siteName ? [{ property: "og:site_name", content: siteName }] : []),
      { property: "og:image", content: OG_IMAGE.url },
      { property: "og:image:width", content: String(OG_IMAGE.width) },
      { property: "og:image:height", content: String(OG_IMAGE.height) },
      { property: "og:image:alt", content: alt },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: desc },
      { name: "twitter:image", content: OG_IMAGE.url },
      { name: "twitter:image:alt", content: alt },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
