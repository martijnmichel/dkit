/** Minimal shadcn-like stubs so Sandpack can resolve @/components/ui/* imports. */

export const SANDPACK_UI_STUBS: Record<string, string> = {
  "/lib/utils.ts": `export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}
`,
  "/components/ui/button.tsx": `import * as React from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant,
  size,
  asChild,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: string;
  size?: string;
  asChild?: boolean;
}) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground",
        (children as any).props?.className,
        className,
      ),
    });
  }
  return (
    <button
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
`,
  "/components/ui/input.tsx": `import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm",
        className,
      )}
      {...props}
    />
  );
}
`,
  "/components/ui/label.tsx": `import * as React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
`,
  "/components/ui/textarea.tsx": `import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
        className,
      )}
      {...props}
    />
  );
}
`,
  "/components/ui/badge.tsx": `import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & { variant?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}
`,
  "/components/ui/card.tsx": `import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("font-semibold leading-none", className)} {...props} />;
}
export function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("text-sm text-muted-foreground", className)} {...props} />;
}
export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-6", className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}
`,
};

export function sandpackUiStubFiles(kit: string): Record<string, string> {
  if (kit !== "shadcn") return {};
  return SANDPACK_UI_STUBS;
}
