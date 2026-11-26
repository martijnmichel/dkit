"use client";

import { usePathname } from "next/navigation";

export type ModuleNavItem = {
  id: string;
  title: string;
};

export function ModulesSidebar({ modules }: { modules: ModuleNavItem[] }) {
  const pathname = usePathname() ?? "";
  const activeId = modules.find(
    (m) =>
      pathname === `/modules/${m.id}` ||
      pathname === `/modules/${m.id}/` ||
      pathname.startsWith(`/modules/${m.id}/`),
  )?.id;

  return (
    <aside className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-4">
        <a
          href="/modules/"
          className="text-sm font-semibold tracking-tight text-foreground no-underline hover:no-underline"
        >
          Modules
        </a>
        <p className="mt-1 text-xs text-muted-foreground">
          Schema · access · UI blocks
        </p>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Modules">
        <ul className="space-y-0.5">
          {modules.map((m) => {
            const active = activeId === m.id;
            return (
              <li key={m.id}>
                <a
                  href={`/modules/${m.id}/`}
                  className={
                    active
                      ? "flex flex-col rounded-md bg-muted px-3 py-2 no-underline hover:no-underline"
                      : "flex flex-col rounded-md px-3 py-2 text-muted-foreground no-underline transition-colors hover:bg-muted/60 hover:text-foreground hover:no-underline"
                  }
                >
                  <span
                    className={
                      active
                        ? "text-sm font-medium text-foreground"
                        : "text-sm font-medium"
                    }
                  >
                    {m.title}
                  </span>
                  <span className="font-mono text-[0.6875rem] opacity-70">
                    {m.id}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
