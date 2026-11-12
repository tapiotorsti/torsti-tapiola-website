// Site assistant: answers questions about the site owner using only site content,
// and can point to one of the site's pages. The conversation lives only in this
// component's memory; it is never stored on the site.
//
// <AssistantProvider> wraps the public layout and renders the panel; any component
// can open it with useAssistant() (header button, home page prompt).
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { profileQuery } from "@/data";
import { profile as fallback } from "@/data/profile";
import { askAssistant, assistantStatusQuery } from "@/lib/chat/chat.functions";
import { AssistantContext as Ctx, useAssistant } from "./assistant-context";
import {
  ASSISTANT_PAGES,
  buildHistory,
  CHAT_LIMITS,
  type AssistantPagePath,
  type ChatMessage,
} from "@/lib/chat/shared";

interface Entry extends ChatMessage {
  id: number;
  suggestedPage?: AssistantPagePath | null;
  /** Shown to the visitor but not sent as history (unanswered question or notice). */
  local?: boolean;
}

const SUGGESTIONS = [
  "Tell me about his work experience",
  "What projects has he built?",
  "Kerro hänen osaamisestaan",
];

const ERRORS = {
  rate_limited: "You've asked a lot of questions in a short time. Please try again in a while.",
  unavailable: "The assistant isn't available right now. Please try again later.",
} as const;

let nextId = 1;

export function AssistantProvider({ children }: { children: ReactNode }) {
  const name = (useQuery(profileQuery).data ?? fallback).name.split(" ")[0] ?? "me";
  const enabled = useQuery(assistantStatusQuery).data?.enabled ?? false;
  const [open, setOpen] = useState(false);
  const value = useMemo(
    () => ({ enabled, name, openAssistant: () => setOpen(true) }),
    [enabled, name],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {enabled && <AssistantPanel name={name} open={open} onOpenChange={setOpen} />}
    </Ctx.Provider>
  );
}

function AssistantPanel({
  name,
  open,
  onOpenChange: setOpen,
}: {
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [entries, pending]);

  async function ask(question: string) {
    const text = question.trim().slice(0, CHAT_LIMITS.userChars);
    if (!text || pending) return;

    const history = buildHistory(
      entries.filter((e) => !e.local),
      text,
    );
    const asked: Entry = { id: nextId++, role: "user", content: text };
    setEntries((prev) => [...prev, asked]);
    setDraft("");
    setPending(true);

    let notice: string | null = null;
    try {
      const result = await askAssistant({ data: { messages: history } });
      if (result.ok) {
        setEntries((prev) => [
          ...prev,
          {
            id: nextId++,
            role: "assistant",
            content: result.reply,
            suggestedPage: result.suggestedPage,
          },
        ]);
      } else {
        notice = ERRORS[result.error];
      }
    } catch {
      notice = ERRORS.unavailable;
    }

    if (notice) {
      // Keep the question visible, but leave it out of the history sent next time.
      const message = notice;
      setEntries((prev) => [
        ...prev.map((e) => (e.id === asked.id ? { ...e, local: true } : e)),
        { id: nextId++, role: "assistant", content: message, local: true },
      ]);
    }
    setPending(false);
  }

  // Return focus to the question field once it is enabled again after an answer.
  useEffect(() => {
    if (!pending && open && entries.length > 0) inputRef.current?.focus();
  }, [pending, open, entries.length]);

  function submit(e: FormEvent) {
    e.preventDefault();
    void ask(draft);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-border bg-background p-0 sm:max-w-md"
      >
        <div className="border-b border-border p-6 pr-12">
          <SheetTitle className="text-xl font-medium tracking-tight">Ask about {name}</SheetTitle>
          <SheetDescription className="mt-2 text-xs text-muted-foreground">
            AI assistant that answers from this site's content only and can be wrong. Conversations
            are not saved on this site; questions are processed by Anthropic.
          </SheetDescription>
        </div>

        <div
          role="log"
          aria-live="polite"
          aria-label="Conversation"
          aria-busy={pending}
          className="flex-1 space-y-4 overflow-y-auto p-6"
        >
          {entries.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Ask about {name}'s experience, projects or skills — in English or Finnish.
              </p>
              <ul className="flex flex-col items-start gap-2">
                {SUGGESTIONS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => void ask(s)}
                      className="cursor-pointer border border-border px-3 py-1.5 text-left text-sm hover:border-primary hover:text-primary"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {entries.map((e) => (
            <div
              key={e.id}
              className={e.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  e.role === "user"
                    ? "max-w-[85%] bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "max-w-[85%] border border-border px-3 py-2 text-sm"
                }
              >
                <span className="sr-only">{e.role === "user" ? "You: " : "Assistant: "}</span>
                {/* Plain text only: model output is never rendered as HTML or Markdown. */}
                <p className="whitespace-pre-wrap">{e.content}</p>
                {e.suggestedPage && (
                  <Link
                    to={e.suggestedPage}
                    onClick={() => setOpen(false)}
                    className="mt-2 inline-block font-mono text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Go to {ASSISTANT_PAGES.find((p) => p.path === e.suggestedPage)?.label} →
                  </Link>
                )}
              </div>
            </div>
          ))}

          {pending && <p className="font-mono text-xs text-muted-foreground">Thinking…</p>}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="flex gap-2 border-t border-border p-4">
          <label htmlFor="assistant-question" className="sr-only">
            Your question
          </label>
          <Input
            id="assistant-question"
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={CHAT_LIMITS.userChars}
            placeholder="Ask a question…"
            autoComplete="off"
            disabled={pending}
          />
          <Button type="submit" disabled={pending || !draft.trim()}>
            Send
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

/** Header entry: text button on desktop, icon button on mobile. */
export function AssistantHeaderButton() {
  const { enabled, openAssistant } = useAssistant();
  if (!enabled) return null;
  return (
    <>
      <button
        type="button"
        onClick={openAssistant}
        className="hidden cursor-pointer items-center gap-1.5 border border-primary px-3 py-1.5 text-sm text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:inline-flex"
      >
        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
        Ask AI
      </button>
      <button
        type="button"
        onClick={openAssistant}
        aria-label="Ask AI assistant"
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center text-primary md:hidden"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
      </button>
    </>
  );
}

/** Inline prompt for the home page intro. */
export function AssistantPrompt() {
  const { enabled, name, openAssistant } = useAssistant();
  if (!enabled) return null;
  return (
    <button
      type="button"
      onClick={openAssistant}
      className="group mt-6 inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
      Questions about {name}'s work? Ask the AI assistant
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        →
      </span>
    </button>
  );
}
