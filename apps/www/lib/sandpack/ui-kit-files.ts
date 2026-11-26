import fs from "node:fs";
import path from "node:path";
import { registryRoot } from "@/lib/registry";
import type { PreviewFramework, PreviewUiKit } from "@/lib/preview-prefs";

const NEXT_UI_FILES = [
  "button.tsx",
  "input.tsx",
  "label.tsx",
  "textarea.tsx",
  "badge.tsx",
  "card.tsx",
] as const;

function stripUseClient(source: string): string {
  return source.replace(/^["']use client["'];?\s*/m, "");
}

function readKitFile(
  kit: PreviewUiKit,
  framework: PreviewFramework,
  fileName: string,
): string | null {
  const abs = path.join(
    registryRoot(),
    "ui-kits",
    kit,
    framework === "nuxt" ? "nuxt" : "next",
    fileName,
  );
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

/**
 * Inject registry ui-kits/{kit}/{framework} sources into Sandpack so block
 * imports of `@/components/ui/*` resolve. Server-only (node:fs) — call from
 * build-project, never from client components.
 */
export function sandpackUiKitFiles(
  kit: PreviewUiKit,
  framework: PreviewFramework = "next",
): Record<string, string> {
  if (kit !== "shadcn") return {};

  // Vue kit sources land under ui-kits/shadcn/nuxt when ready.
  if (framework === "nuxt") return {};

  const files: Record<string, string> = {};
  const utils = readKitFile(kit, framework, "utils.ts");
  if (utils) {
    files["/lib/utils.ts"] = stripUseClient(utils);
  }

  for (const name of NEXT_UI_FILES) {
    const source = readKitFile(kit, framework, name);
    if (!source) continue;
    files[`/components/ui/${name}`] = stripUseClient(source);
  }

  return files;
}
