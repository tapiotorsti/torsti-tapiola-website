import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { experienceQuery, type Experience } from "@/data";
import { useAdminCrud } from "@/components/admin/useAdminCrud";
import { TagInput } from "@/components/admin/TagInput";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/experience")({ component: AdminExperience });

type Form = Omit<Experience, "id">;
const empty: Form = { role: "", company: "", period: "", description: "", skills: [], sort_order: 0 };

function AdminExperience() {
  const { data = [] } = useQuery(experienceQuery);
  const { save, remove } = useAdminCrud("experience", "experience");
  const [editing, setEditing] = useState<{ id?: string; form: Form } | null>(null);
  const set = (patch: Partial<Form>) => setEditing((e) => e && { ...e, form: { ...e.form, ...patch } });

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Experience</h1>
        <Button onClick={() => setEditing({ form: { ...empty, sort_order: data.length + 1 } })}><Plus className="h-4 w-4" /> Add role</Button>
      </div>
      <Table className="mt-6">
        <TableHeader><TableRow><TableHead>#</TableHead><TableHead>Role</TableHead><TableHead>Company</TableHead><TableHead className="hidden md:table-cell">Period</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {data.map((x) => (
            <TableRow key={x.id}>
              <TableCell className="font-mono text-xs">{x.sort_order}</TableCell>
              <TableCell>{x.role}</TableCell>
              <TableCell className="text-muted-foreground">{x.company}</TableCell>
              <TableCell className="hidden font-mono text-xs md:table-cell">{x.period}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" aria-label={`Edit ${x.role}`} onClick={() => { const { id, ...form } = x; setEditing({ id, form }); }}><Pencil className="h-4 w-4" /></Button>
                <ConfirmDelete label={`${x.role} at ${x.company}`} onConfirm={() => remove.mutate(x.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit role" : "New role"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); save.mutate({ id: editing.id, values: editing.form }, { onSuccess: () => setEditing(null) }); }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="role">Role</Label><Input id="role" required value={editing.form.role} onChange={(e) => set({ role: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="company">Company</Label><Input id="company" required value={editing.form.company} onChange={(e) => set({ company: e.target.value })} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2"><Label htmlFor="period">Period</Label><Input id="period" placeholder="2023 — Present" value={editing.form.period} onChange={(e) => set({ period: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="order">Order</Label><Input id="order" type="number" className="w-20" value={editing.form.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="desc">Description (one point per line)</Label><Textarea id="desc" rows={6} value={editing.form.description} onChange={(e) => set({ description: e.target.value })} /></div>
              <div className="space-y-2"><Label htmlFor="skills">Skills</Label><TagInput id="skills" value={editing.form.skills} onChange={(v) => set({ skills: v })} /></div>
              <DialogFooter><Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
