import { describe, expect, it } from "vitest";

import { clampDescription, jsonLd, personJsonLd, seo, SITE_URL } from "@/lib/seo";

describe("seo", () => {
  const tags = seo({
    title: "Projects — Torsti Tapiola",
    description: "Case studies.",
    path: "/projects",
    siteName: "Torsti Tapiola",
  });
  const meta = (key: string) =>
    tags.meta.find(
      (m) => ("name" in m && m.name === key) || ("property" in m && m.property === key),
    );

  it("sets canonical and og:url to the absolute page URL", () => {
    expect(tags.links).toEqual([{ rel: "canonical", href: `${SITE_URL}/projects` }]);
    expect(meta("og:url")).toEqual({ property: "og:url", content: `${SITE_URL}/projects` });
  });

  it("includes Open Graph and Twitter card tags with the share image", () => {
    for (const key of [
      "description",
      "og:title",
      "og:description",
      "og:image",
      "twitter:title",
      "twitter:image",
    ]) {
      expect(meta(key), key).toBeDefined();
    }
    expect(meta("og:image")).toEqual({ property: "og:image", content: `${SITE_URL}/og-image.png` });
  });

  it("uses a trailing slash for the home page", () => {
    expect(seo({ title: "x", description: "y", path: "/" }).links[0]?.href).toBe(`${SITE_URL}/`);
  });
});

describe("clampDescription", () => {
  it("keeps short text and collapses whitespace", () => {
    expect(clampDescription("  Hello\n  world  ")).toBe("Hello world");
  });

  it("prefers ending on a full sentence", () => {
    const first =
      "Software developer based in Jyväskylä, Finland, building web apps for public and private organizations.";
    expect(
      clampDescription(`${first} I build responsive apps with React and TypeScript every day.`),
    ).toBe(first);
  });

  it("cuts long text on a word boundary under the limit", () => {
    const out = clampDescription("word ".repeat(60), 50);
    expect(out.length).toBeLessThanOrEqual(50);
    expect(out.endsWith("word…")).toBe(true);
  });
});

describe("personJsonLd", () => {
  it("builds a Person with address and profiles", () => {
    const data = personJsonLd({
      name: "Torsti Tapiola",
      role: "Software Developer",
      location: "Jyväskylä, FI",
      sameAs: ["https://github.com/tapiotorsti"],
    });
    const person = data["@graph"][1];
    expect(person).toMatchObject({
      "@type": "Person",
      name: "Torsti Tapiola",
      jobTitle: "Software Developer",
      address: { addressLocality: "Jyväskylä", addressCountry: "FI" },
      sameAs: ["https://github.com/tapiotorsti"],
    });
  });

  it("escapes < so content cannot close the script tag", () => {
    const out = jsonLd(personJsonLd({ name: "</script><script>alert(1)</script>" }));
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out)["@graph"][1].name).toBe("</script><script>alert(1)</script>");
  });
});
