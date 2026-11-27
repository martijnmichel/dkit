import path from "node:path";

/**
 * Rewrite `@/…` to relative imports for the Sandpack file that contains them.
 * Absolute `/components/…` fails Vite import-analysis in Nodebox; bare `@/`
 * aliases also flake under concurrent boots.
 */
export function rewriteAtImports(
  source: string,
  filePath: string,
): string {
  const fromDir = path.posix.dirname(
    filePath.startsWith("/") ? filePath : `/${filePath}`,
  );

  return source.replace(
    /(from\s+["'])@\/([^"']+)(["'])/g,
    (_full, lead: string, importPath: string, quote: string) => {
      const target = `/${importPath.replace(/\\/g, "/")}`;
      let rel = path.posix.relative(fromDir, target);
      if (!rel.startsWith(".")) rel = `./${rel}`;
      return `${lead}${rel}${quote}`;
    },
  );
}
