import fs from "node:fs";
import path from "node:path";
import {
  BlockManifestSchema,
  ModuleManifestSchema,
  RegistryIndexSchema,
  type BlockManifest,
  type Framework,
  type ModuleManifest,
  type RegistryIndex,
  type RegistryItem,
} from "@dkit/shared";
import { getBundledRegistryRoot } from "./paths.js";
import {
  resolveDefaultBlocksFromTemplates,
  type TemplateOverrides,
} from "./templates.js";

export type LoadedModule = {
  manifest: ModuleManifest;
  dir: string;
  snapshot?: unknown;
  access?: unknown;
  flows?: unknown;
  seed?: unknown;
  /** Preferred: single lib/dkit/{id}.ts source at modules/{id}/lib.ts */
  libFile?: string;
  /** Legacy types/ folder (only used when lib.ts is absent) */
  typesFiles: string[];
};

export type LoadedBlock = {
  manifest: BlockManifest;
  dir: string;
  framework: Framework;
  uiFiles: Array<{ abs: string; rel: string }>;
};

export async function loadRegistryIndex(
  registryUrlOrPath?: string,
): Promise<{ index: RegistryIndex; root: string; remote: boolean }> {
  if (registryUrlOrPath?.startsWith("http")) {
    const base = registryUrlOrPath.replace(/\/$/, "");
    const res = await fetch(`${base}/registry.json`);
    if (!res.ok) throw new Error(`Failed to fetch registry: ${res.status}`);
    const index = RegistryIndexSchema.parse(await res.json());
    return { index, root: base, remote: true };
  }

  const root = registryUrlOrPath ?? getBundledRegistryRoot();
  const file = path.join(root, "registry.json");
  if (!fs.existsSync(file)) {
    throw new Error(`Registry not found at ${file}`);
  }
  const index = RegistryIndexSchema.parse(
    JSON.parse(fs.readFileSync(file, "utf8")),
  );
  return { index, root, remote: false };
}

export async function loadItem(
  id: string,
  registryUrlOrPath?: string,
  framework: Framework = "next",
): Promise<
  | { kind: "module"; item: LoadedModule }
  | { kind: "block"; item: LoadedBlock }
> {
  const { index, root, remote } = await loadRegistryIndex(registryUrlOrPath);
  const entry = index.items.find((i) => i.id === id);
  if (!entry) {
    throw new Error(
      `Unknown registry item "${id}". Run \`dkit list\` to see available modules and blocks.`,
    );
  }

  if (remote) {
    throw new Error(
      "Remote registry file fetch is not fully wired yet for this MVP build — use the bundled packages/registry (default).",
    );
  }

  const dir = path.join(root, entry.path);
  if (entry.type === "dkit:module") {
    return { kind: "module", item: loadModuleDir(dir) };
  }
  return { kind: "block", item: loadBlockDir(dir, framework) };
}

function loadModuleDir(dir: string): LoadedModule {
  const manifest = ModuleManifestSchema.parse(
    JSON.parse(fs.readFileSync(path.join(dir, "module.json"), "utf8")),
  );
  const snapshotPath = path.join(dir, "schema", "snapshot.json");
  const accessPath = path.join(dir, "access", "policies.json");
  const flowsPath = path.join(dir, "services", "flows.json");
  const seedPath = path.join(dir, "services", "seed.json");
  const libPath = path.join(dir, "lib.ts");
  const typesDir = path.join(dir, "types");

  const libFile = fs.existsSync(libPath) ? libPath : undefined;
  const typesFiles: string[] = [];
  if (!libFile && fs.existsSync(typesDir)) {
    for (const f of fs.readdirSync(typesDir)) {
      if (f.endsWith(".ts")) typesFiles.push(path.join(typesDir, f));
    }
  }

  return {
    manifest,
    dir,
    snapshot: readJsonIfExists(snapshotPath),
    access: readJsonIfExists(accessPath),
    flows: readJsonIfExists(flowsPath),
    seed: loadSeedBundle(path.join(dir, "services"), seedPath),
    libFile,
    typesFiles,
  };
}

/** Load seed.json and inline file bytes from `path` relative to services/. */
function loadSeedBundle(servicesDir: string, seedPath: string): unknown {
  if (!fs.existsSync(seedPath)) return undefined;
  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8")) as {
    files?: Array<{
      id: string;
      filename_download: string;
      title?: string;
      type?: string;
      path?: string;
      data_base64?: string;
    }>;
    items?: Record<string, Record<string, unknown>[]>;
  };
  if (!seed.files?.length) return seed;

  seed.files = seed.files.map((file) => {
    if (file.data_base64 || !file.path) return file;
    const abs = path.resolve(servicesDir, file.path);
    if (!abs.startsWith(path.resolve(servicesDir))) {
      throw new Error(`Seed file path escapes services/: ${file.path}`);
    }
    if (!fs.existsSync(abs)) {
      throw new Error(`Seed file not found: ${abs}`);
    }
    return {
      ...file,
      data_base64: fs.readFileSync(abs).toString("base64"),
    };
  });
  return seed;
}

function loadBlockDir(dir: string, framework: Framework): LoadedBlock {
  const manifest = BlockManifestSchema.parse(
    JSON.parse(fs.readFileSync(path.join(dir, "module.json"), "utf8")),
  );
  if (!manifest.frameworks.includes(framework)) {
    throw new Error(
      `Block "${manifest.id}" has no "${framework}" adapter. Available: ${manifest.frameworks.join(", ")}`,
    );
  }
  const uiRoot = path.join(dir, "ui", framework);
  const uiFiles: Array<{ abs: string; rel: string }> = [];
  if (!fs.existsSync(uiRoot)) {
    throw new Error(
      `Missing ui/${framework} for block "${manifest.id}" at ${uiRoot}`,
    );
  }
  walkFiles(uiRoot, (abs) => {
    uiFiles.push({ abs, rel: path.relative(uiRoot, abs) });
  });
  return { manifest, dir, framework, uiFiles };
}

function readJsonIfExists(file: string): unknown | undefined {
  if (!fs.existsSync(file)) return undefined;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function walkFiles(dir: string, visit: (abs: string) => void): void {
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const st = fs.statSync(abs);
    if (st.isDirectory()) walkFiles(abs, visit);
    else visit(abs);
  }
}

export function resolveInstallPlan(
  id: string,
  index: RegistryIndex,
  registryRoot: string,
  opts: {
    schemaOnly?: boolean;
    uiOnly?: boolean;
    withBlocks?: string[];
    templateOverrides?: TemplateOverrides;
  },
): { modules: string[]; blocks: string[] } {
  const entry = index.items.find((i) => i.id === id);
  if (!entry) throw new Error(`Unknown item "${id}"`);

  const modules = new Set<string>();
  const blocks = new Set<string>();

  if (entry.type === "dkit:module") {
    if (!opts.uiOnly) modules.add(entry.id);
    if (!opts.schemaOnly) {
      const names = resolveDefaultBlocksFromTemplates(
        entry.id,
        index,
        registryRoot,
        opts.templateOverrides ?? {},
        opts.withBlocks,
      );
      for (const b of names) blocks.add(b);
    }
  } else {
    blocks.add(entry.id);
    for (const dep of entry.registryDependencies ?? []) {
      const depEntry = index.items.find((i) => i.id === dep);
      if (depEntry?.type === "dkit:module" && !opts.uiOnly) {
        modules.add(dep);
      } else if (depEntry?.type === "dkit:block") {
        blocks.add(dep);
      }
    }
  }

  for (const b of [...blocks]) {
    const be = index.items.find((i) => i.id === b);
    for (const dep of be?.registryDependencies ?? []) {
      const depEntry = index.items.find((i) => i.id === dep);
      if (depEntry?.type === "dkit:module" && !opts.uiOnly) modules.add(dep);
    }
  }

  return { modules: [...modules], blocks: [...blocks] };
}

export type { RegistryItem };
