import type { RegistryIndex, UiAdapter } from "@dkit/shared";
import fs from "node:fs";
import path from "node:path";

export type TemplateOverrides = Record<string, string>;

/** Parse `list=blog-list-cards,detail=blog-detail-minimal` */
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

/** Prefer `*-minimal` options when uiAdapter is minimal and no override is set. */
function pickDefaultForAdapter(
  def: { default: string; options?: string[] },
  uiAdapter: UiAdapter | undefined,
): string {
  if (uiAdapter !== "minimal") return def.default;
  const options = def.options?.length ? def.options : [def.default];
  const minimal = options.find((id) => id.endsWith("-minimal"));
  return minimal ?? def.default;
}

export function resolveDefaultBlocksFromTemplates(
  moduleId: string,
  index: RegistryIndex,
  registryRoot: string,
  overrides: TemplateOverrides,
  withBlocks?: string[],
  uiAdapter?: UiAdapter,
): string[] {
  if (withBlocks?.length) return withBlocks;

  const entry = index.items.find((i) => i.id === moduleId);
  if (!entry || entry.type !== "dkit:module") return [];

  // Prefer templates from module.json on disk (richer than index)
  const manifestPath = path.join(registryRoot, entry.path, "module.json");
  let templates = entry.templates;
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      templates?: Record<string, { default: string; options?: string[] }>;
      defaultBlocks?: string[];
    };
    if (manifest.templates) templates = manifest.templates;
    else if (!templates && manifest.defaultBlocks) {
      return manifest.defaultBlocks;
    }
  }

  if (!templates || Object.keys(templates).length === 0) {
    return entry.defaultBlocks ?? [];
  }

  const blocks: string[] = [];
  for (const [slot, def] of Object.entries(templates)) {
    const chosen = overrides[slot] ?? pickDefaultForAdapter(def, uiAdapter);
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
