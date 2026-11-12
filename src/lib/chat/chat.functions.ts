// Server function the chat widget calls. Input is validated before the handler
// runs, and TanStack Start's CSRF middleware (src/start.ts) protects the endpoint.
import { createServerFn } from "@tanstack/react-start";

import { chatRequestSchema, type ChatResult } from "./shared";

/** Whether the assistant is configured. The widget stays hidden until the API key is set. */
export const getAssistantStatus = createServerFn({ method: "GET" }).handler(async () => ({
  enabled: Boolean(process.env["ANTHROPIC_API_KEY"]),
}));

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator(chatRequestSchema)
  .handler(async ({ data }): Promise<ChatResult> => {
    // Server-only modules are loaded here so they never reach the browser bundle.
    const { handleChat } = await import("./handler.server");
    return handleChat(data);
  });
