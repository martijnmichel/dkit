import fs from "node:fs";
import path from "node:path";
import { registryRoot } from "@/lib/registry";

export type SeedBundle = {
  files?: Array<{
    id: string;
    filename_download: string;
    path?: string;
  }>;
  items?: Record<string, Record<string, unknown>[]>;
};

/** Load module seed.json (dev: packages/registry, prod build: public/r). */
export function loadModuleSeed(moduleId: string): SeedBundle | null {
  const root = registryRoot();
  const candidates = [
    path.join(root, "modules", moduleId, "services", "seed.json"),
    path.join(root, "modules", moduleId, "seed.json"),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    return JSON.parse(fs.readFileSync(file, "utf8")) as SeedBundle;
  }
  return null;
}

/** Public URL for a seeded file id (synced to /preview/{module}/…). */
export function previewAssetUrl(
  moduleId: string,
  fileId: string | { id: string } | null | undefined,
): string | null {
  if (!fileId) return null;
  const id = typeof fileId === "string" ? fileId : fileId.id;
  const seed = loadModuleSeed(moduleId);
  const file = seed?.files?.find((f) => f.id === id);
  if (!file) return null;
  return `/preview/${moduleId}/${file.filename_download}`;
}
