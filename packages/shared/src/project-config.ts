import { z } from "zod";

export const ModuleInstallConfigSchema = z.object({
  /** App route base, e.g. "/blog" or "/news" */
  basePath: z.string().optional(),
  /** Blocks installed for this module */
  blocks: z.array(z.string()).optional(),
});

export const DkitProjectConfigSchema = z.object({
  $schema: z.string().optional(),
  framework: z.enum(["next", "nuxt"]).default("next"),
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
  if (logicalName.startsWith(p)) return logicalName;
  return `${p}${logicalName}`;
}
