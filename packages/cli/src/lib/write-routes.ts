import fs from "node:fs";
import path from "node:path";
import type { DkitProjectConfig, Framework } from "@dkit/shared";
import { basePathToFsSegments } from "./routes.js";

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
): { written?: string; skipped?: string; note?: string } {
  const framework = config.framework;
  const app = resolveAppRoot(projectRoot, framework);
  if (!app) {
    return {
      note: `No app/ or pages/ router found — add a page at ${basePath} that imports Form from ${config.aliases.components}/${moduleId}`,
    };
  }

  const segments = basePathToFsSegments(basePath);
  const componentsAlias = config.aliases.components.replace(/\/$/, "");
  const exportId = exportSafe(moduleId);
  const heading = formPageHeading(moduleId);

  if (framework === "next" && app.kind === "app") {
    const dir = path.join(app.root, ...segments);
    const file = path.join(dir, "page.tsx");
    if (fs.existsSync(file) && !overwrite) {
      return { skipped: file };
    }
    fs.mkdirSync(dir, { recursive: true });
    const contents = `import { Form, installed } from "${componentsAlias}/${moduleId}";

export default function Dkit${exportId}Page() {
  if (!installed) {
    return <p>Form is not installed yet.</p>;
  }
  return (
    <main className="container py-16">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">${heading}</h1>
      <Form />
    </main>
  );
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
    const contents = `<script setup lang="ts">
import { Form, installed } from "${componentsAlias}/${moduleId}"
</script>

<template>
  <main class="container py-16">
    <p v-if="!installed">Form is not installed yet.</p>
    <template v-else>
      <h1 class="mb-8 text-2xl font-semibold tracking-tight">${heading}</h1>
      <Form />
    </template>
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
  const contents = `import { Form, installed } from "${componentsAlias}/${moduleId}";

export default function Dkit${exportId}Page() {
  if (!installed) {
    return <p>Form is not installed yet.</p>;
  }
  return (
    <main className="container py-16">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">${heading}</h1>
      <Form />
    </main>
  );
}
`;
  fs.writeFileSync(file, contents, "utf8");
  return { written: file, note: `URL: ${normalizeUrl(basePath)}` };
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
): { written?: string; skipped?: string; note?: string } {
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
    const contents = `import { Detail, installed } from "${componentsAlias}/${moduleId}";

export default async function Dkit${exportSafe(moduleId)}Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!installed) {
    return <p>Run <code>dkit add ${moduleId}</code> to install UI.</p>;
  }
  return <Detail slug={slug} />;
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
    const contents = `<script setup lang="ts">
const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))
</script>

<template>
  <!-- Wire your installed page-detail component here, e.g.: -->
  <!-- <PageDetail :slug="slug" /> -->
  <p>Page: {{ slug }}</p>
</template>
`;
    fs.writeFileSync(file, contents, "utf8");
  } else {
    const componentsAlias = config.aliases.components.replace(/\/$/, "");
    const contents = `import { Detail, installed } from "${componentsAlias}/${moduleId}";

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
