import fs from "node:fs";
import path from "node:path";
import {
  DIRECTUS_COLLECTION_FALLBACK_ICON,
  DIRECTUS_FOLDER_ICON,
} from "@/lib/directus-icons";
import type { RestSchemaDoc } from "@/lib/schema-docs";

export type RegistryItem = {
  id: string;
  type: "dkit:module" | "dkit:block";
  title: string;
  description: string;
  version: string;
  path: string;
  defaultBlocks?: string[];
  registryDependencies?: string[];
  slot?: string;
  route?: { kind: "index" | "slug" | "static" };
};

export type RegistryIndex = {
  name: string;
  homepage?: string;
  version?: string;
  items: RegistryItem[];
};

/** Prefer packages/registry in monorepo; fall back to synced public/r. */
export function registryRoot(): string {
  const candidates = [
    path.join(process.cwd(), "../../packages/registry"),
    path.join(process.cwd(), "public/r"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "registry.json"))) return c;
  }
  return candidates[0]!;
}

export function getBlocksForModule(moduleId: string): RegistryItem[] {
  return getRegistry().items.filter(
    (i) =>
      i.type === "dkit:block" &&
      (i.registryDependencies ?? []).includes(moduleId),
  );
}

export function getRegistry(): RegistryIndex {
  const root = registryRoot();
  return JSON.parse(
    fs.readFileSync(path.join(root, "registry.json"), "utf8"),
  ) as RegistryIndex;
}

export function getModuleMeta(id: string) {
  const root = registryRoot();
  const index = getRegistry();
  const item = index.items.find((i) => i.id === id);
  if (!item) return null;

  const dir = path.join(root, item.path);
  const manifest = JSON.parse(
    fs.readFileSync(path.join(dir, "module.json"), "utf8"),
  ) as Record<string, unknown>;

  let schema: unknown;
  let access: unknown;
  let flows: unknown;
  let seed: unknown;
  const schemaPath = path.join(dir, "schema/snapshot.json");
  const accessPath = path.join(dir, "access/policies.json");
  const flowsPath = path.join(dir, "services/flows.json");
  const seedPath = path.join(dir, "services/seed.json");
  if (fs.existsSync(schemaPath))
    schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  if (fs.existsSync(accessPath))
    access = JSON.parse(fs.readFileSync(accessPath, "utf8"));
  if (fs.existsSync(flowsPath))
    flows = JSON.parse(fs.readFileSync(flowsPath, "utf8"));
  if (fs.existsSync(seedPath))
    seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));

  return { item, manifest, schema, access, flows, seed };
}

/** Material Symbol for a module — prefers the root folder / first collection icon from the snapshot. */
export function getModuleIcon(moduleId: string): string {
  const meta = getModuleMeta(moduleId);
  const collections = (meta?.schema as RestSchemaDoc | undefined)?.collections ?? [];
  const folder = collections.find(
    (c) => c.schema === null && c.meta?.icon,
  );
  if (folder?.meta?.icon) return folder.meta.icon;
  const withIcon = collections.find((c) => c.meta?.icon);
  if (withIcon?.meta?.icon) return withIcon.meta.icon;
  if (collections.some((c) => c.schema === null)) return DIRECTUS_FOLDER_ICON;
  return DIRECTUS_COLLECTION_FALLBACK_ICON;
}
