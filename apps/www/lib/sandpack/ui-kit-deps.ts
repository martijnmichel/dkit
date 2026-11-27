/** Base npm deps used when a Sandpack preview includes shadcn UI sources. */
const SHADCN_BASE: Record<string, string> = {
  "class-variance-authority": "^0.7.1",
  clsx: "^2.1.1",
  "tailwind-merge": "^3.7.1",
};

/**
 * Derive Sandpack dependencies from the files that will actually run.
 * Avoids installing `@base-ui/react` for blocks that don't use UI primitives.
 */
export function sandpackDepsForFiles(
  files: Record<string, string>,
  opts: { framework: "next" | "nuxt"; kit: "shadcn" | "minimal" },
): Record<string, string> {
  if (opts.kit !== "shadcn") return {};

  const joined = Object.values(files).join("\n");
  const usesUi = /@\/components\/ui\//.test(joined) || /components\/ui\//.test(
    Object.keys(files).join("\n"),
  );
  if (!usesUi && !/@base-ui\/react|lucide-react|class-variance-authority/.test(joined)) {
    return {};
  }

  if (opts.framework === "nuxt") {
    return { ...SHADCN_BASE };
  }

  const deps: Record<string, string> = { ...SHADCN_BASE };
  if (/@base-ui\/react/.test(joined)) {
    deps["@base-ui/react"] = "^1.9.0";
  }
  if (/lucide-react/.test(joined)) {
    deps["lucide-react"] = "^0.511.0";
  }
  return deps;
}

/** @deprecated Prefer sandpackDepsForFiles — kept for older call sites. */
export const SANDPACK_SHADCN_DEPENDENCIES: Record<string, string> = {
  ...SHADCN_BASE,
  "@base-ui/react": "^1.9.0",
  "lucide-react": "^0.511.0",
};

export const SANDPACK_SHADCN_VUE_DEPENDENCIES: Record<string, string> = {
  ...SHADCN_BASE,
};
