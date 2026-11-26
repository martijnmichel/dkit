import fs from "node:fs";
import path from "node:path";
import type { DkitProjectConfig } from "@dkit/shared";
import { resolveAliasPath } from "./paths.js";
import type { LoadedBlock, LoadedModule } from "./registry.js";

export function writeClientHelper(
  projectRoot: string,
  config: DkitProjectConfig,
): string {
  const libDir = resolveAliasPath(config.aliases.lib, projectRoot);
  fs.mkdirSync(libDir, { recursive: true });
  const file = path.join(libDir, "client.ts");
  if (!fs.existsSync(file)) {
    fs.writeFileSync(
      file,
      `import { createDirectus, rest, readItems, createItem } from "@directus/sdk";

const url = process.env.DIRECTUS_URL;
if (!url) {
  throw new Error("Missing DIRECTUS_URL");
}

/** Server-side Directus client (no static admin token — use public role or server token). */
export const directus = createDirectus(url).with(rest());

export { readItems, createItem };
`,
      "utf8",
    );
  }
  return file;
}

export function writeModuleTypes(
  projectRoot: string,
  config: DkitProjectConfig,
  mod: LoadedModule,
): string[] {
  const libDir = resolveAliasPath(config.aliases.lib, projectRoot);
  const outDir = path.join(libDir, mod.manifest.id);
  fs.mkdirSync(outDir, { recursive: true });
  const written: string[] = [];
  for (const abs of mod.typesFiles) {
    const dest = path.join(outDir, path.basename(abs));
    fs.copyFileSync(abs, dest);
    written.push(dest);
  }
  return written;
}

export function writeBlockUi(
  projectRoot: string,
  config: DkitProjectConfig,
  block: LoadedBlock,
  overwrite: boolean,
): string[] {
  const componentsDir = resolveAliasPath(config.aliases.components, projectRoot);
  const outDir = path.join(componentsDir, block.manifest.id);
  fs.mkdirSync(outDir, { recursive: true });
  const written: string[] = [];
  for (const file of block.uiFiles) {
    const dest = path.join(outDir, file.rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest) && !overwrite) {
      throw new Error(
        `File already exists: ${dest}. Re-run with --force to overwrite.`,
      );
    }
    fs.copyFileSync(file.abs, dest);
    written.push(dest);
  }
  return written;
}

export function writeProjectConfig(
  projectRoot: string,
  config: DkitProjectConfig,
): void {
  const file = path.join(projectRoot, "dkit.json");
  fs.writeFileSync(file, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function readProjectConfig(
  projectRoot: string,
): DkitProjectConfig | null {
  const file = path.join(projectRoot, "dkit.json");
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as DkitProjectConfig;
}

export function ensurePackageDependency(
  projectRoot: string,
  pkg: string,
): boolean {
  const pkgPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(pkgPath)) return false;
  const json = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  return Boolean(
    json.dependencies?.[pkg] || json.devDependencies?.[pkg],
  );
}
