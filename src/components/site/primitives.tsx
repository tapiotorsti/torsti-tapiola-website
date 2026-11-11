import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-border px-2 py-0.5 font-mono text-[11px] tracking-tight text-muted-foreground">
      {children}
    </span>
  );
}

export function SectionHeader({
  index,
  title,
  intro,
}: {
  index: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="reveal grid gap-4 border-b border-border pb-10 md:grid-cols-12">
      {/* Decorative section number: hidden from screen readers. */}
      <p aria-hidden="true" className="font-mono text-xs text-primary md:col-span-3">
        {index} /
      </p>
      <div className="md:col-span-9">
        <h1 className="text-4xl font-medium tracking-tight md:text-6xl">{title}</h1>
        {intro && <p className="mt-4 max-w-xl text-muted-foreground">{intro}</p>}
      </div>
    </header>
  );
}

/** Target of the "Skip to content" link in __root.tsx. */
export const MAIN_ID = "main";

export function Page({ children }: { children: ReactNode }) {
  return (
    <main
      id={MAIN_ID}
      tabIndex={-1}
      className="mx-auto w-full max-w-6xl px-5 py-16 outline-none md:px-8 md:py-24"
    >
      {children}
    </main>
  );
}

/** Screen-reader note for links with target="_blank". */
export function NewTabHint() {
  return <span className="sr-only"> (opens in new tab)</span>;
}
