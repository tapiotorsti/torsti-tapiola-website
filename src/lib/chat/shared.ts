// Site assistant: types, limits and validation shared by the browser and the server.
// No secrets or server-only imports here.
import { z } from "zod";

/** The only pages the assistant may point to. It can never produce other links. */
export const ASSISTANT_PAGES = [
  { path: "/", label: "Home" },
  { path: "/experience", label: "Experience" },
  { path: "/projects", label: "Projects" },
  { path: "/skills", label: "Skills" },
  { path: "/contact", label: "Contact" },
] as const;

export type AssistantPagePath = (typeof ASSISTANT_PAGES)[number]["path"];

const PAGE_PATHS = ASSISTANT_PAGES.map((p) => p.path) as [
  AssistantPagePath,
  ...AssistantPagePath[],
];

/** Size limits that keep requests cheap and abuse bounded. Enforced on the server. */
export const CHAT_LIMITS = {
  /** Max characters in one visitor question. */
  userChars: 500,
  /** Max characters in one assistant reply sent back as history. */
  assistantChars: 2000,
  /** Max messages (questions + answers) sent per request. */
  messages: 12,
  /** Max characters across all messages in one request. */
  totalChars: 8000,
} as const;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(CHAT_LIMITS.assistantChars),
        }),
      )
      .min(1)
      .max(CHAT_LIMITS.messages),
  })
  .superRefine(({ messages }, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    messages.forEach((m, i) => {
      if (m.role !== (i % 2 === 0 ? "user" : "assistant")) {
        fail("Messages must alternate, starting with the visitor");
      }
      if (m.role === "user" && m.content.length > CHAT_LIMITS.userChars) {
        fail(`Questions are limited to ${CHAT_LIMITS.userChars} characters`);
      }
    });
    if (messages.at(-1)?.role !== "user") fail("The last message must be a question");
    const total = messages.reduce((n, m) => n + m.content.length, 0);
    if (total > CHAT_LIMITS.totalChars) fail("Conversation is too long");
  });

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export type ChatResult =
  | { ok: true; reply: string; suggestedPage: AssistantPagePath | null }
  | { ok: false; error: "rate_limited" | "unavailable" };

/** Structured output the model must return (enforced by the API's JSON schema). */
export const assistantOutputSchema = z.object({
  reply: z.string(),
  suggested_page: z.enum(["none", ...PAGE_PATHS]),
});

export function toSuggestedPage(value: string | null | undefined): AssistantPagePath | null {
  return PAGE_PATHS.find((p) => p === value) ?? null;
}

/**
 * The history to send with the next request: answered turns only, newest kept,
 * trimmed from the oldest pair until it fits the limits. `pending` is the new question.
 */
export function buildHistory(answered: ChatMessage[], pending: string): ChatMessage[] {
  // Keep only complete user→assistant pairs, in order.
  const pairs: [ChatMessage, ChatMessage][] = [];
  for (let i = 0; i + 1 < answered.length; i++) {
    const [q, a] = [answered[i]!, answered[i + 1]!];
    if (q.role === "user" && a.role === "assistant") {
      pairs.push([
        q,
        { role: "assistant", content: a.content.slice(0, CHAT_LIMITS.assistantChars) },
      ]);
      i++;
    }
  }
  const question: ChatMessage = { role: "user", content: pending.trim() };
  const size = (ps: typeof pairs) =>
    ps.reduce((n, [q, a]) => n + q.content.length + a.content.length, 0) + question.content.length;
  while (
    pairs.length &&
    (pairs.length * 2 + 1 > CHAT_LIMITS.messages || size(pairs) > CHAT_LIMITS.totalChars)
  ) {
    pairs.shift();
  }
  return [...pairs.flat(), question];
}
