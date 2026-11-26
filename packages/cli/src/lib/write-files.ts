import fs from "node:fs";
import path from "node:path";
import type { DkitProjectConfig } from "@dkit/shared";
import {
  blockModuleId,
  blockUiDestRel,
} from "./block-paths.js";
import { resolveAliasPath } from "./paths.js";
import type { LoadedBlock, LoadedModule } from "./registry.js";

export { writeClientHelper, writeDkitClient } from "./write-client.js";

/** Install module types + lib as lib/dkit/{id}.types.ts and lib/dkit/{id}.ts. */
export function writeModuleLib(
  projectRoot: string,
  config: DkitProjectConfig,
  mod: LoadedModule,
): string[] {
  const libDir = resolveAliasPath(config.aliases.lib, projectRoot);
  fs.mkdirSync(libDir, { recursive: true });
  const written: string[] = [];
  const id = mod.manifest.id;

  if (mod.typesFile) {
    const dest = path.join(libDir, `${id}.types.ts`);
    fs.copyFileSync(mod.typesFile, dest);
    written.push(dest);
  }

  if (mod.libFile) {
    const dest = path.join(libDir, `${id}.ts`);
    let source = fs.readFileSync(mod.libFile, "utf8");
    // Registry uses ./types; installed apps resolve ./<id>.types
    source = source
      .replaceAll(`from "./types"`, `from "./${id}.types"`)
      .replaceAll(`from './types'`, `from './${id}.types'`);
    fs.writeFileSync(dest, source, "utf8");
    written.push(dest);
  }

  // Legacy: copy types/* into lib/dkit/{id}/ if present (prefer lib.ts)
  if (!mod.libFile && !mod.typesFile && mod.typesFiles.length) {
    const outDir = path.join(libDir, id);
    fs.mkdirSync(outDir, { recursive: true });
    for (const abs of mod.typesFiles) {
      const dest = path.join(outDir, path.basename(abs));
      fs.copyFileSync(abs, dest);
      written.push(dest);
    }
  }

  return written;
}

/** @deprecated use writeModuleLib */
export const writeModuleTypes = writeModuleLib;

function componentsRoot(
  projectRoot: string,
  config: DkitProjectConfig,
): string {
  return resolveAliasPath(
    config.framework === "nuxt" && !config.aliases.components.includes("nuxt")
      ? (config.aliases.components || "@/components/dkit")
      : config.aliases.components,
    projectRoot,
  );
}

function blockUiOutDir(
  projectRoot: string,
  config: DkitProjectConfig,
  block: LoadedBlock,
): { outDir: string; moduleId: string } {
  const moduleId =
    blockModuleId(block.manifest) ?? block.manifest.id;
  const outDir = path.join(componentsRoot(projectRoot, config), moduleId);
  return { outDir, moduleId };
}

/** Dest paths that already exist for this block (relative to project root). */
export function listBlockUiConflicts(
  projectRoot: string,
  config: DkitProjectConfig,
  block: LoadedBlock,
): string[] {
  const { outDir, moduleId } = blockUiOutDir(projectRoot, config, block);
  const conflicts: string[] = [];
  for (const file of block.uiFiles) {
    const rel = blockUiDestRel(
      moduleId,
      block.manifest.id,
      config.framework,
      file.rel,
    );
    const dest = path.join(outDir, rel);
    if (fs.existsSync(dest)) {
      conflicts.push(path.relative(projectRoot, dest) || dest);
    }
  }
  return conflicts;
}

export function writeBlockUi(
  projectRoot: string,
  config: DkitProjectConfig,
  block: LoadedBlock,
  overwrite: boolean,
): { written: string[]; skipped: string[] } {
  const { outDir, moduleId } = blockUiOutDir(projectRoot, config, block);
  fs.mkdirSync(outDir, { recursive: true });
  const written: string[] = [];
  const skipped: string[] = [];
  for (const file of block.uiFiles) {
    const rel = blockUiDestRel(
      moduleId,
      block.manifest.id,
      config.framework,
      file.rel,
    );
    const dest = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest) && !overwrite) {
      skipped.push(dest);
      continue;
    }
    fs.copyFileSync(file.abs, dest);
    written.push(dest);
  }
  return { written, skipped };
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
