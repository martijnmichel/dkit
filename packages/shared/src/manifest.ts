import { z } from "zod";

export const FrameworkSchema = z.enum(["next", "nuxt", "sveltekit", "astro"]);
export type Framework = z.infer<typeof FrameworkSchema>;

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
  /** Which module slot this template fills (list | detail | form | …) */
  slot: z.string().optional(),
  layers: z.array(LayerSchema).default(["ui"]),
});

export type BlockManifest = z.infer<typeof BlockManifestSchema>;

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
    }),
  ),
});

export type RegistryIndex = z.infer<typeof RegistryIndexSchema>;
