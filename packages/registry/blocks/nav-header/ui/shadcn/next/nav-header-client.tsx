"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { navLinkProps, type NavItem } from "@/lib/dkit/navigation";

function NavAnchor({
  item,
  className,
  onNavigate,
}: {
  item: NavItem;
  className?: string;
  onNavigate?: () => void;
}) {
  const props = navLinkProps(item);
  return (
    <a
      {...props}
      className={className}
      onClick={() => {
        onNavigate?.();
      }}
    >
      {item.label}
    </a>
  );
}

function DesktopItem({ item }: { item: NavItem }) {
  const children = item.children?.filter(Boolean) ?? [];
  if (children.length === 0) {
    return (
      <NavigationMenuItem>
        <NavigationMenuLink
          href={item.href}
          {...(item.open_in_new_tab
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="inline-flex h-9 items-center rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          {item.label}
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  }
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid min-w-48 gap-1 p-1">
          {children.map((child) => {
            const link = navLinkProps(child);
            return (
              <li key={child.id}>
                <NavigationMenuLink
                  href={link.href}
                  target={link.target}
                  rel={link.rel}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-accent"
                >
                  {child.label}
                </NavigationMenuLink>
              </li>
            );
          })}
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

function MobileTree({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate: () => void;
}) {
  return (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => {
        const children = item.children?.filter(Boolean) ?? [];
        return (
          <li key={item.id}>
            <NavAnchor
              item={item}
              onNavigate={onNavigate}
              className="block rounded-md px-2.5 py-2 text-sm font-medium hover:bg-accent"
            />
            {children.length > 0 ? (
              <ul className="ml-2 border-l border-border pl-2">
                {children.map((child) => (
                  <li key={child.id}>
                    <NavAnchor
                      item={child}
                      onNavigate={onNavigate}
                      className="block rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Menu controls only — wrap with your own header chrome + SiteBrand. */
export function NavHeaderClient({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <nav
      ref={rootRef}
      aria-label="Primary"
      className="flex w-full items-center justify-end gap-4"
    >
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {items.map((item) => (
            <DesktopItem key={item.id} item={item} />
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <XIcon className="size-4" />
        ) : (
          <MenuIcon className="size-4" />
        )}
      </Button>

      {open ? (
        <div
          id={panelId}
          className="absolute inset-x-0 top-full z-50 border-b bg-popover text-popover-foreground shadow-md md:hidden"
        >
          <div className="px-4 py-3 sm:px-6">
            <MobileTree items={items} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </nav>
  );
}
