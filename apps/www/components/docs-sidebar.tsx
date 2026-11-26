"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { docsNavSections, type DocsNavSection } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

function isActive(pathname: string, href: string) {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const target = href.endsWith("/") ? href : `${href}/`;
  if (target === "/docs/modules/") {
    return path === "/docs/modules/";
  }
  return path === target || path.startsWith(target);
}

export function DocsSidebar({
  modules,
}: {
  modules: Array<{ id: string; title: string }>;
}) {
  const pathname = usePathname() ?? "";
  const sections: DocsNavSection[] = docsNavSections(modules);

  return (
    <aside className="flex h-full flex-col">
      <div className="px-4 py-4">
        <Button
          asChild
          variant="ghost"
          className="h-auto justify-start px-0 py-0 hover:bg-transparent"
        >
          <a href="/docs/">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Docs
            </span>
          </a>
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          Guides and module reference
        </p>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <nav className="space-y-6 px-2 py-4" aria-label="Documentation">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="mb-2 px-3 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Button
                        asChild
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                          "h-auto w-full justify-start whitespace-normal px-3 py-2",
                          !active && "text-muted-foreground",
                        )}
                      >
                        <a href={item.href}>
                          <span className="text-sm font-medium">{item.title}</span>
                        </a>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
