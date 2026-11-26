import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BlockManifestSchema,
  ModuleManifestSchema,
  RegistryIndexSchema,
  type BlockManifest,
  type ModuleManifest,
  type RegistryIndex,
} from "@dkit/shared";

export function getBundledRegistryRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../vendor/registry"),
    path.resolve(here, "../../vendor/registry"),
    path.resolve(here, "../../../registry"),
    path.resolve(process.cwd(), "packages/registry"),
    path.resolve(process.cwd(), "packages/mcp/vendor/registry"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "registry.json"))) return c;
  }
  return candidates[0]!;
}

export function loadRegistryIndex(registryRoot?: string): {
  index: RegistryIndex;
  root: string;
} {
  const root = registryRoot ?? getBundledRegistryRoot();
  const file = path.join(root, "registry.json");
  if (!fs.existsSync(file)) {
    throw new Error(`Registry not found at ${file}`);
  }
  const index = RegistryIndexSchema.parse(
    JSON.parse(fs.readFileSync(file, "utf8")),
  );
  return { index, root };
}

export function loadModuleManifest(
  root: string,
  entryPath: string,
): ModuleManifest {
  const file = path.join(root, entryPath, "module.json");
  return ModuleManifestSchema.parse(
    JSON.parse(fs.readFileSync(file, "utf8")),
  );
}

export function loadBlockManifest(
  root: string,
  entryPath: string,
): BlockManifest {
  const file = path.join(root, entryPath, "module.json");
  return BlockManifestSchema.parse(
    JSON.parse(fs.readFileSync(file, "utf8")),
  );
}

export type SchemaSummary = {
  collections: string[];
  fieldsByCollection: Record<string, string[]>;
};

/** Lightweight snapshot summary — collection names + field keys only. */
export function summarizeSnapshot(
  root: string,
  entryPath: string,
): SchemaSummary | undefined {
  const snapshotPath = path.join(root, entryPath, "schema", "snapshot.json");
  if (!fs.existsSync(snapshotPath)) return undefined;

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as {
    collections?: Array<{
      collection?: string;
      fields?: Array<{ field?: string }>;
    }>;
    fields?: Array<{ collection?: string; field?: string }>;
    data?: {
      collections?: Array<{
        collection?: string;
        fields?: Array<{ field?: string }>;
      }>;
      fields?: Array<{ collection?: string; field?: string }>;
    };
  };

  const collectionsRaw =
    snapshot.collections ?? snapshot.data?.collections ?? [];
  const fieldsRaw = snapshot.fields ?? snapshot.data?.fields ?? [];

  const collections = [
    ...new Set(
      collectionsRaw
        .map((c) => c.collection)
        .filter((c): c is string => Boolean(c)),
    ),
  ].sort();

  const fieldsByCollection: Record<string, string[]> = {};

  for (const c of collectionsRaw) {
    if (!c.collection || !c.fields?.length) continue;
    fieldsByCollection[c.collection] = [
      ...new Set(
        c.fields
          .map((f) => f.field)
          .filter((f): f is string => Boolean(f)),
      ),
    ].sort();
  }

  for (const f of fieldsRaw) {
    if (!f.collection || !f.field) continue;
    if (!fieldsByCollection[f.collection]) {
      fieldsByCollection[f.collection] = [];
    }
    fieldsByCollection[f.collection]!.push(f.field);
  }
  for (const key of Object.keys(fieldsByCollection)) {
    fieldsByCollection[key] = [...new Set(fieldsByCollection[key])].sort();
  }

  return { collections, fieldsByCollection };
}
