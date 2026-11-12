import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { coursesQuery, type Course } from "@/data";
import { useAdminCrud } from "@/components/admin/useAdminCrud";
import { TagInput } from "@/components/admin/TagInput";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/admin/courses")({ component: AdminCourses });

type Form = Omit<Course, "id">;
const empty: Form = {
  title: "",
  provider: "",
  completed: "",
  credential_url: null,
  learned: "",
  skills: [],
  sort_order: 0,
};

function AdminCourses() {
  const { data = [] } = useQuery(coursesQuery);
  const { save, remove } = useAdminCrud("courses", "courses");
  const [editing, setEditing] = useState<{ id?: string; form: Form } | null>(null);
  const set = (patch: Partial<Form>) =>
    setEditing((e) => e && { ...e, form: { ...e.form, ...patch } });

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium tracking-tight">Courses &amp; certifications</h1>
        <Button onClick={() => setEditing({ form: { ...empty, sort_order: data.length + 1 } })}>
          <Plus className="h-4 w-4" /> Add course
        </Button>
      </div>
      <Table className="mt-6">
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead className="hidden md:table-cell">Completed</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((x) => (
            <TableRow key={x.id}>
              <TableCell className="font-mono text-xs">{x.sort_order}</TableCell>
              <TableCell>{x.title}</TableCell>
              <TableCell className="text-muted-foreground">{x.provider}</TableCell>
              <TableCell className="hidden font-mono text-xs md:table-cell">
                {x.completed}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${x.title}`}
                  onClick={() => {
                    const { id, ...form } = x;
                    setEditing({ id, form });
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <ConfirmDelete label={x.title} onConfirm={() => remove.mutate(x.id)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit course" : "New course"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const values = {
                  ...editing.form,
                  credential_url: editing.form.credential_url?.trim() || null,
                };
                save.mutate({ id: editing.id, values }, { onSuccess: () => setEditing(null) });
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Course / certificate</Label>
                  <Input
                    id="title"
                    required
                    value={editing.form.title}
                    onChange={(e) => set({ title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    placeholder="Coursera, AWS, University of …"
                    value={editing.form.provider}
                    onChange={(e) => set({ provider: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  <Label htmlFor="completed">Completed</Label>
                  <Input
                    id="completed"
                    placeholder="Mar 2025"
                    value={editing.form.completed}
                    onChange={(e) => set({ completed: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    className="w-20"
                    value={editing.form.sort_order}
                    onChange={(e) => set({ sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Certificate link (optional, https://)</Label>
                <Input
                  id="url"
                  type="url"
                  pattern="https://.*"
                  placeholder="https://"
                  value={editing.form.credential_url ?? ""}
                  onChange={(e) => set({ credential_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="learned">What I learned (blank line between paragraphs)</Label>
                <Textarea
                  id="learned"
                  rows={6}
                  placeholder="What the course covered and how it has been useful in practice."
                  value={editing.form.learned}
                  onChange={(e) => set({ learned: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <TagInput
                  id="skills"
                  value={editing.form.skills}
                  onChange={(v) => set({ skills: v })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={save.isPending}>
                  {save.isPending ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
