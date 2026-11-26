import { z } from "zod";

export const FrameworkSchema = z.enum(["next", "nuxt", "sveltekit", "astro"]);
export type Framework = z.infer<typeof FrameworkSchema>;

/**
 * How block UI binds to the host design system.
 * - shadcn: theme tokens (Next shadcn/ui or Nuxt shadcn-vue — same kit id)
 * - minimal: semantic HTML + `.dkit-prose` only
 */
export const UiKitSchema = z.enum(["shadcn", "minimal"]);
export type UiKit = z.infer<typeof UiKitSchema>;

export const LayerSchema = z.enum([
  "schema",
  "access",
  "services",
  "types",
  "ui",
]);
export type Layer = z.infer<typeof LayerSchema>;

const DirectusRangeSchema = z.object({
  min: z.string().default("11.0.0"),
});

/** Named UI slots (list, detail, …) with a default block + alternate templates */
export const TemplateSlotSchema = z.object({
  default: z.string(),
  options: z.array(z.string()).default([]),
});

export type TemplateSlot = z.infer<typeof TemplateSlotSchema>;

export const ModuleManifestSchema = z.object({
  $schema: z.string().optional(),
  type: z.literal("dkit:module"),
  id: z.string().min(1),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  directus: DirectusRangeSchema.default({ min: "11.0.0" }),
  dependencies: z.array(z.string()).default([]),
  registryDependencies: z.array(z.string()).default([]),
  layers: z.array(LayerSchema).default(["schema", "access", "types"]),
  /** Fallback when templates is absent */
  defaultBlocks: z.array(z.string()).default([]),
  /**
   * Prefer this for multi-template modules:
   * { "list": { "default": "blog-list", "options": ["blog-list", "blog-list-cards"] }, ... }
   */
  templates: z.record(TemplateSlotSchema).optional(),
  collections: z.array(z.string()).default([]),
  /** Default frontend route base (user can override when routes collide) */
  defaultBasePath: z.string().optional(),
});

export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;

export const BlockManifestSchema = z.object({
  $schema: z.string().optional(),
  type: z.literal("dkit:block"),
  id: z.string().min(1),
  title: z.string(),
  description: z.string(),
  version: z.string(),
  directus: DirectusRangeSchema.default({ min: "11.0.0" }),
  dependencies: z.array(z.string()).default([]),
  registryDependencies: z.array(z.string()).default([]),
  frameworks: z.array(FrameworkSchema).default(["next"]),
  /**
   * UI kits this component ships. Layout lives under `ui/{kit}/{framework}/`.
   * Not every block needs every kit — omit unsupported ones.
   */
  uiKits: z.array(UiKitSchema).default(["shadcn"]),
  /**
   * shadcn/ui (or shadcn-vue) component ids required when uiAdapter is shadcn.
   * CLI auto-runs `shadcn add` for any that are missing (e.g. button, input).
   */
  shadcnComponents: z.array(z.string()).default([]),
  /** Which module slot this template fills (list | detail | form | …) */
  slot: z.string().optional(),
  layers: z.array(LayerSchema).default(["ui"]),
});

export type BlockManifest = z.infer<typeof BlockManifestSchema>;

/** Pick preferred kit if the block ships it; otherwise first available. */
export function resolveUiKit(
  available: UiKit[] | undefined,
  preferred?: UiKit | null,
): UiKit {
  const kits = available?.length ? available : (["shadcn"] as UiKit[]);
  if (preferred && kits.includes(preferred)) return preferred;
  return kits[0]!;
}

export const RegistryItemSchema = z.discriminatedUnion("type", [
  ModuleManifestSchema,
  BlockManifestSchema,
]);

export type RegistryItem = z.infer<typeof RegistryItemSchema>;

export const RegistryIndexSchema = z.object({
  name: z.string(),
  homepage: z.string().url().optional(),
  version: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["dkit:module", "dkit:block"]),
      title: z.string(),
      description: z.string(),
      version: z.string(),
      path: z.string(),
      defaultBlocks: z.array(z.string()).optional(),
      templates: z
        .record(
          z.object({
            default: z.string(),
            options: z.array(z.string()).optional(),
          }),
        )
        .optional(),
      registryDependencies: z.array(z.string()).optional(),
      slot: z.string().optional(),
      uiKits: z.array(UiKitSchema).optional(),
      frameworks: z.array(FrameworkSchema).optional(),
    }),
  ),
});

export type RegistryIndex = z.infer<typeof RegistryIndexSchema>;
