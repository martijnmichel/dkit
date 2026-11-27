import fs from "node:fs";
import path from "node:path";
import { registryRoot } from "@/lib/registry";
import type { PreviewFramework, PreviewUiKit } from "@/lib/preview-prefs";
import { rewriteAtImports } from "@/lib/sandpack/rewrite-at-imports";

/** Transitive `@/components/ui/*` needs for base-nova sources. */
const UI_TRANSITIVE: Record<string, string[]> = {
  sheet: ["button"],
};

/** shadcn-vue folders under ui-kits/shadcn/nuxt. */
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

/** Expand `button` → ids, including transitive kit deps. */
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
 * Inject registry `ui-kits/shadcn/{next,nuxt}` sources into Sandpack.
 * Only the components the block needs (Docker www ships `packages/`, not
 * `examples/`). Relative `@/` rewrites happen per virtual file path.
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
  const wanted = expandShadcnComponents(components);

  if (framework === "nuxt") {
    const utils = path.join(kitDir(kit, framework), "utils.ts");
    if (fs.existsSync(utils) && wanted.length) {
      const dest = "/src/lib/utils.ts";
      files[dest] = rewriteAtImports(fs.readFileSync(utils, "utf8"), dest);
    }
    const root = kitDir(kit, framework);
    const dirs = wanted.length
      ? NUXT_UI_DIRS.filter((d) => wanted.includes(d))
      : [];
    for (const dir of dirs) {
      for (const { rel, abs } of walkFiles(path.join(root, dir), dir)) {
        const dest = `/src/components/ui/${rel}`;
        files[dest] = rewriteAtImports(fs.readFileSync(abs, "utf8"), dest);
      }
    }
    return files;
  }

  if (!wanted.length) return files;

  const root = kitDir(kit, framework);
  const utilsAbs = path.join(root, "utils.ts");
  if (fs.existsSync(utilsAbs)) {
    files["/lib/utils.ts"] = stripUseClient(fs.readFileSync(utilsAbs, "utf8"));
  }

  for (const id of wanted) {
    const name = `${id}.tsx`;
    const abs = path.join(root, name);
    if (!fs.existsSync(abs)) continue;
    const dest = `/components/ui/${name}`;
    files[dest] = rewriteAtImports(stripUseClient(fs.readFileSync(abs, "utf8")), dest);
  }
  return files;
}
