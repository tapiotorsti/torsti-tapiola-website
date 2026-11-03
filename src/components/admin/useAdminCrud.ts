import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Table = "projects" | "experience" | "skills";

// Writes go straight through the browser client; RLS only allows admins.
export function useAdminCrud(table: Table, queryKey: string) {
  const qc = useQueryClient();
  const done = (msg: string) => {
    qc.invalidateQueries({ queryKey: [queryKey] });
    toast.success(msg);
  };
  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string | undefined; values: Record<string, unknown> }) => {
      const q = id
        ? supabase.from(table).update(values as never).eq("id", id)
        : supabase.from(table).insert(values as never);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: (_d, v) => done(v.id ? "Changes saved" : "Item added"),
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => done("Item deleted"),
    onError: (e: Error) => toast.error(e.message),
  });
  return { save, remove };
}
