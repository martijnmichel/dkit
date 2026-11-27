/** Authoring stub — `dkit add` installs the real shadcn sheet. */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type SheetCtx = { open: boolean; setOpen: (v: boolean) => void };
const SheetContext = React.createContext<SheetCtx | null>(null);

export function Sheet({
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
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const ctx = React.useContext(SheetContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => ctx?.setOpen(true),
    });
  }
  return (
    <button type="button" onClick={() => ctx?.setOpen(true)} {...props}>
      {children}
    </button>
  );
}

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<"div"> & { side?: "left" | "right" | "top" | "bottom" }) {
  const ctx = React.useContext(SheetContext);
  if (!ctx?.open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={cn(
          "absolute top-0 flex h-full w-72 flex-col gap-4 bg-background p-6 shadow-lg",
          side === "right" ? "right-0" : "left-0",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...props} />;
}

export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />;
}

export function SheetClose({
  children,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const ctx = React.useContext(SheetContext);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => ctx?.setOpen(false),
    });
  }
  return (
    <button type="button" onClick={() => ctx?.setOpen(false)} {...props}>
      {children}
    </button>
  );
}
