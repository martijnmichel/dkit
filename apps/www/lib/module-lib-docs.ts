import fs from "node:fs";
import path from "node:path";
import { getRegistry, registryRoot } from "@/lib/registry";

export type LibExportDoc = {
  name: string;
  kind: "function" | "const";
  async: boolean;
  /** Pretty TypeScript signature (may be multi-line). */
  signature: string;
  description?: string;
  deprecated?: boolean;
};

export type ModuleLibDoc = {
  moduleId: string;
  title: string;
  installPath: string;
  exports: LibExportDoc[];
};

/** Pull JSDoc immediately above an export (from original source). */
function jsdocBefore(source: string, index: number): {
  summary?: string;
  deprecated: boolean;
} {
  const before = source.slice(0, index);
  const start = before.lastIndexOf("/**");
  if (start < 0) return { deprecated: false };
  // Only the final comment block — must be adjacent to the export (no code after).
  const chunk = before.slice(start);
  const match = chunk.match(/^\/\*\*([\s\S]*?)\*\/\s*$/);
  if (!match) return { deprecated: false };
  const lines = match[1]!
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, "").trim())
    .filter(Boolean);
  const deprecated = lines.some((l) =>
    l.toLowerCase().startsWith("@deprecated"),
  );
  const summary = lines.find((l) => !l.startsWith("@"));
  return { summary, deprecated };
}

/**
 * Extract the export header through the param/return types, before the body `{`.
 * Formats as readable multi-line TypeScript.
 */
function formatFunctionSignature(
  source: string,
  index: number,
): string | null {
  const from = source.slice(index);
  if (!/^export\s+(async\s+)?function\s+/.test(from)) return null;

  let i = 0;
  // skip to first '(' of params
  const nameMatch = from.match(/^export\s+(async\s+)?function\s+[A-Za-z0-9_]+/);
  if (!nameMatch) return null;
  i = nameMatch[0].length;
  while (i < from.length && /\s/.test(from[i]!)) i++;
  if (from[i] !== "(") return null;

  // walk params with string/brace awareness
  let depthParen = 0;
  let depthBrace = 0;
  let depthAngle = 0;
  let inStr: string | null = null;
  for (; i < from.length; i++) {
    const ch = from[i]!;
    const prev = from[i - 1];
    if (inStr) {
      if (ch === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      continue;
    }
    if (ch === "(") depthParen++;
    else if (ch === ")") {
      depthParen--;
      if (depthParen === 0) {
        i++;
        break;
      }
    } else if (ch === "{") depthBrace++;
    else if (ch === "}") depthBrace--;
    else if (ch === "<") depthAngle++;
    else if (ch === ">" && depthAngle > 0) depthAngle--;
  }

  // optional return type until body `{` at depth 0
  while (i < from.length && /\s/.test(from[i]!)) i++;
  if (from[i] === ":") {
    i++;
    depthAngle = 0;
    depthBrace = 0;
    depthParen = 0;
    inStr = null;
    for (; i < from.length; i++) {
      const ch = from[i]!;
      const prev = from[i - 1];
      if (inStr) {
        if (ch === inStr && prev !== "\\") inStr = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = ch;
        continue;
      }
      if (ch === "<") depthAngle++;
      else if (ch === ">" && depthAngle > 0) depthAngle--;
      else if (ch === "(") depthParen++;
      else if (ch === ")") depthParen--;
      else if (ch === "{" && depthAngle === 0 && depthParen === 0) break;
    }
  }

  let header = from.slice(0, i).replace(/^export\s+/, "").trim();
  // Pretty-print: break after `(`, before `)`, and after commas at top-level params
  header = prettyParams(header);
  return header;
}

function prettyParams(sig: string): string {
  const open = sig.indexOf("(");
  const close = sig.lastIndexOf(")");
  if (open < 0 || close < 0 || close <= open) return sig.replace(/\s+/g, " ");

  const prefix = sig.slice(0, open + 1);
  const paramsRaw = sig.slice(open + 1, close);
  const suffix = sig.slice(close);

  const params = splitTopLevelArgs(paramsRaw)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (params.length === 0) {
    return `${prefix.replace(/\s+/g, " ")}${suffix.replace(/\s+/g, " ")}`.trim();
  }
  if (params.length === 1 && params[0]!.length < 48) {
    return `${prefix.replace(/\s+/g, " ")}${params[0]}${suffix.replace(/\s+/g, " ")}`.trim();
  }

  return `${prefix.trimEnd()}\n  ${params.join(",\n  ")}\n${suffix.trim()}`.replace(
    /\n\s*\):/,
    "\n):",
  );
}

function splitTopLevelArgs(raw: string): string[] {
  const out: string[] = [];
  let cur = "";
  let depthParen = 0;
  let depthBrace = 0;
  let depthAngle = 0;
  let inStr: string | null = null;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]!;
    const prev = raw[i - 1];
    if (inStr) {
      cur += ch;
      if (ch === inStr && prev !== "\\") inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      cur += ch;
      continue;
    }
    if (ch === "(") depthParen++;
    else if (ch === ")") depthParen--;
    else if (ch === "{") depthBrace++;
    else if (ch === "}") depthBrace--;
    else if (ch === "<") depthAngle++;
    else if (ch === ">" && depthAngle > 0) depthAngle--;
    if (
      ch === "," &&
      depthParen === 0 &&
      depthBrace === 0 &&
      depthAngle === 0
    ) {
      out.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

function parseLibExports(source: string): LibExportDoc[] {
  const out: LibExportDoc[] = [];
  const seen = new Set<string>();

  const fnRe =
    /export\s+(async\s+)?function\s+([A-Za-z0-9_]+)/g;
  let m: RegExpExecArray | null;
  while ((m = fnRe.exec(source))) {
    const isAsync = Boolean(m[1]);
    const name = m[2]!;
    if (seen.has(name)) continue;
    seen.add(name);
    const { summary, deprecated } = jsdocBefore(source, m.index);
    const signature =
      formatFunctionSignature(source, m.index) ??
      `${isAsync ? "async " : ""}function ${name}()`;
    out.push({
      name,
      kind: "function",
      async: isAsync,
      signature,
      description: summary,
      deprecated,
    });
  }

  const constRe = /export\s+const\s+([A-Za-z0-9_]+)\s*=/g;
  while ((m = constRe.exec(source))) {
    const name = m[1]!;
    if (seen.has(name)) continue;
    seen.add(name);
    const { summary, deprecated } = jsdocBefore(source, m.index);
    out.push({
      name,
      kind: "const",
      async: false,
      signature: `const ${name}`,
      description: summary,
      deprecated,
    });
  }

  return out.sort((a, b) => {
    if (a.deprecated !== b.deprecated) return a.deprecated ? 1 : -1;
    return a.name.localeCompare(b.name);
  });
}

export function getModuleLibDoc(moduleId: string): ModuleLibDoc | null {
  const item = getRegistry().items.find(
    (i) => i.type === "dkit:module" && i.id === moduleId,
  );
  if (!item) return null;
  const libPath = path.join(registryRoot(), item.path, "lib.ts");
  if (!fs.existsSync(libPath)) return null;
  const source = fs.readFileSync(libPath, "utf8");
  return {
    moduleId,
    title: item.title,
    installPath: `lib/dkit/${moduleId}.ts`,
    exports: parseLibExports(source),
  };
}

export function listModuleLibDocs(): ModuleLibDoc[] {
  return getRegistry()
    .items.filter((i) => i.type === "dkit:module")
    .map((i) => getModuleLibDoc(i.id))
    .filter((d): d is ModuleLibDoc => Boolean(d?.exports.length));
}

/**
 * Docs list: real functions only (skip deprecated const aliases like getPosts).
 */
export function primaryServiceExports(doc: ModuleLibDoc): LibExportDoc[] {
  return doc.exports.filter((e) => e.kind === "function" && !e.deprecated);
}
