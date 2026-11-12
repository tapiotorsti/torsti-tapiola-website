// Server side of the site assistant: rate limit, load content, ask Claude.
// Nothing about the conversation is stored or logged.
import { getRequest } from "@tanstack/react-start/server";

import { publicClient } from "@/lib/supabase-public";

import { askClaude } from "./assistant.server";
import { loadSiteContent } from "./content.server";
import { buildSystemPrompt } from "./prompt";
import { clientIp, rateLimitBucket } from "./rate-limit";
import type { ChatRequest, ChatResult } from "./shared";

export async function handleChat({ messages }: ChatRequest): Promise<ChatResult> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return { ok: false, error: "unavailable" };

  try {
    // Rate limit per visitor (20 questions / hour). The API key doubles as the
    // HMAC secret, so the stored key can't be reversed to an IP address.
    const bucket = await rateLimitBucket(clientIp(getRequest().headers), apiKey);
    const { data: allowed, error } = await publicClient().rpc("chat_rate_limit_hit", {
      _bucket: bucket,
    });
    // Fail closed: if the limit can't be checked, don't spend money.
    if (error) return { ok: false, error: "unavailable" };
    if (!allowed) return { ok: false, error: "rate_limited" };

    const system = buildSystemPrompt(await loadSiteContent());
    const answer = await askClaude(apiKey, system, messages);
    if (!answer) return { ok: false, error: "unavailable" };
    return { ok: true, reply: answer.reply, suggestedPage: answer.suggestedPage };
  } catch {
    // Deliberately no details: never log or return the visitor's messages.
    return { ok: false, error: "unavailable" };
  }
}
