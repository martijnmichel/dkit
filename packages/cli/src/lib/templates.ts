import type { RegistryIndex } from "@dkit/shared";
import fs from "node:fs";
import path from "node:path";

export type TemplateOverrides = Record<string, string>;

export type ModuleUiOption = {
  id: string;
  slot?: string;
  title: string;
  description: string;
  isDefault: boolean;
};

/** Parse `list=blog-list-cards,detail=blog-detail` */
export function parseTemplateFlag(raw?: string): TemplateOverrides {
  if (!raw) return {};
  const out: TemplateOverrides = {};
  for (const part of raw.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      throw new Error(
        `Invalid --template entry "${trimmed}". Use slot=block-id (e.g. list=blog-list-cards).`,
      );
    }
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return out;
}

function readModuleTemplateManifest(
  moduleId: string,
  index: RegistryIndex,
  registryRoot: string,
): {
  templates?: Record<string, { default: string; options?: string[] }>;
  defaultBlocks?: string[];
} | null {
  const entry = index.items.find((i) => i.id === moduleId);
  if (!entry || entry.type !== "dkit:module") return null;

  const manifestPath = path.join(registryRoot, entry.path, "module.json");
  let templates = entry.templates;
  let defaultBlocks = entry.defaultBlocks;
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      templates?: Record<string, { default: string; options?: string[] }>;
      defaultBlocks?: string[];
    };
    if (manifest.templates) templates = manifest.templates;
    if (manifest.defaultBlocks) defaultBlocks = manifest.defaultBlocks;
  }
  return { templates, defaultBlocks };
}

/**
 * All UI components that can be installed for a module (for interactive select).
 * Defaults are the template slot defaults / defaultBlocks.
 */
export function listModuleUiOptions(
  moduleId: string,
  index: RegistryIndex,
  registryRoot: string,
): ModuleUiOption[] {
  const meta = readModuleTemplateManifest(moduleId, index, registryRoot);
  if (!meta) return [];

  const defaults = new Set<string>();
  const orderedIds: string[] = [];
  const slotById = new Map<string, string>();

  if (meta.templates && Object.keys(meta.templates).length > 0) {
    for (const [slot, def] of Object.entries(meta.templates)) {
      defaults.add(def.default);
      const options = def.options?.length ? def.options : [def.default];
      for (const id of options) {
        if (!orderedIds.includes(id)) orderedIds.push(id);
        if (!slotById.has(id)) slotById.set(id, slot);
      }
    }
  } else if (meta.defaultBlocks?.length) {
    for (const id of meta.defaultBlocks) {
      defaults.add(id);
      if (!orderedIds.includes(id)) orderedIds.push(id);
    }
  }

  // Any registry block that depends on this module (covers modules without templates)
  for (const item of index.items) {
    if (item.type !== "dkit:block") continue;
    if (!(item.registryDependencies ?? []).includes(moduleId)) continue;
    if (!orderedIds.includes(item.id)) orderedIds.push(item.id);
    if (item.slot && !slotById.has(item.id)) slotById.set(item.id, item.slot);
  }

  if (defaults.size === 0) {
    for (const id of orderedIds) defaults.add(id);
  }

  return orderedIds.map((id) => {
    const entry = index.items.find((i) => i.id === id);
    return {
      id,
      slot: slotById.get(id) ?? entry?.slot,
      title: entry?.title ?? id,
      description: entry?.description ?? "",
      isDefault: defaults.has(id),
    };
  });
}

/** Merge previously installed block ids with newly selected ones. */
export function mergeBlockIds(
  previous: string[] | undefined,
  next: string[],
): string[] {
  return [...new Set([...(previous ?? []), ...next])];
}

/**
 * Resolve component ids for a module from templates / defaults.
 * UI kit (shadcn | minimal) is chosen later when loading `ui/{kit}/{framework}/` —
 * template options are component variants (list vs cards), not kits.
 *
 * Pass `withBlocks` (including `[]`) to skip defaults entirely.
 */
export function resolveDefaultBlocksFromTemplates(
  moduleId: string,
  index: RegistryIndex,
  registryRoot: string,
  overrides: TemplateOverrides,
  withBlocks?: string[],
): string[] {
  if (withBlocks !== undefined) return withBlocks;

  const meta = readModuleTemplateManifest(moduleId, index, registryRoot);
  if (!meta) return [];

  const templates = meta.templates;
  if (!templates || Object.keys(templates).length === 0) {
    return meta.defaultBlocks ?? [];
  }

  const blocks: string[] = [];
  for (const [slot, def] of Object.entries(templates)) {
    const chosen = overrides[slot] ?? def.default;
    const options = def.options?.length ? def.options : [def.default];
    if (!options.includes(chosen) && chosen !== def.default) {
      throw new Error(
        `Unknown template "${chosen}" for slot "${slot}" on ${moduleId}. Options: ${options.join(", ")}`,
      );
    }
    blocks.push(chosen);
  }
  return blocks;
}
