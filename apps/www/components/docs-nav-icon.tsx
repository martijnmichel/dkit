import { DirectusIcon } from "@/components/directus-icon";
import type { DocsNavIcon } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";
import {
  Bot,
  Library,
  Palette,
  Rocket,
  Terminal,
  type LucideIcon,
} from "lucide-react";

const LUCIDE: Record<Exclude<DocsNavIcon, "module">, LucideIcon> = {
  rocket: Rocket,
  terminal: Terminal,
  library: Library,
  palette: Palette,
  bot: Bot,
};

/** Sidebar icon column — shared 16×16 layout slot for Lucide + Material. */
export function DocsNavIconView({
  icon,
  directusIcon,
  className,
}: {
  icon?: DocsNavIcon;
  directusIcon?: string;
  className?: string;
}) {
  if (!icon) return null;

  return (
    <span
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center self-center",
        className,
      )}
    >
      {icon === "module" ? (
        <DirectusIcon
          name={directusIcon ?? "box"}
          size="nav"
          className="text-current"
        />
      ) : (
        (() => {
          const Icon = LUCIDE[icon];
          return <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />;
        })()
      )}
    </span>
  );
}
