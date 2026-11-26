import path from "node:path";
import type { Framework } from "@dkit/shared";

/**
 * Component export name for a block id.
 * blog-list → BlogList, contact-form-ui → ContactForm (strip trailing -ui)
 */
export function blockExportName(blockId: string): string {
  let id = blockId;
  if (id.endsWith("-ui") && id !== "ui") {
    id = id.slice(0, -3);
  }
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Module that owns a block (first registry dependency), if any. */
export function blockModuleId(block: {
  registryDependencies?: string[];
}): string | undefined {
  return block.registryDependencies?.[0];
}

/**
 * Short install filename for a block under components/dkit/{module}/.
 * blog-list → list, blog-list-cards → list-cards, contact-form-ui → ui
 */
export function shortBlockFileBase(
  moduleId: string,
  blockId: string,
): string {
  let name = blockId;
  if (name.startsWith(`${moduleId}-`)) {
    name = name.slice(moduleId.length + 1);
  }
  if (name.endsWith("-ui") && name !== "ui") {
    name = name.slice(0, -3);
  }
  if (!name || name === moduleId) {
    name = "ui";
  }
  return name;
}

/** Destination relative path inside components/dkit/{module}/ */
export function blockUiDestRel(
  moduleId: string,
  blockId: string,
  framework: Framework,
  sourceRel: string,
): string {
  const ext = path.extname(sourceRel);
  // Nuxt: keep PascalCase block id so auto-import names stay BlogList, not List
  if (framework === "nuxt") {
    return `${blockExportName(blockId)}${ext || ".vue"}`;
  }
  const short = shortBlockFileBase(moduleId, blockId);
  // Nested source files: siblings live under the short folder name
  if (path.dirname(sourceRel) !== ".") {
    return path.join(short, path.basename(sourceRel));
  }
  return `${short}${ext}`;
}

export function slotExportAlias(slot: string): string {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}
