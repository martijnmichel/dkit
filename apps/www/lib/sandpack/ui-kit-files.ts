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

/** shadcn-vue folders under ui-kits/shadcn/nuxt (from shadcn-vue registry). */
const NUXT_UI_DIRS = [
  "button",
  "badge",
  "card",
  "input",
  "label",
  "textarea",
] as const;

function stripUseClient(source: string): string {
  return source.replace(/^["']use client["'];?\s*/m, "");
}

function kitDir(kit: PreviewUiKit, framework: PreviewFramework): string {
  return path.join(
    registryRoot(),
    "ui-kits",
    kit,
    framework === "nuxt" ? "nuxt" : "next",
  );
}

function readKitFile(
  kit: PreviewUiKit,
  framework: PreviewFramework,
  fileName: string,
): string | null {
  const abs = path.join(kitDir(kit, framework), fileName);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

function walkFiles(dir: string, base = ""): Array<{ rel: string; abs: string }> {
  if (!fs.existsSync(dir)) return [];
  const out: Array<{ rel: string; abs: string }> = [];
  for (const name of fs.readdirSync(dir)) {
    const abs = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (fs.statSync(abs).isDirectory()) {
      out.push(...walkFiles(abs, rel));
    } else {
      out.push({ rel, abs });
    }
  }
  return out;
}

/**
 * Inject registry ui-kits/{kit}/{framework} sources into Sandpack so block
 * imports of `@/components/ui/*` resolve. Server-only (node:fs) — call from
 * build-project, never from client components.
 *
 * Preview-only: consumers still get real kit pieces via `shadcn` / `shadcn-vue`.
 */
export function sandpackUiKitFiles(
  kit: PreviewUiKit,
  framework: PreviewFramework = "next",
): Record<string, string> {
  if (kit !== "shadcn") return {};

  const files: Record<string, string> = {};
  const utils = readKitFile(kit, framework, "utils.ts");

  if (framework === "nuxt") {
    if (utils) files["/src/lib/utils.ts"] = utils;
    const root = kitDir(kit, framework);
    for (const dir of NUXT_UI_DIRS) {
      for (const { rel, abs } of walkFiles(path.join(root, dir), dir)) {
        files[`/src/components/ui/${rel}`] = fs.readFileSync(abs, "utf8");
      }
    }
    return files;
  }

  if (utils) files["/lib/utils.ts"] = stripUseClient(utils);
  for (const name of NEXT_UI_FILES) {
    const source = readKitFile(kit, framework, name);
    if (!source) continue;
    files[`/components/ui/${name}`] = stripUseClient(source);
  }
  return files;
}
