import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { profileQuery, type Profile } from "@/data";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/profile")({ component: AdminProfile });

const fields = [
  ["name", "Name"],
  ["role", "Role / title"],
  ["status", "Availability status"],
  ["location", "Location"],
  ["email", "Email"],
  ["years_experience", "Years of experience"],
] as const;

function AdminProfile() {
  const { data } = useQuery(profileQuery);
  const qc = useQueryClient();
  const [form, setForm] = useState<Profile | null>(null);
  useEffect(() => { if (data && !form) setForm(structuredClone(data)); }, [data, form]);

  const save = useMutation({
    mutationFn: async (values: Profile) => {
      const { error } = await supabase.from("site_profile")
        .upsert({ id: 1, ...values, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile"] }); toast.success("Profile saved"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!form) return <p className="text-muted-foreground">Loading…</p>;
  const set = (patch: Partial<Profile>) => setForm({ ...form, ...patch });
  const setSocial = (i: number, patch: Partial<Profile["socials"][number]>) =>
    set({ socials: form.socials.map((s, j) => (j === i ? { ...s, ...patch } : s)) });

  return (
    <section className="max-w-2xl">
      <h1 className="text-2xl font-medium tracking-tight">Profile</h1>
      <form className="mt-6 space-y-5" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map(([k, label]) => (
            <div key={k} className="space-y-1.5">
              <Label htmlFor={k}>{label}</Label>
              <Input id={k} type={k === "email" ? "email" : "text"} value={form[k]} onChange={(e) => set({ [k]: e.target.value })} />
            </div>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tagline">Tagline / bio</Label>
          <Textarea id="tagline" rows={3} value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Social links</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => set({ socials: [...form.socials, { label: "", href: "", handle: "" }] })}>
              <Plus className="h-4 w-4" /> Add link
            </Button>
          </div>
          {form.socials.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_2fr_1fr_auto] gap-2">
              <Input aria-label="Label" placeholder="GitHub" value={s.label} onChange={(e) => setSocial(i, { label: e.target.value })} />
              <Input aria-label="URL" placeholder="https://…" value={s.href} onChange={(e) => setSocial(i, { href: e.target.value })} />
              <Input aria-label="Handle" placeholder="@you" value={s.handle} onChange={(e) => setSocial(i, { handle: e.target.value })} />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove link" onClick={() => set({ socials: form.socials.filter((_, j) => j !== i) })}><X className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
        <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save profile"}</Button>
      </form>
    </section>
  );
}
