import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { withSecurityHeaders } from "@/lib/security-headers";

const html = () =>
  new Response("<html></html>", { headers: { "content-type": "text/html; charset=utf-8" } });

describe("withSecurityHeaders", () => {
  beforeEach(() => {
    vi.stubEnv("DEV", false);
    vi.stubEnv("VITE_SUPABASE_URL", "https://example.supabase.co");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("adds CSP and frame protection to production HTML", () => {
    const res = withSecurityHeaders(new Request("https://torsti.dev/"), html());
    const csp = res.headers.get("Content-Security-Policy") ?? "";

    expect(res.headers.get("X-Frame-Options")).toBe("DENY");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain(
      "connect-src 'self' https://example.supabase.co wss://example.supabase.co",
    );
    expect(csp).toContain("https://fonts.googleapis.com");
  });

  it("keeps status and body", async () => {
    const res = withSecurityHeaders(
      new Request("https://torsti.dev/missing"),
      new Response("nope", { status: 404, headers: { "content-type": "text/html" } }),
    );
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("nope");
  });

  it("does not add CSP to non-HTML responses", () => {
    const res = withSecurityHeaders(
      new Request("https://torsti.dev/_serverFn/x"),
      new Response("{}", { headers: { "content-type": "application/json" } }),
    );
    expect(res.headers.get("Content-Security-Policy")).toBeNull();
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it.each([
    "https://abc.lovableproject.com/",
    "https://torsti.lovable.app/",
    "http://localhost:3000/",
  ])("leaves the Lovable preview and local hosts untouched: %s", (url) => {
    const res = withSecurityHeaders(new Request(url), html());
    expect(res.headers.get("Content-Security-Policy")).toBeNull();
    expect(res.headers.get("X-Frame-Options")).toBeNull();
  });

  it("does nothing in development", () => {
    vi.stubEnv("DEV", true);
    const res = withSecurityHeaders(new Request("https://torsti.dev/"), html());
    expect(res.headers.get("Content-Security-Policy")).toBeNull();
  });
});
