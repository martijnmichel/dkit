import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function findProjectRoot(cwd = process.cwd()): string {
  let dir = cwd;
  for (;;) {
    if (
      fs.existsSync(path.join(dir, "package.json")) ||
      fs.existsSync(path.join(dir, "dkit.json"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return cwd;
    dir = parent;
  }
}

/** Bundled or monorepo registry root */
export function getBundledRegistryRoot(): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(here, "../../vendor/registry"),
    path.resolve(here, "../../../registry"),
    path.resolve(here, "../../../../packages/registry"),
    path.resolve(process.cwd(), "packages/registry"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "registry.json"))) return c;
  }
  return candidates[0]!;
}

export function resolveAliasPath(
  alias: string,
  projectRoot: string,
): string {
  // Map @/… to project src or root — Next usually has @ -> .
  if (alias.startsWith("@/")) {
    const rest = alias.slice(2);
    const src = path.join(projectRoot, "src", rest);
    if (fs.existsSync(path.join(projectRoot, "src"))) return src;
    return path.join(projectRoot, rest);
  }
  return path.resolve(projectRoot, alias);
}
