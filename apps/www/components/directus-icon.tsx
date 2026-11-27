import { cn } from "@/lib/utils";

/**
 * Renders a Google Material Symbol by ligature name — same set Directus uses.
 *
 * Material glyphs draw past their em-box. We render at a standard optical size
 * then `scale()` into a fixed square so nothing clips and layout width stays
 * constant (aligned with Lucide in the sidebar).
 */
export function DirectusIcon({
  name,
  className,
  title,
  size = "md",
}: {
  name?: string | null;
  className?: string;
  title?: string;
  /** Outer layout slot. Glyph is scaled to fit — never clipped. */
  size?: "nav" | "sm" | "md" | "lg" | "xl";
}) {
  if (!name) return null;

  // [slot px, glyph font-size before scale, weight]
  const spec =
    size === "nav"
      ? { slot: 16, glyph: 22, wght: 300 }
      : size === "sm"
        ? { slot: 16, glyph: 22, wght: 400 }
        : size === "lg"
          ? { slot: 28, glyph: 32, wght: 400 }
          : size === "xl"
            ? { slot: 32, glyph: 36, wght: 400 }
            : { slot: 20, glyph: 26, wght: 400 };

  const scale = spec.slot / spec.glyph;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className,
      )}
      style={{ width: spec.slot, height: spec.slot }}
      aria-hidden={title ? undefined : true}
      title={title}
    >
      <span
        className="material-symbols-outlined block leading-none"
        style={{
          fontSize: spec.glyph,
          width: spec.glyph,
          height: spec.glyph,
          lineHeight: 1,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          fontVariationSettings: `'FILL' 0, 'wght' ${spec.wght}, 'GRAD' 0, 'opsz' 24`,
        }}
      >
        {name}
      </span>
    </span>
  );
}
