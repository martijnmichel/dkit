/** Authoring stub — `dkit add` installs the real shadcn popover. */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type PopoverCtx = { open: boolean; setOpen: (v: boolean) => void };
const PopoverContext = React.createContext<PopoverCtx | null>(null);

export function Popover({
  children,
  open: openProp,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = React.useState(false);
  const open = openProp ?? uncontrolled;
  const setOpen = (v: boolean) => {
    onOpenChange?.(v);
    if (openProp === undefined) setUncontrolled(v);
  };
  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-flex">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const ctx = React.useContext(PopoverContext);
  const toggle = () => ctx?.setOpen(!ctx.open);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<{ onClick?: () => void }>,
      { onClick: toggle },
    );
  }
  return (
    <button type="button" onClick={toggle} {...props}>
      {children}
    </button>
  );
}

export function PopoverContent({
  children,
  className,
  align: _align = "center",
  ...props
}: React.ComponentProps<"div"> & {
  align?: "start" | "center" | "end";
  side?: string;
  sideOffset?: number;
  alignOffset?: number;
}) {
  const ctx = React.useContext(PopoverContext);
  if (!ctx?.open) return null;
  return (
    <div
      role="dialog"
      className={cn(
        "absolute right-0 top-full z-50 mt-2 min-w-48 rounded-lg border bg-popover p-2 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopoverHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-0.5", className)} {...props} />;
}

export function PopoverTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("font-medium", className)} {...props} />;
}

export function PopoverDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
