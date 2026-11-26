import fs from "node:fs";
import path from "node:path";
import { getBundledRegistryRoot } from "./paths.js";

/** App-relative path for shared prose CSS */
export const DKIT_PROSE_REL = path.join("styles", "dkit", "prose.css");

/**
 * Install shared `.dkit-prose` styles (idempotent overwrite of generated file).
 * Rich-text blocks depend on this class contract.
 */
export function writeSharedProse(
  projectRoot: string,
  overwrite = true,
): { written?: string; skipped?: string } {
  const dest = path.join(projectRoot, DKIT_PROSE_REL);
  if (fs.existsSync(dest) && !overwrite) {
    return { skipped: dest };
  }

  const src = path.join(getBundledRegistryRoot(), "shared", "prose.css");
  if (!fs.existsSync(src)) {
    throw new Error(`Shared prose stylesheet missing at ${src}`);
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  return { written: dest };
}
