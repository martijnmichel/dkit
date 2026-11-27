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
  const ext = path.extname(sourceRel) || ".tsx";
  // Nuxt: keep PascalCase block id so auto-import names stay BlogList, not List
  if (framework === "nuxt") {
    return `${blockExportName(blockId)}${ext}`;
  }
  const short = shortBlockFileBase(moduleId, blockId);
  const base = path.basename(sourceRel);
  const stem = ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base;

  // Primary + siblings: blog-list.tsx → list.tsx, nav-header-client.tsx → nav-header-client.tsx
  if (stem === blockId) {
    return `${short}${ext}`;
  }
  if (stem.startsWith(`${blockId}-`)) {
    return `${short}${stem.slice(blockId.length)}${ext}`;
  }

  // Nested source files under a subfolder
  if (path.dirname(sourceRel) !== ".") {
    return path.join(short, base);
  }

  // Odd primary names (contact-form-ui → contact-form.tsx → ui.tsx)
  return `${short}${ext}`;
}

export function slotExportAlias(slot: string): string {
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

/**
 * Primary UI source for barrel exports (not siblings like `*-client.tsx`).
 * Walk order is filesystem-dependent — never use uiFiles[0] blindly.
 */
export function blockPrimaryUiRel(
  blockId: string,
  uiFiles: Array<{ rel: string }>,
): string {
  const stemOf = (rel: string) =>
    path.basename(rel).replace(/\.(tsx|ts|jsx|js|vue)$/i, "");

  const exact = uiFiles.find((f) => stemOf(f.rel) === blockId);
  if (exact) return exact.rel;

  const primary = uiFiles.find(
    (f) => !stemOf(f.rel).startsWith(`${blockId}-`),
  );
  if (primary) return primary.rel;

  return uiFiles[0]?.rel ?? `${blockId}.tsx`;
}
