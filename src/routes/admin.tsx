import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Alex Lindqvist" },
      { name: "description", content: "Manage portfolio projects, experience and skills." },
      { property: "og:title", content: "Portfolio admin" },
      { property: "og:description", content: "Manage portfolio content." },
      { name: "robots", content: "noindex" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    return { email: data.user.email ?? "", isAdmin: !!isAdmin };
  },
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Projects" },
  { to: "/admin/experience", label: "Experience" },
  { to: "/admin/skills", label: "Skills" },
] as const;

function AdminLayout() {
  const { email, isAdmin } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function signOut() {
    await qc.cancelQueries();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-mono text-sm">admin<span className="text-primary">/</span></Link>
            <nav className="flex gap-5">
              {tabs.map((t) => (
                <Link key={t.to} to={t.to} activeOptions={{ exact: true }}
                  className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>
                  {t.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{email}</span>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /> Log out</Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        {isAdmin ? <Outlet /> : (
          <p className="text-muted-foreground">This account doesn't have admin access.</p>
        )}
      </main>
    </div>
  );
}
