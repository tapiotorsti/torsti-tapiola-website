import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { profileQuery } from "@/data";
import { profile as fallback } from "@/data/profile";

const nav = [
  { to: "/experience", label: "Experience", n: "01" },
  { to: "/projects", label: "Projects", n: "02" },
  { to: "/skills", label: "Skills", n: "03" },
  { to: "/contact", label: "Contact", n: "04" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const profile = useQuery(profileQuery).data ?? fallback;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="font-mono text-sm tracking-tight">
          {(profile.name.split(" ")[0] ?? profile.name).toLowerCase()}
          <span className="text-primary">.dev</span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          {nav.map((i) => (
            <Link
              key={i.to}
              to={i.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              <span className="mr-1.5 font-mono text-[10px] text-primary">{i.n}</span>
              {i.label}
            </Link>
          ))}
        </nav>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-full border-border bg-background sm:max-w-sm">
            <SheetTitle className="font-mono text-xs font-normal text-muted-foreground">MENU</SheetTitle>
            <nav className="mt-10 flex flex-col">
              {nav.map((i) => (
                <Link
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 border-b border-border py-5 text-2xl"
                >
                  <span className="font-mono text-xs text-primary">{i.n}</span>
                  {i.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const profile = useQuery(profileQuery).data ?? fallback;
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 font-mono text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>© {new Date().getFullYear()} {profile.name} — {profile.location}</p>
        <div className="flex gap-6">
          <a href={`mailto:${profile.email}`} className="hover:text-foreground">Email</a>
          {profile.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hover:text-foreground">
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
