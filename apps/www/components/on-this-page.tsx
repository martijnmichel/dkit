"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

function useActiveSection(items: TocItem[]) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    if (!items.length) return;

    const nodes = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0, 1] },
    );

    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [items]);

  return active;
}

/** Horizontal quick nav — phones / tablets */
export function OnThisPageMobile({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items);
  if (!items.length) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-0 z-10 -mx-6 mb-8 border-b border-border bg-background/95 px-6 py-3 backdrop-blur xl:hidden"
    >
      <p className="mb-2 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
        On this page
      </p>
      <ul className="flex gap-1 overflow-x-auto pb-1">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <Button
              asChild
              size="xs"
              variant={active === item.id ? "secondary" : "ghost"}
            >
              <a href={`#${item.id}`}>{item.label}</a>
            </Button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Right-rail TOC — desktop */
export function OnThisPageRail({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items);
  if (!items.length) return null;

  return (
    <nav aria-label="On this page" className="sticky top-8">
      <p className="mb-3 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
        On this page
      </p>
      <Separator className="mb-3" />
      <ul className="space-y-1 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l-2 py-1 pl-3 text-sm no-underline hover:no-underline",
                active === item.id
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
