"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; label: string };

export function OnThisPage({ items }: { items: TocItem[] }) {
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

  if (!items.length) return null;

  return (
    <>
      {/* Mobile / tablet: horizontal quick nav */}
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
              <a
                href={`#${item.id}`}
                className={
                  active === item.id
                    ? "inline-flex rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-foreground no-underline hover:no-underline"
                    : "inline-flex rounded-md px-2.5 py-1 text-xs text-muted-foreground no-underline hover:bg-muted/60 hover:text-foreground hover:no-underline"
                }
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Desktop: right rail */}
      <nav
        aria-label="On this page"
        className="sticky top-8 hidden xl:block"
      >
        <p className="mb-3 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
          On this page
        </p>
        <ul className="space-y-1 border-l border-border">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={
                  active === item.id
                    ? "-ml-px block border-l-2 border-primary py-1 pl-3 text-sm font-medium text-foreground no-underline hover:no-underline"
                    : "-ml-px block border-l-2 border-transparent py-1 pl-3 text-sm text-muted-foreground no-underline hover:border-border hover:text-foreground hover:no-underline"
                }
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
