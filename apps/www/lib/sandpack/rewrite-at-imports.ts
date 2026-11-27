/**
 * Sandpack/Nodebox often mishandles Vite `@/` aliases under load — imports
 * like `@/components/ui/card` then resolve as bare `card` and the bundler
 * returns HTML (MIME error). Rewrite to absolute sandpack paths instead.
 */
export function rewriteAtImports(
  source: string,
  root: "/" | "/src/" = "/",
): string {
  const prefix = root.endsWith("/") ? root : `${root}/`;
  return source
    .replace(/(from\s+["'])@\//g, `$1${prefix}`)
    .replace(/(import\s+["'])@\//g, `$1${prefix}`);
}
