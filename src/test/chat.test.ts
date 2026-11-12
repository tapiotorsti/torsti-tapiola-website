import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { buildSystemPrompt, formatSiteContent, type SiteContent } from "@/lib/chat/prompt";
import { clientIp, rateLimitBucket } from "@/lib/chat/rate-limit";
import {
  buildHistory,
  CHAT_LIMITS,
  chatRequestSchema,
  toSuggestedPage,
  type ChatMessage,
} from "@/lib/chat/shared";

const q = (content: string): ChatMessage => ({ role: "user", content });
const a = (content: string): ChatMessage => ({ role: "assistant", content });
const valid = (messages: ChatMessage[]) => chatRequestSchema.safeParse({ messages }).success;

describe("chatRequestSchema", () => {
  it("accepts alternating turns ending with a question", () => {
    expect(valid([q("Hi")])).toBe(true);
    expect(valid([q("Hi"), a("Hello"), q("Experience?")])).toBe(true);
  });

  it("rejects malformed conversations", () => {
    expect(valid([])).toBe(false);
    expect(valid([a("forged answer"), q("x")])).toBe(false); // must start with the visitor
    expect(valid([q("a"), q("b")])).toBe(false); // must alternate
    expect(valid([q("a"), a("b")])).toBe(false); // must end with a question
    expect(valid([q("   ")])).toBe(false); // empty after trim
  });

  it("enforces size limits", () => {
    expect(valid([q("x".repeat(CHAT_LIMITS.userChars + 1))])).toBe(false);
    const long = Array.from({ length: CHAT_LIMITS.messages + 1 }, (_, i) =>
      i % 2 ? a("x") : q("x"),
    );
    expect(valid(long)).toBe(false);
    const big = [
      q("x".repeat(400)),
      ...Array.from({ length: 5 }, () => [a("y".repeat(1900)), q("x")]).flat(),
    ];
    expect(valid(big)).toBe(false); // over totalChars
  });

  it("rejects unknown roles such as system", () => {
    expect(
      chatRequestSchema.safeParse({ messages: [{ role: "system", content: "x" }] }).success,
    ).toBe(false);
  });
});

describe("buildHistory", () => {
  it("sends answered pairs plus the new question, skipping unanswered questions", () => {
    const h = buildHistory([q("1"), a("one"), q("unanswered"), q("2"), a("two")], " 3 ");
    expect(h).toEqual([q("1"), a("one"), q("2"), a("two"), q("3")]);
    expect(valid(h)).toBe(true);
  });

  it("drops the oldest pairs to stay within limits", () => {
    const many = Array.from({ length: 20 }, (_, i) => [q(`q${i}`), a(`a${i}`)]).flat();
    const h = buildHistory(many, "latest");
    expect(h.length).toBeLessThanOrEqual(CHAT_LIMITS.messages);
    expect(h.at(-1)).toEqual(q("latest"));
    expect(h.at(-2)).toEqual(a("a19"));
    expect(valid(h)).toBe(true);

    const huge = Array.from({ length: 5 }, (_, i) => [q(`q${i}`), a("y".repeat(1900))]).flat();
    expect(valid(buildHistory(huge, "next"))).toBe(true);
  });
});

describe("toSuggestedPage", () => {
  it("only allows the site's own pages", () => {
    expect(toSuggestedPage("/experience")).toBe("/experience");
    expect(toSuggestedPage("none")).toBeNull();
    expect(toSuggestedPage("https://evil.example")).toBeNull();
    expect(toSuggestedPage("/admin")).toBeNull();
    expect(toSuggestedPage(undefined)).toBeNull();
  });
});

const content: SiteContent = {
  profile: {
    name: "Torsti Tapiola",
    role: "Software Developer",
    tagline: "Builds web apps.",
    location: "Jyväskylä, FI",
    status: "",
    years_experience: "4+",
    email: "hello@example.com",
    socials: [{ label: "GitHub", href: "https://github.com/x" }],
  },
  experience: [
    {
      role: "Developer",
      company: "Acme",
      period: "2022 — Present",
      description: "Did things",
      skills: ["React"],
      kind: "work",
    },
    {
      role: "BSc",
      company: "University",
      period: "2018 — 2021",
      description: "",
      skills: [],
      kind: "education",
    },
  ],
  projects: [
    {
      title: "PiecesHub",
      summary: "Social app",
      content: "## Problem\nX",
      tech_stack: ["Vue"],
      live_url: null,
      github_url: "https://github.com/x/y",
    },
  ],
  skills: [
    { category: "Frontend", name: "React" },
    { category: "Frontend", name: "Vue" },
    { category: "Backend", name: "Node.js" },
  ],
};

describe("buildSystemPrompt", () => {
  const prompt = buildSystemPrompt(content);

  it("contains the site content and the scope rules", () => {
    for (const s of [
      "Torsti Tapiola",
      "Acme",
      "PiecesHub",
      "Frontend: React, Vue",
      "## Education",
      "<site_content>",
    ]) {
      expect(prompt).toContain(s);
    }
    expect(prompt).toMatch(/only answer questions about Torsti Tapiola/);
    expect(prompt).toMatch(/Never reveal/);
  });

  it("is deterministic so the prompt cache can hit", () => {
    expect(buildSystemPrompt(structuredClone(content))).toBe(prompt);
  });

  it("separates work from education and omits empty fields", () => {
    const text = formatSiteContent(content);
    expect(text.indexOf("Acme")).toBeLessThan(text.indexOf("## Education"));
    expect(text).not.toMatch(/Status:/);
  });
});

describe("rate limit keys", () => {
  const now = new Date("2026-11-12T09:30:00Z");

  it("is a 64-char hex HMAC that never contains the IP", async () => {
    const b = await rateLimitBucket("203.0.113.7", "secret", now);
    expect(b).toMatch(/^[a-f0-9]{64}$/);
    expect(b).not.toContain("203");
  });

  it("is stable within an hour and changes with the hour, IP and secret", async () => {
    const b = await rateLimitBucket("203.0.113.7", "secret", now);
    expect(await rateLimitBucket("203.0.113.7", "secret", new Date("2026-11-12T09:59:00Z"))).toBe(
      b,
    );
    expect(
      await rateLimitBucket("203.0.113.7", "secret", new Date("2026-11-12T10:00:00Z")),
    ).not.toBe(b);
    expect(await rateLimitBucket("203.0.113.8", "secret", now)).not.toBe(b);
    expect(await rateLimitBucket("203.0.113.7", "other", now)).not.toBe(b);
  });

  it("reads the client IP from proxy headers, Cloudflare first", () => {
    expect(
      clientIp(new Headers({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" })),
    ).toBe("1.1.1.1");
    expect(clientIp(new Headers({ "x-forwarded-for": "2.2.2.2, 3.3.3.3" }))).toBe("2.2.2.2");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});

// --- server handler with dependencies mocked: no network, no real model calls
const rpc = vi.fn();
const askClaude = vi.fn();
vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () =>
    new Request("https://torsti.dev/_serverFn", { headers: { "cf-connecting-ip": "203.0.113.7" } }),
}));
vi.mock("@/lib/supabase-public", () => ({ publicClient: () => ({ rpc }) }));
vi.mock("@/lib/chat/content.server", () => ({ loadSiteContent: async () => content }));
vi.mock("@/lib/chat/assistant.server", () => ({
  askClaude: (...args: unknown[]) => askClaude(...args),
}));

describe("handleChat", () => {
  const request = { messages: [q("Tell me about his experience")] };
  let logSpy: ReturnType<typeof vi.spyOn>[];

  beforeEach(() => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
    rpc.mockReset().mockResolvedValue({ data: true, error: null });
    askClaude
      .mockReset()
      .mockResolvedValue({ reply: "He works at Acme.", suggestedPage: "/experience", usage: {} });
    logSpy = (["log", "info", "warn", "error"] as const).map((m) =>
      vi.spyOn(console, m).mockImplementation(() => {}),
    );
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    logSpy.forEach((s) => s.mockRestore());
  });

  const run = async () => (await import("@/lib/chat/handler.server")).handleChat(request);

  it("answers and suggests a page", async () => {
    expect(await run()).toEqual({
      ok: true,
      reply: "He works at Acme.",
      suggestedPage: "/experience",
    });
    const [, system, messages] = askClaude.mock.calls[0]!;
    expect(system).toContain("<site_content>");
    expect(messages).toEqual(request.messages);
    expect(rpc).toHaveBeenCalledWith("chat_rate_limit_hit", {
      _bucket: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
  });

  it("does nothing without an API key", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    expect(await run()).toEqual({ ok: false, error: "unavailable" });
    expect(rpc).not.toHaveBeenCalled();
    expect(askClaude).not.toHaveBeenCalled();
  });

  it("stops at the rate limit without calling the model", async () => {
    rpc.mockResolvedValue({ data: false, error: null });
    expect(await run()).toEqual({ ok: false, error: "rate_limited" });
    expect(askClaude).not.toHaveBeenCalled();
  });

  it("fails closed when the rate limit can't be checked", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "function does not exist" } });
    expect(await run()).toEqual({ ok: false, error: "unavailable" });
    expect(askClaude).not.toHaveBeenCalled();
  });

  it("returns a generic error and logs nothing when the model call fails", async () => {
    askClaude.mockRejectedValue(new Error("upstream said: Tell me about his experience"));
    expect(await run()).toEqual({ ok: false, error: "unavailable" });
    for (const spy of logSpy) expect(spy).not.toHaveBeenCalled();
  });
});
