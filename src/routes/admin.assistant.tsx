import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ASSISTANT_NOTE_FIELDS, NOTE_MAX_CHARS, type AssistantNotes } from "@/lib/chat/notes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/assistant")({ component: AdminAssistant });

const empty = Object.fromEntries(ASSISTANT_NOTE_FIELDS.map((f) => [f.key, ""])) as AssistantNotes;

// Read with the admin's own session; RLS allows only the admin role.
async function fetchNotes(): Promise<AssistantNotes> {
  const { data, error } = await supabase
    .from("assistant_notes")
    .select("interests, favourites, work_style, learning, fun_facts, other")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error("Could not load assistant notes");
  return data ?? empty;
}

function AdminAssistant() {
  const qc = useQueryClient();
  const { data, isError } = useQuery({ queryKey: ["assistant_notes"], queryFn: fetchNotes });
  const [form, setForm] = useState<AssistantNotes | null>(null);
  useEffect(() => {
    if (data && !form) setForm({ ...data });
  }, [data, form]);

  const save = useMutation({
    mutationFn: async (values: AssistantNotes) => {
      const { error } = await supabase
        .from("assistant_notes")
        .upsert({ id: 1, ...values, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assistant_notes"] });
      toast.success("Assistant notes saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isError) return <p className="text-muted-foreground">Could not load assistant notes.</p>;
  if (!form) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-medium tracking-tight">AI assistant notes</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Background the AI assistant can use when visitors ask about you. These notes are not shown
        on the site, and empty sections are left out.
      </p>
      <div className="mt-4 flex gap-3 border border-border p-4 text-sm">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          Treat everything here as public: any visitor can ask the assistant about it. Don't write
          anything you wouldn't put on the site itself, such as contact details of others, health
          information or salary expectations.
        </p>
      </div>
      <form
        className="mt-6 space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(form);
        }}
      >
        {ASSISTANT_NOTE_FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <Label htmlFor={f.key}>{f.label}</Label>
              <span className="font-mono text-xs text-muted-foreground">
                {form[f.key].length}/{NOTE_MAX_CHARS}
              </span>
            </div>
            <p id={`${f.key}-hint`} className="text-xs text-muted-foreground">
              {f.hint}
            </p>
            <Textarea
              id={f.key}
              aria-describedby={`${f.key}-hint`}
              rows={4}
              maxLength={NOTE_MAX_CHARS}
              value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save notes"}
        </Button>
      </form>
    </section>
  );
}
