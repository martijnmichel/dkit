"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
      <div className="px-4 py-4">
        <Button
          asChild
          variant="ghost"
          className="h-auto justify-start px-0 py-0 hover:bg-transparent"
        >
          <a href="/modules/">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Modules
            </span>
          </a>
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          Schema, access, and UI for your app
        </p>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <nav className="px-2 py-3" aria-label="Modules">
          <ul className="space-y-0.5">
            {modules.map((m) => {
              const active = activeId === m.id;
              return (
                <li key={m.id}>
                  <Button
                    asChild
                    variant={active ? "secondary" : "ghost"}
                    className={cn(
                      "h-auto w-full flex-col items-start gap-0.5 whitespace-normal px-3 py-2",
                      !active && "text-muted-foreground",
                    )}
                  >
                    <a href={`/modules/${m.id}/`}>
                      <span className="text-sm font-medium">{m.title}</span>
                      <span className="font-mono text-[0.6875rem] opacity-70">
                        {m.id}
                      </span>
                    </a>
                  </Button>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>
    </aside>
  );
}
