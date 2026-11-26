import fs from "node:fs";
import path from "node:path";
import type { Framework } from "@dkit/shared";

/** Turn `/blog` into filesystem segments under app/ or pages/ */
export function basePathToFsSegments(basePath: string): string[] {
  return basePath
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function routeConflictPaths(
  projectRoot: string,
  framework: Framework,
  basePath: string,
): string[] {
  const segments = basePathToFsSegments(basePath);
  if (segments.length === 0) return [];

  const candidates: string[] = [];
  if (framework === "next") {
    candidates.push(
      path.join(projectRoot, "app", ...segments),
      path.join(projectRoot, "src", "app", ...segments),
      path.join(projectRoot, "pages", ...segments),
      path.join(projectRoot, "src", "pages", ...segments),
    );
  } else {
    candidates.push(
      path.join(projectRoot, "pages", ...segments),
      path.join(projectRoot, "app", "pages", ...segments),
    );
  }

  return candidates.filter((p) => fs.existsSync(p));
}

export function normalizeBasePath(input: string): string {
  let v = input.trim() || "/";
  if (!v.startsWith("/")) v = `/${v}`;
  if (v.length > 1 && v.endsWith("/")) v = v.slice(0, -1);
  return v;
}

/** Suggest an alternate path when preferred is taken */
export function suggestAlternateBasePath(
  projectRoot: string,
  framework: Framework,
  preferred: string,
): string {
  const base = normalizeBasePath(preferred);
  if (routeConflictPaths(projectRoot, framework, base).length === 0) {
    return base;
  }
  const alts = [
    `${base}-dkit`,
    `/dkit${base === "/" ? "-content" : base}`,
    `${base}-content`,
  ];
  for (const alt of alts) {
    const n = normalizeBasePath(alt);
    if (routeConflictPaths(projectRoot, framework, n).length === 0) return n;
  }
  return normalizeBasePath(`${base}-${Date.now().toString(36).slice(-4)}`);
}
