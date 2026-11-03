import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { skillRowsQuery } from "@/data";
import { useAdminCrud } from "@/components/admin/useAdminCrud";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/admin/skills")({ component: AdminSkills });

type Form = { category: string; name: string; sort_order: number };
const NEW = "__new__";

function AdminSkills() {
  const { data = [] } = useQuery(skillRowsQuery);
  const { save, remove } = useAdminCrud("skills", "skills");
  const [editing, setEditingRaw] = useState<{ id?: string; form: Form } | null>(null);
  const [newCat, setNewCat] = useState(false);
  const setEditing = (v: { id?: string; form: Form } | null) => { setNewCat(false); setEditingRaw(v); };
  const set = (patch: Partial<Form>) => setEditingRaw((e) => e && { ...e, form: { ...e.form, ...patch } });
  const categories = [...new Set(data.map((s) => s.category))];

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Skills</h1>
        <Button onClick={() => setEditing({ form: { category: categories[0] ?? "", name: "", sort_order: (data.at(-1)?.sort_order ?? 0) + 1 } })}><Plus className="h-4 w-4" /> Add skill</Button>
      </div>
      <Table className="mt-6">
        <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Category</TableHead><TableHead>Skill</TableHead><TableHead /></TableRow></TableHeader>
        <TableBody>
          {data.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-xs">{s.sort_order}</TableCell>
              <TableCell className="text-muted-foreground">{s.category}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" aria-label={`Edit ${s.name}`} onClick={() => setEditing({ id: s.id, form: { category: s.category, name: s.name, sort_order: s.sort_order } })}><Pencil className="h-4 w-4" /></Button>
                <ConfirmDelete label={s.name} onConfirm={() => remove.mutate(s.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit skill" : "New skill"}</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); save.mutate({ id: editing.id, values: editing.form }, { onSuccess: () => setEditing(null) }); }} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="name">Skill</Label><Input id="name" required value={editing.form.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                {!newCat && categories.length > 0 ? (
                  <Select
                    value={categories.includes(editing.form.category) ? editing.form.category : undefined}
                    onValueChange={(v) => {
                      if (v === NEW) { setNewCat(true); set({ category: "" }); }
                      else set({ category: v });
                    }}
                  >
                    <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      <SelectItem value={NEW}>+ New category…</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex gap-2">
                    <Input id="category" required autoFocus placeholder="New category name" value={editing.form.category} onChange={(e) => set({ category: e.target.value })} />
                    {categories.length > 0 && (
                      <Button type="button" variant="outline" onClick={() => { setNewCat(false); set({ category: categories[0] ?? "" }); }}>Cancel</Button>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2"><Label htmlFor="order">Order</Label><Input id="order" type="number" className="w-24" value={editing.form.sort_order} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></div>
              <DialogFooter><Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
