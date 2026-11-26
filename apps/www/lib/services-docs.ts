import fs from "node:fs";
import path from "node:path";
import { getRegistry, registryRoot } from "@/lib/registry";

export type FlowDoc = {
  name: string;
  description?: string | null;
  status?: string;
  trigger?: string;
  icon?: string | null;
  options?: {
    type?: string;
    scope?: string[];
    collections?: string[];
  } | null;
};

export type SeedFileDoc = {
  id: string;
  filename_download: string;
  title?: string;
  type?: string;
  path?: string;
};

export type SeedItemDoc = {
  id?: string;
  label: string;
  status?: string;
  slug?: string;
};

export type SeedCollectionDoc = {
  collection: string;
  count: number;
  items: SeedItemDoc[];
};

export type ModuleServicesDoc = {
  moduleId: string;
  title: string;
  flows: FlowDoc[];
  operationsCount: number;
  seedFiles: SeedFileDoc[];
  seedCollections: SeedCollectionDoc[];
  hasServices: boolean;
};

function seedItemLabel(item: Record<string, unknown>): string {
  for (const key of ["title", "name", "slug"] as const) {
    const v = item[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  if (typeof item.id === "string") return item.id;
  return "item";
}

export function parseFlowsBundle(raw: unknown): {
  flows: FlowDoc[];
  operationsCount: number;
} {
  if (!raw || typeof raw !== "object") {
    return { flows: [], operationsCount: 0 };
  }
  const data = raw as {
    flows?: FlowDoc[];
    operations?: unknown[];
  };
  return {
    flows: data.flows ?? [],
    operationsCount: data.operations?.length ?? 0,
  };
}

export function parseSeedBundle(raw: unknown): {
  files: SeedFileDoc[];
  collections: SeedCollectionDoc[];
} {
  if (!raw || typeof raw !== "object") {
    return { files: [], collections: [] };
  }
  const data = raw as {
    files?: SeedFileDoc[];
    items?: Record<string, Record<string, unknown>[]>;
  };
  const files = data.files ?? [];
  const collections = Object.entries(data.items ?? {}).map(
    ([collection, items]) => ({
      collection,
      count: items.length,
      items: items.map((item) => ({
        id: typeof item.id === "string" ? item.id : undefined,
        label: seedItemLabel(item),
        status: typeof item.status === "string" ? item.status : undefined,
        slug: typeof item.slug === "string" ? item.slug : undefined,
      })),
    }),
  );
  return { files, collections };
}

/** Load exact services/flows.json + services/seed.json for every module. */
export function listModuleServices(): ModuleServicesDoc[] {
  const root = registryRoot();
  return getRegistry()
    .items.filter((i) => i.type === "dkit:module")
    .map((item) => {
      const dir = path.join(root, item.path);
      const flowsPath = path.join(dir, "services/flows.json");
      const seedPath = path.join(dir, "services/seed.json");

      let flowsRaw: unknown;
      let seedRaw: unknown;
      if (fs.existsSync(flowsPath)) {
        flowsRaw = JSON.parse(fs.readFileSync(flowsPath, "utf8"));
      }
      if (fs.existsSync(seedPath)) {
        seedRaw = JSON.parse(fs.readFileSync(seedPath, "utf8"));
      }

      const { flows, operationsCount } = parseFlowsBundle(flowsRaw);
      const { files, collections } = parseSeedBundle(seedRaw);
      const hasServices =
        flows.length > 0 ||
        files.length > 0 ||
        collections.some((c) => c.count > 0);

      return {
        moduleId: item.id,
        title: item.title,
        flows,
        operationsCount,
        seedFiles: files,
        seedCollections: collections,
        hasServices,
      };
    });
}
