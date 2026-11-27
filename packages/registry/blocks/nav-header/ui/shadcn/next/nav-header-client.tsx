"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navLinkProps, type NavItem } from "@/lib/dkit/navigation";

function NavAnchor({
  item,
  className,
}: {
  item: NavItem;
  className?: string;
}) {
  const props = navLinkProps(item);
  return (
    <a {...props} className={className}>
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

function MobileTree({ items }: { items: NavItem[] }) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const children = item.children?.filter(Boolean) ?? [];
        return (
          <li key={item.id}>
            <NavAnchor
              item={item}
              className="block rounded-md px-3 py-2 text-base font-medium hover:bg-accent"
            />
            {children.length > 0 ? (
              <ul className="ml-3 border-l border-border pl-3">
                {children.map((child) => (
                  <li key={child.id}>
                    <NavAnchor
                      item={child}
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
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

export function NavHeaderClient({ items }: { items: NavItem[] }) {
  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-end gap-4 px-4 sm:px-6">
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {items.map((item) => (
              <DesktopItem key={item.id} item={item} />
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" aria-label="Open menu">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <MobileTree items={items} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
