/** Authoring stub — `dkit add` installs the real shadcn navigation-menu. */
import * as React from "react";
import { cn } from "@/lib/utils";

export function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      className={cn("relative flex max-w-max flex-1 items-center", className)}
      {...props}
    >
      {children}
    </nav>
  );
}

export function NavigationMenuList({
  className,
  children,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-1 list-none items-center gap-1", className)}
      {...props}
    >
      {children}
    </ul>
  );
}

export function NavigationMenuItem({
  className,
  children,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li className={cn("group/nav-item relative", className)} {...props}>
      {children}
    </li>
  );
}

export function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium hover:bg-accent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function NavigationMenuContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 z-50 mt-1 hidden min-w-48 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-md group-hover/nav-item:block group-focus-within/nav-item:block",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NavigationMenuLink({
  className,
  children,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

export function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("absolute top-full left-0 flex", className)} {...props} />
  );
}
