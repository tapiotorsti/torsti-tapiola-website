// Calls Claude for the site assistant. Server only: needs ANTHROPIC_API_KEY.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import {
  assistantOutputSchema,
  toSuggestedPage,
  type ChatMessage,
  type AssistantPagePath,
} from "./shared";

/** Fast, low-cost model; enough for short Q&A over a small amount of content. */
export const ASSISTANT_MODEL = "claude-haiku-5-5";

export interface AssistantAnswer {
  reply: string;
  suggestedPage: AssistantPagePath | null;
  usage: Anthropic.Usage;
}

/**
 * One request, one structured answer. Returns null when the model declines,
 * runs out of tokens or the output cannot be parsed; API errors are thrown.
 */
export async function askClaude(
  apiKey: string,
  system: string,
  messages: ChatMessage[],
): Promise<AssistantAnswer | null> {
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 20_000 });

  const response = await client.messages.parse({
    model: ASSISTANT_MODEL,
    // Room for adaptive thinking plus a short answer.
    max_tokens: 2048,
    output_config: {
      // Simple Q&A over given content: low effort is fast and cheap.
      effort: "low",
      format: zodOutputFormat(assistantOutputSchema),
    },
    // The system prompt (instructions + site content) is identical across
    // visitors until the content changes, so it is cached.
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") return null;
  const out = response.parsed_output;
  if (!out?.reply.trim()) return null;

  return {
    reply: out.reply.trim(),
    suggestedPage: toSuggestedPage(out.suggested_page),
    usage: response.usage,
  };
}
