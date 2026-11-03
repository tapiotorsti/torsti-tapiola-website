import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";
import { isSafeUrl } from "@/lib/utils";
import { projectsQuery, type Project } from "@/data";
import { useAdminCrud } from "@/components/admin/useAdminCrud";
import { TagInput } from "@/components/admin/TagInput";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/")({ component: AdminProjects });

type Form = Omit<Project, "id">;
const empty: Form = { title: "", slug: "", summary: "", content: "", tech_stack: [], live_url: "", github_url: "", featured: false, sort_order: 0 };
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function AdminProjects() {
  const { data = [] } = useQuery(projectsQuery);
  const { save, remove } = useAdminCrud("projects", "projects");
  const [editing, setEditing] = useState<{ id?: string; form: Form } | null>(null);
  const set = (patch: Partial<Form>) => setEditing((e) => e && { ...e, form: { ...e.form, ...patch } });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const f = editing.form;
    const badUrl = [f.live_url, f.github_url].find((u) => u && !isSafeUrl(u));
    if (badUrl) { toast.error(`URL must start with https:// — ${badUrl}`); return; }
    save.mutate(
      { id: editing.id, values: { ...f, slug: f.slug || slugify(f.title), live_url: f.live_url || null, github_url: f.github_url || null } },
      { onSuccess: () => setEditing(null) },
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Projects</h1>
        <Button onClick={() => setEditing({ form: { ...empty, sort_order: data.length + 1 } })}><Plus className="h-4 w-4" /> Add project</Button>
      </div>
      <Table className="mt-6">
        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Title</TableHead><TableHead className="hidden md:table-cell">Stack</TableHead><TableHead>Featured</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-mono text-xs">{p.sort_order}</TableCell>
              <TableCell>{p.title}</TableCell>
              <TableCell className="hidden font-mono text-xs text-muted-foreground md:table-cell">{p.tech_stack.join(", ")}</TableCell>
              <TableCell className="font-mono text-xs">{p.featured ? "Yes" : "—"}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" aria-label={`Edit ${p.title}`} onClick={() => { const { id, ...form } = p; setEditing({ id, form: { ...form, live_url: form.live_url ?? "", github_url: form.github_url ?? "" } }); }}><Pencil className="h-4 w-4" /></Button>
                <ConfirmDelete label={p.title} onConfirm={() => remove.mutate(p.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit project" : "New project"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" required value={editing.form.title} onChange={(e) => set({ title: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" placeholder={slugify(editing.form.title)} value={editing.form.slug} onChange={(e) => set({ slug: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="summary">Summary</Label><Input id="summary" value={editing.form.summary} onChange={(e) => set({ summary: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="content">Case study (markdown)</Label><Textarea id="content" rows={8} className="font-mono text-xs" value={editing.form.content} onChange={(e) => set({ content: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="stack">Tech stack</Label><TagInput id="stack" value={editing.form.tech_stack} onChange={(v) => set({ tech_stack: v })} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="live">Live URL</Label><Input id="live" type="url" value={editing.form.live_url ?? ""} onChange={(e) => set({ live_url: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="gh">GitHub URL</Label><Input id="gh" type="url" value={editing.form.github_url ?? ""} onChange={(e) => set({ github_url: e.target.value })} /></div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3"><Switch id="featured" checked={editing.form.featured} onCheckedChange={(v) => set({ featured: v })} /><Label htmlFor="featured">Featured</Label></div>
                <div className="flex items-center gap-2"><Label htmlFor="order">Order</Label><Input id="order" type="number" className="w-20" value={editing.form.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></div>
              </div>
              <DialogFooter><Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
