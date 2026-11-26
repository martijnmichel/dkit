import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Framework } from "@dkit/shared";

const IGNORE_EMPTY = new Set([
  ".git",
  ".DS_Store",
  ".idea",
  ".vscode",
  ".cursor",
  "Thumbs.db",
]);

export type DetectedFramework = {
  framework: Framework | null;
  reasons: string[];
};

/** Detect next | nuxt from package.json deps + config files in projectRoot. */
export function detectFramework(projectRoot: string): DetectedFramework {
  const reasons: string[] = [];
  const pkgPath = path.join(projectRoot, "package.json");
  let deps: Record<string, string> = {};

  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      deps = { ...pkg.dependencies, ...pkg.devDependencies };
    } catch {
      // ignore malformed package.json
    }
  }

  const hasNextDep = Boolean(deps.next);
  const hasNuxtDep = Boolean(deps.nuxt);
  const hasNextConfig = [
    "next.config.ts",
    "next.config.js",
    "next.config.mjs",
    "next.config.cjs",
  ].some((f) => fs.existsSync(path.join(projectRoot, f)));
  const hasNuxtConfig = [
    "nuxt.config.ts",
    "nuxt.config.js",
    "nuxt.config.mjs",
  ].some((f) => fs.existsSync(path.join(projectRoot, f)));
  const hasAppDir =
    fs.existsSync(path.join(projectRoot, "app")) ||
    fs.existsSync(path.join(projectRoot, "src", "app"));

  if (hasNuxtDep || hasNuxtConfig) {
    if (hasNuxtDep) reasons.push("nuxt in package.json");
    if (hasNuxtConfig) reasons.push("nuxt.config");
    return { framework: "nuxt", reasons };
  }
  if (hasNextDep || hasNextConfig || (hasAppDir && !hasNuxtDep)) {
    if (hasNextDep) reasons.push("next in package.json");
    if (hasNextConfig) reasons.push("next.config");
    if (hasAppDir && !hasNextDep) reasons.push("app/ directory");
    return { framework: "next", reasons };
  }

  return { framework: null, reasons };
}

/** True when cwd has no package.json and only ignorable entries (or is empty). */
export function isScaffoldableDir(dir: string): boolean {
  if (fs.existsSync(path.join(dir, "package.json"))) return false;
  if (fs.existsSync(path.join(dir, "dkit.json"))) return false;
  let entries: string[];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return false;
  }
  return entries.every((name) => IGNORE_EMPTY.has(name) || name.startsWith("."));
}

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

export function detectPackageManager(cwd: string): PackageManager {
  if (fs.existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(cwd, "bun.lockb")) || fs.existsSync(path.join(cwd, "bun.lock"))) {
    return "bun";
  }
  if (fs.existsSync(path.join(cwd, "package-lock.json"))) return "npm";

  // Prefer tools on PATH
  for (const pm of ["pnpm", "bun", "yarn", "npm"] as const) {
    const r = spawnSync(pm, ["--version"], { stdio: "ignore" });
    if (r.status === 0) return pm;
  }
  return "npm";
}
