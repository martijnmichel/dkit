import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { Framework } from "@dkit/shared";

export type ShadcnPrimitiveBase = "radix" | "base";

function uiDirCandidates(projectRoot: string): string[] {
  return [
    path.join(projectRoot, "components", "ui"),
    path.join(projectRoot, "src", "components", "ui"),
  ];
}

export function hasShadcnConfig(projectRoot: string): boolean {
  return fs.existsSync(path.join(projectRoot, "components.json"));
}

export function readShadcnComponentsJson(
  projectRoot: string,
): { style?: string } | null {
  const file = path.join(projectRoot, "components.json");
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as { style?: string };
  } catch {
    return null;
  }
}

/**
 * Map components.json `style` → composition API.
 * - `base-*` (e.g. base-nova) → Base UI (`render` / `nativeButton`)
 * - `radix-*`, `new-york`, `default`, … → Radix (`asChild`)
 */
export function detectShadcnPrimitiveBase(
  projectRoot: string,
): ShadcnPrimitiveBase {
  const style = readShadcnComponentsJson(projectRoot)?.style ?? "";
  if (style.startsWith("base-") || style === "base") return "base";
  return "radix";
}

/**
 * Registry blocks are authored with Radix `asChild`.
 * For Base UI shadcn styles, rewrite to `render` + `nativeButton={false}`.
 */
export function adaptShadcnBlockSource(
  source: string,
  primitive: ShadcnPrimitiveBase,
): string {
  if (primitive !== "base") return source;
  return rewriteAsChildToRender(source);
}

function rewriteAsChildToRender(source: string): string {
  const openRe = /<(Button|Badge)\b/g;
  let out = "";
  let cursor = 0;
  let m: RegExpExecArray | null;

  while ((m = openRe.exec(source))) {
    const start = m.index;
    const comp = m[1]!;
    const afterName = start + m[0].length;
    const openEnd = findTagEnd(source, afterName);
    if (openEnd < 0) continue;

    const openInner = source.slice(afterName, openEnd);
    if (!/\basChild\b/.test(openInner)) continue;

    const selfClosing = source[openEnd - 1] === "/";
    if (selfClosing) continue;

    const props = openInner.replace(/\basChild\b/g, "").replace(/\s+/g, " ").trim();
    const afterOpen = openEnd + 1;
    const child = parseChildElement(source, afterOpen);
    if (!child) continue;

    const closeRe = new RegExp(`^\\s*<\\/${comp}>`);
    const closeMatch = source.slice(child.end).match(closeRe);
    if (!closeMatch) continue;
    const end = child.end + closeMatch[0].length;

    out += source.slice(cursor, start);
    const renderEl = child.selfClosing
      ? `<${child.tag}${child.attrs ? ` ${child.attrs}` : ""} />`
      : `<${child.tag}${child.attrs ? ` ${child.attrs}` : ""} />`;
    // Always self-close the render element; move text children onto Button/Badge.
    const native = comp === "Button" ? " nativeButton={false}" : "";
    const propsStr = props ? ` ${props}` : "";
    const body = child.children.trim();
    out += body
      ? `<${comp}${propsStr} render={${renderEl}}${native}>\n  ${body}\n</${comp}>`
      : `<${comp}${propsStr} render={${renderEl}}${native} />`;

    cursor = end;
    openRe.lastIndex = end;
  }

  out += source.slice(cursor);
  return out;
}

/** Index of `>` that ends the opening tag, respecting strings/braces. */
function findTagEnd(source: string, from: number): number {
  let depthBrace = 0;
  let inStr: string | null = null;
  for (let i = from; i < source.length; i++) {
    const ch = source[i]!;
    const prev = source[i - 1];
    if (inStr) {
      if (ch === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "{") depthBrace++;
    else if (ch === "}") depthBrace--;
    else if (ch === ">" && depthBrace === 0) return i;
  }
  return -1;
}

function parseChildElement(
  source: string,
  from: number,
): {
  tag: string;
  attrs: string;
  children: string;
  selfClosing: boolean;
  end: number;
} | null {
  const ws = source.slice(from).match(/^\s*/)?.[0].length ?? 0;
  const start = from + ws;
  if (source[start] !== "<") return null;
  const tagMatch = source.slice(start).match(/^<([A-Za-z][\w.]*)/);
  if (!tagMatch) return null;
  const tag = tagMatch[1]!;
  const afterName = start + tagMatch[0].length;
  const tagEnd = findTagEnd(source, afterName);
  if (tagEnd < 0) return null;
  const attrs = source.slice(afterName, tagEnd).replace(/\/\s*$/, "").trim();
  const selfClosing = source[tagEnd - 1] === "/";
  if (selfClosing) {
    return { tag, attrs, children: "", selfClosing: true, end: tagEnd + 1 };
  }
  const close = `</${tag}>`;
  const closeAt = source.indexOf(close, tagEnd + 1);
  if (closeAt < 0) return null;
  return {
    tag,
    attrs,
    children: source.slice(tagEnd + 1, closeAt),
    selfClosing: false,
    end: closeAt + close.length,
  };
}

export function resolveShadcnUiDir(projectRoot: string): string | null {
  for (const dir of uiDirCandidates(projectRoot)) {
    if (fs.existsSync(dir)) return dir;
  }
  if (hasShadcnConfig(projectRoot)) {
    try {
      const cfg = JSON.parse(
        fs.readFileSync(path.join(projectRoot, "components.json"), "utf8"),
      ) as { aliases?: { ui?: string } };
      const uiAlias = cfg.aliases?.ui ?? "@/components/ui";
      const rel = uiAlias.replace(/^@\//, "");
      const abs = path.join(projectRoot, rel);
      if (fs.existsSync(abs)) return abs;
      const srcAbs = path.join(projectRoot, "src", rel.replace(/^src\//, ""));
      if (fs.existsSync(srcAbs)) return srcAbs;
      return abs;
    } catch {
      /* fall through */
    }
  }
  return null;
}

export function listInstalledShadcnComponents(projectRoot: string): Set<string> {
  const dir = resolveShadcnUiDir(projectRoot);
  const found = new Set<string>();
  if (!dir || !fs.existsSync(dir)) return found;
  for (const name of fs.readdirSync(dir)) {
    const base = name.replace(/\.(tsx|ts|jsx|js|vue)$/, "");
    if (base && base !== "index") found.add(base);
  }
  return found;
}

function shadcnPackage(framework: Framework): string {
  return framework === "nuxt" ? "shadcn-vue@latest" : "shadcn@latest";
}

function runShadcn(
  projectRoot: string,
  framework: Framework,
  args: string[],
): { ok: boolean; command: string; status: number | null } {
  const pkg = shadcnPackage(framework);
  const fullArgs = [pkg, ...args];
  const command = `npx ${fullArgs.join(" ")}`;
  const res = spawnSync("npx", fullArgs, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false,
    env: process.env,
  });
  return { ok: res.status === 0, command, status: res.status };
}

/**
 * Ensure shadcn is initialized and required components exist.
 * Auto-runs `shadcn init --defaults` then `shadcn add … -y` when missing.
 * Leaves installed components as-is (Base UI or Radix per components.json).
 */
export function ensureShadcnComponents(
  projectRoot: string,
  framework: Framework,
  needed: string[],
  log: (message: string) => void,
): { ok: boolean; error?: string } {
  const unique = [...new Set(needed.map((c) => c.trim()).filter(Boolean))];
  if (!unique.length) return { ok: true };

  if (framework !== "next" && framework !== "nuxt") {
    return {
      ok: false,
      error: `shadcn auto-install is only supported for next/nuxt (got ${framework})`,
    };
  }

  if (!hasShadcnConfig(projectRoot)) {
    log(
      framework === "nuxt"
        ? "shadcn-vue not found — running init --defaults…"
        : "shadcn/ui not found — running init --defaults…",
    );
    const init = runShadcn(projectRoot, framework, [
      "init",
      "--defaults",
      "--force",
    ]);
    if (!init.ok) {
      return {
        ok: false,
        error: `${init.command} failed (exit ${init.status}). Install shadcn manually, then re-run.`,
      };
    }
  }

  const installed = listInstalledShadcnComponents(projectRoot);
  const missing = unique.filter((c) => !installed.has(c));
  if (!missing.length) {
    log(
      `shadcn components ok (${unique.join(", ")}; ${detectShadcnPrimitiveBase(projectRoot)})`,
    );
    return { ok: true };
  }

  log(`Adding shadcn components: ${missing.join(", ")}`);
  const add = runShadcn(projectRoot, framework, [
    "add",
    ...missing,
    "--yes",
    "--overwrite",
  ]);
  if (!add.ok) {
    return {
      ok: false,
      error: `${add.command} failed (exit ${add.status}). Add components manually, then re-run.`,
    };
  }

  const after = listInstalledShadcnComponents(projectRoot);
  const stillMissing = missing.filter((c) => !after.has(c));
  if (stillMissing.length) {
    return {
      ok: false,
      error: `shadcn add finished but still missing: ${stillMissing.join(", ")}`,
    };
  }

  return { ok: true };
}
