import fs from "node:fs";
import path from "node:path";
import type {
  BlockRouteKind,
  DkitProjectConfig,
  Framework,
  RegistryIndex,
} from "@dkit/shared";
import { slotExportAlias } from "./block-paths.js";
import { basePathToFsSegments } from "./routes.js";

/** Selected block ids that declare a `route` (need a module basePath). */
export function blockIdsWithRoutes(
  blockIds: string[],
  index: RegistryIndex,
): string[] {
  return blockIds.filter((id) => {
    const item = index.items.find((i) => i.id === id);
    return item?.type === "dkit:block" && Boolean(item.route?.kind);
  });
}

/** Map route kinds → barrel export name from installed blocks. */
export function routeExportsFromBlocks(
  blocks: Array<{
    manifest: { route?: { kind: BlockRouteKind }; slot?: string };
  }>,
): Partial<Record<BlockRouteKind, string>> {
  const out: Partial<Record<BlockRouteKind, string>> = {};
  for (const b of blocks) {
    const kind = b.manifest.route?.kind;
    if (!kind) continue;
    out[kind] = b.manifest.slot
      ? slotExportAlias(b.manifest.slot)
      : kind === "index"
        ? "List"
        : kind === "static"
          ? "Form"
          : "Detail";
  }
  return out;
}

/** `/` + `about` → `/about`; `/pages` + `about` → `/pages/about` */
export function joinModulePath(
  basePath: string,
  ...parts: string[]
): string {
  const base = !basePath || basePath === "/" ? "" : basePath.replace(/\/$/, "");
  const rest = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
  const joined = `${base}/${rest}`.replace(/\/{2,}/g, "/");
  return joined.startsWith("/") ? joined : `/${joined}`;
}

function resolveAppRoot(
  projectRoot: string,
  framework: Framework,
): { kind: "app" | "pages"; root: string } | null {
  if (framework === "next") {
    for (const rel of ["app", "src/app"]) {
      const abs = path.join(projectRoot, rel);
      if (fs.existsSync(abs)) return { kind: "app", root: abs };
    }
    for (const rel of ["pages", "src/pages"]) {
      const abs = path.join(projectRoot, rel);
      if (fs.existsSync(abs)) return { kind: "pages", root: abs };
    }
    return null;
  }
  for (const rel of ["pages", "app/pages", "src/pages"]) {
    const abs = path.join(projectRoot, rel);
    if (fs.existsSync(abs)) return { kind: "pages", root: abs };
  }
  return null;
}

type RouteWriteResult = { written?: string; skipped?: string; note?: string };

function writeStaticBasePathPage(opts: {
  projectRoot: string;
  config: DkitProjectConfig;
  moduleId: string;
  basePath: string;
  overwrite: boolean;
  /** Barrel export to render (List, Form, …) */
  exportName: string;
  /** Optional page heading for form-style pages */
  heading?: string;
  missingNote: string;
}): RouteWriteResult {
  const { config, moduleId, basePath, overwrite, exportName, heading } = opts;
  const framework = config.framework;
  const app = resolveAppRoot(opts.projectRoot, framework);
  if (!app) {
    return {
      note: `No app/ or pages/ router found — add a page at ${basePath} that imports ${exportName} from ${config.aliases.components}/${moduleId}`,
    };
  }

  const segments = basePathToFsSegments(basePath);
  const componentsAlias = config.aliases.components.replace(/\/$/, "");
  const exportId = exportSafe(moduleId);
  const body =
    heading != null
      ? `  return (
    <main className="container py-16">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">${heading}</h1>
      <${exportName} />
    </main>
  );`
      : `  return <${exportName} />;`;

  if (framework === "next" && app.kind === "app") {
    const dir = path.join(app.root, ...segments);
    const file = path.join(dir, "page.tsx");
    if (fs.existsSync(file) && !overwrite) {
      return { skipped: file };
    }
    fs.mkdirSync(dir, { recursive: true });
    const contents = `import { ${exportName}, installed } from "${componentsAlias}/${moduleId}";

export default function Dkit${exportId}Page() {
  if (!installed) {
    return <p>${opts.missingNote}</p>;
  }
${body}
}
`;
    fs.writeFileSync(file, contents, "utf8");
    return {
      written: file,
      note: `URL: ${normalizeUrl(basePath)}`,
    };
  }

  if (framework === "nuxt") {
    const file = path.join(app.root, ...segments, "index.vue");
    if (fs.existsSync(file) && !overwrite) {
      return { skipped: file };
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const templateBody =
      heading != null
        ? `    <template v-else>
      <h1 class="mb-8 text-2xl font-semibold tracking-tight">${heading}</h1>
      <${exportName} />
    </template>`
        : `    <${exportName} v-else />`;
    const contents = `<script setup lang="ts">
import { ${exportName}, installed } from "${componentsAlias}/${moduleId}"
</script>

<template>
  <main class="container py-16">
    <p v-if="!installed">${opts.missingNote}</p>
${templateBody}
  </main>
</template>
`;
    fs.writeFileSync(file, contents, "utf8");
    return { written: file, note: `URL: ${normalizeUrl(basePath)}` };
  }

  // Next pages router
  const file = path.join(app.root, ...segments, "index.tsx");
  if (fs.existsSync(file) && !overwrite) {
    return { skipped: file };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const contents = `import { ${exportName}, installed } from "${componentsAlias}/${moduleId}";

export default function Dkit${exportId}Page() {
  if (!installed) {
    return <p>${opts.missingNote}</p>;
  }
${body}
}
`;
  fs.writeFileSync(file, contents, "utf8");
  return { written: file, note: `URL: ${normalizeUrl(basePath)}` };
}

/**
 * Scaffold the module basePath index page (list slot).
 * - base `/blog` → `app/blog/page.tsx`
 */
export function writeModuleIndexRoute(
  projectRoot: string,
  config: DkitProjectConfig,
  moduleId: string,
  basePath: string,
  overwrite: boolean,
  exportName = "List",
): RouteWriteResult {
  return writeStaticBasePathPage({
    projectRoot,
    config,
    moduleId,
    basePath,
    overwrite,
    exportName,
    missingNote: `${exportName} is not installed yet.`,
  });
}

/**
 * Scaffold a static page at the module basePath that renders the Form slot.
 * - base `/contact` → `app/contact/page.tsx` (or `pages/contact/index.vue`)
 */
export function writeModuleFormRoute(
  projectRoot: string,
  config: DkitProjectConfig,
  moduleId: string,
  basePath: string,
  overwrite: boolean,
  exportName = "Form",
): RouteWriteResult {
  return writeStaticBasePathPage({
    projectRoot,
    config,
    moduleId,
    basePath,
    overwrite,
    exportName,
    heading: formPageHeading(moduleId),
    missingNote: `${exportName} is not installed yet.`,
  });
}

function normalizeUrl(basePath: string): string {
  if (!basePath || basePath === "/") return "/";
  return basePath.startsWith("/") ? basePath : `/${basePath}`;
}

/**
 * Scaffold a dynamic `[slug]` route under the module basePath.
 * - base `/` → `app/[slug]/page.tsx` (or `pages/[slug].vue`)
 * - base `/pages` → `app/pages/[slug]/page.tsx`
 */
export function writeModuleSlugRoute(
  projectRoot: string,
  config: DkitProjectConfig,
  moduleId: string,
  basePath: string,
  overwrite: boolean,
  exportName = "Detail",
): RouteWriteResult {
  const framework = config.framework;
  const app = resolveAppRoot(projectRoot, framework);
  if (!app) {
    return {
      note: `No app/ or pages/ router found — create a [slug] route under ${joinModulePath(basePath, ":slug")}`,
    };
  }

  const segments = [...basePathToFsSegments(basePath), "[slug]"];

  if (framework === "next" && app.kind === "app") {
    const dir = path.join(app.root, ...segments);
    const file = path.join(dir, "page.tsx");
    if (fs.existsSync(file) && !overwrite) {
      return { skipped: file };
    }
    fs.mkdirSync(dir, { recursive: true });
    const componentsAlias = config.aliases.components.replace(/\/$/, "");
    const contents = `import { ${exportName}, installed } from "${componentsAlias}/${moduleId}";

export default async function Dkit${exportSafe(moduleId)}Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!installed) {
    return <p>Run <code>dkit add ${moduleId}</code> to install UI.</p>;
  }
  return <${exportName} slug={slug} />;
}
`;
    fs.writeFileSync(file, contents, "utf8");
    return {
      written: file,
      note:
        basePath === "/"
          ? `URLs: /{slug}  (root catch-all — avoid colliding top-level routes)`
          : `URLs: ${joinModulePath(basePath, "{slug}")}`,
    };
  }

  // Next pages router or Nuxt
  const file =
    framework === "nuxt"
      ? path.join(app.root, ...segments) + ".vue"
      : path.join(app.root, ...segments) + ".tsx";

  if (fs.existsSync(file) && !overwrite) {
    return { skipped: file };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });

  if (framework === "nuxt") {
    const componentsAlias = config.aliases.components.replace(/\/$/, "");
    const contents = `<script setup lang="ts">
import { ${exportName}, installed } from "${componentsAlias}/${moduleId}"
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
</script>

<template>
  <p v-if="!installed">Run <code>dkit add ${moduleId}</code> to install UI.</p>
  <${exportName} v-else :slug="slug" />
</template>
`;
    fs.writeFileSync(file, contents, "utf8");
  } else {
    const componentsAlias = config.aliases.components.replace(/\/$/, "");
    const contents = `import { ${exportName}, installed } from "${componentsAlias}/${moduleId}";

export default function Dkit${exportSafe(moduleId)}Page() {
  // pages router — prefer app/ router for async Server Components
  return installed ? null : <p>Run dkit add ${moduleId}</p>;
}
`;
    fs.writeFileSync(file, contents, "utf8");
  }

  return {
    written: file,
    note:
      basePath === "/"
        ? `URLs: /{slug}`
        : `URLs: ${joinModulePath(basePath, "{slug}")}`,
  };
}

function exportSafe(moduleId: string): string {
  return moduleId
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

function humanizeModuleId(moduleId: string): string {
  return moduleId
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/** contact-form → Contact (page title for visitors). */
function formPageHeading(moduleId: string): string {
  return humanizeModuleId(moduleId).replace(/\s+Form$/i, "") || "Contact";
}
