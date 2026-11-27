import fs from "node:fs";
import path from "node:path";
import { registryRoot } from "@/lib/registry";
import type { PreviewFramework, PreviewUiKit } from "@/lib/preview-prefs";

/** Real installed shadcn (base-nova) from the Next example app. */
const NEXT_UI_FILES = [
  "button.tsx",
  "input.tsx",
  "label.tsx",
  "textarea.tsx",
  "badge.tsx",
  "card.tsx",
  "navigation-menu.tsx",
  "popover.tsx",
  "sheet.tsx",
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

/** example-next uses `import { cn } from "cn"` — Sandpack resolves via `@/lib/utils`. */
function rewriteCnImport(source: string): string {
  return source.replace(
    /from\s+["']cn["']/g,
    'from "@/lib/utils"',
  );
}

function prepareNextUiSource(source: string): string {
  return rewriteCnImport(stripUseClient(source));
}

function monorepoRoot(): string {
  // apps/www → repo root (cwd when Next runs is apps/www)
  return path.resolve(process.cwd(), "../..");
}

function exampleNextUiDir(): string {
  return path.join(monorepoRoot(), "examples/next/components/ui");
}

function exampleNextUtils(): string | null {
  const abs = path.join(monorepoRoot(), "examples/next/lib/utils.ts");
  if (fs.existsSync(abs)) {
    const raw = fs.readFileSync(abs, "utf8");
    // example re-exports from "cn" — Sandpack needs the real helper
    if (/from\s+["']cn["']/.test(raw)) {
      return `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
    }
    return stripUseClient(raw);
  }
  return null;
}

function kitDir(kit: PreviewUiKit, framework: PreviewFramework): string {
  return path.join(
    registryRoot(),
    "ui-kits",
    kit,
    framework === "nuxt" ? "nuxt" : "next",
  );
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
 * Inject real shadcn sources into Sandpack so `@/components/ui/*` resolves.
 * Next: `examples/next/components/ui` (installed base-nova).
 * Nuxt: registry ui-kits stubs until a Nuxt example ships real components.
 *
 * Server-only (node:fs) — call from build-project, never from client components.
 */
export function sandpackUiKitFiles(
  kit: PreviewUiKit,
  framework: PreviewFramework = "next",
): Record<string, string> {
  if (kit !== "shadcn") return {};

  const files: Record<string, string> = {};

  if (framework === "nuxt") {
    const utils = path.join(kitDir(kit, framework), "utils.ts");
    if (fs.existsSync(utils)) {
      files["/src/lib/utils.ts"] = fs.readFileSync(utils, "utf8");
    }
    const root = kitDir(kit, framework);
    for (const dir of NUXT_UI_DIRS) {
      for (const { rel, abs } of walkFiles(path.join(root, dir), dir)) {
        files[`/src/components/ui/${rel}`] = fs.readFileSync(abs, "utf8");
      }
    }
    return files;
  }

  const utils = exampleNextUtils();
  if (utils) files["/lib/utils.ts"] = utils;

  const uiDir = exampleNextUiDir();
  for (const name of NEXT_UI_FILES) {
    const abs = path.join(uiDir, name);
    if (!fs.existsSync(abs)) continue;
    files[`/components/ui/${name}`] = prepareNextUiSource(
      fs.readFileSync(abs, "utf8"),
    );
  }
  return files;
}
