import fs from "node:fs";
import path from "node:path";
import { registryRoot } from "@/lib/registry";
import type { PreviewFramework, PreviewUiKit } from "@/lib/preview-prefs";
import { rewriteAtImports } from "@/lib/sandpack/rewrite-at-imports";

/** Transitive `@/components/ui/*` needs for example-next base-nova sources. */
const UI_TRANSITIVE: Record<string, string[]> = {
  sheet: ["button"],
};

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
  return source.replace(/from\s+["']cn["']/g, 'from "@/lib/utils"');
}

function prepareNextUiSource(source: string): string {
  return rewriteAtImports(rewriteCnImport(stripUseClient(source)), "/");
}

function monorepoRoot(): string {
  return path.resolve(process.cwd(), "../..");
}

function exampleNextUiDir(): string {
  return path.join(monorepoRoot(), "examples/next/components/ui");
}

function exampleNextUtils(): string | null {
  const abs = path.join(monorepoRoot(), "examples/next/lib/utils.ts");
  if (fs.existsSync(abs)) {
    const raw = fs.readFileSync(abs, "utf8");
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

/** Expand `button` → button.tsx names, including transitive kit deps. */
export function expandShadcnComponents(components: string[]): string[] {
  const out = new Set<string>();
  const queue = [...components];
  while (queue.length) {
    const id = queue.pop()!;
    if (out.has(id)) continue;
    out.add(id);
    for (const dep of UI_TRANSITIVE[id] ?? []) queue.push(dep);
  }
  return [...out];
}

/**
 * Inject real shadcn sources into Sandpack so `@/components/ui/*` resolves.
 * Next: only the components this block needs from `examples/next/components/ui`.
 * Nuxt: registry ui-kits until a Nuxt example ships real components.
 *
 * Server-only (node:fs) — call from build-project, never from client components.
 */
export function sandpackUiKitFiles(
  kit: PreviewUiKit,
  framework: PreviewFramework = "next",
  components: string[] = [],
): Record<string, string> {
  if (kit !== "shadcn") return {};

  const files: Record<string, string> = {};

  if (framework === "nuxt") {
    const utils = path.join(kitDir(kit, framework), "utils.ts");
    if (fs.existsSync(utils)) {
      files["/src/lib/utils.ts"] = fs.readFileSync(utils, "utf8");
    }
    const root = kitDir(kit, framework);
    const wanted = new Set(expandShadcnComponents(components));
    const dirs = wanted.size
      ? NUXT_UI_DIRS.filter((d) => wanted.has(d))
      : [];
    for (const dir of dirs) {
      for (const { rel, abs } of walkFiles(path.join(root, dir), dir)) {
        files[`/src/components/ui/${rel}`] = rewriteAtImports(
          fs.readFileSync(abs, "utf8"),
          "/src/",
        );
      }
    }
    return files;
  }

  const wanted = expandShadcnComponents(components);
  if (!wanted.length) return files;

  const utils = exampleNextUtils();
  if (utils) files["/lib/utils.ts"] = utils;

  const uiDir = exampleNextUiDir();
  for (const id of wanted) {
    const name = `${id}.tsx`;
    const abs = path.join(uiDir, name);
    if (!fs.existsSync(abs)) continue;
    files[`/components/ui/${name}`] = prepareNextUiSource(
      fs.readFileSync(abs, "utf8"),
    );
  }
  return files;
}
