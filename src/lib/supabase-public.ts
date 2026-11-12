// Server-side Supabase client with the publishable key: RLS applies, so it can
// only read public data. Used by server functions; call it only on the server.
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        // New sb_publishable_ keys are not JWTs: send them only as the apikey header.
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}
