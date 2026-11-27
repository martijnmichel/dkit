import { z } from "zod";

export const ModuleInstallConfigSchema = z.object({
  /** App route base, e.g. "/blog" or "/news" */
  basePath: z.string().optional(),
  /** Blocks installed for this module */
  blocks: z.array(z.string()).optional(),
  /**
   * Which installed block drives each slot’s page alias (List / Detail / Form).
   * e.g. `{ "list": "blog-list-cards", "detail": "blog-detail" }`
   */
  slots: z.record(z.string()).optional(),
});

/**
 * Preferred UI kit when installing blocks (`dkit.json`).
 * Same values as block `uiKits`: shadcn (tokens / shadcn-vue on Nuxt) | minimal.
 * If a block does not ship the preferred kit, CLI falls back to that block's first kit.
 */
export const UiAdapterSchema = z.enum(["shadcn", "minimal"]);
export type UiAdapter = z.infer<typeof UiAdapterSchema>;

export const DkitProjectConfigSchema = z.object({
  $schema: z.string().optional(),
  framework: z.enum(["next", "nuxt"]).default("next"),
  /** How block UI maps to the host design system */
  uiAdapter: UiAdapterSchema.default("shadcn"),
  aliases: z
    .object({
      components: z.string().default("@/components/dkit"),
      lib: z.string().default("@/lib/dkit"),
    })
    .default({}),
  registry: z.string().url().optional(),
  tailwind: z.boolean().default(true),
  /**
   * Prepended to every collection name on install.
   * Registry sources use logical names (`posts`); applied as `dkit_posts`.
   * Override in dkit.json or pass `--prefix` / interactive prompt.
   */
  collectionPrefix: z.string().default("dkit_"),
  /** Logical → physical collection names (merged across installs) */
  collections: z.record(z.string()).default({}),
  /** Per-module install choices (basePath, etc.) */
  modules: z.record(ModuleInstallConfigSchema).default({}),
});

export type DkitProjectConfig = z.infer<typeof DkitProjectConfigSchema>;
export type ModuleInstallConfig = z.infer<typeof ModuleInstallConfigSchema>;

export const DEFAULT_PROJECT_CONFIG: DkitProjectConfig = {
  framework: "next",
  uiAdapter: "shadcn",
  aliases: {
    components: "@/components/dkit",
    lib: "@/lib/dkit",
  },
  tailwind: true,
  collectionPrefix: "dkit_",
  collections: {},
  modules: {},
};

/** Normalize prefix: empty string allowed; ensure trailing underscore when non-empty and alphanumeric end */
export function normalizeCollectionPrefix(raw: string | undefined): string {
  if (raw === undefined || raw === null) return "dkit_";
  const trimmed = raw.trim();
  if (trimmed === "" || trimmed === "-") return "";
  if (/^[a-zA-Z][a-zA-Z0-9_]*_$/.test(trimmed)) return trimmed;
  if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(trimmed)) return `${trimmed}_`;
  return trimmed;
}

export function prefixedCollection(
  logicalName: string,
  prefix: string,
): string {
  const p = normalizeCollectionPrefix(prefix);
  if (!p) return logicalName;
  // Never prefix Directus system collections (e.g. directus_files)
  if (logicalName.startsWith("directus_")) return logicalName;
  if (logicalName.startsWith(p)) return logicalName;
  return `${p}${logicalName}`;
}
