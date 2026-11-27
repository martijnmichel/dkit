/**
 * Registry blocks are authored with Radix `asChild`.
 * Sandpack shadcn kit is base-nova (Base UI) — rewrite like the CLI does.
 */

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

/** Rewrite `<Button asChild><a …>…</a></Button>` → Base UI `render` + `nativeButton`. */
export function rewriteAsChildToRender(source: string): string {
  const openRe = /<([A-Z][A-Za-z0-9]*)\b/g;
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
    const renderEl = `<${child.tag}${child.attrs ? ` ${child.attrs}` : ""} />`;
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
