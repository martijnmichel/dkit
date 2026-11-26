import fs from "node:fs";
import path from "node:path";
import { registryRoot } from "@/lib/registry";
import type { PreviewFramework, PreviewUiKit } from "@/lib/preview-prefs";
import { SANDPACK_THEME_CSS } from "@/lib/sandpack/theme-css";
import type {
  BlockSandpackProject,
  KitVariantFiles,
  SandpackFiles,
} from "@/lib/sandpack/types";
import {
  buildBlogMockSource,
  buildConfigMockSource,
  buildContactMockSource,
  buildPageBuilderMockSource,
  buildPagesMockSource,
} from "@/lib/sandpack/mocks";

export type {
  BlockSandpackProject,
  KitVariantFiles,
  SandpackFiles,
} from "@/lib/sandpack/types";
export { resolveProjectUiKit } from "@/lib/sandpack/types";

const BLOCK_META: Record<
  string,
  {
    module: "blog" | "pages" | "contact-form" | "page-builder";
    uiKits: PreviewUiKit[];
    nextFile?: string;
    nuxtFile?: string;
    exportName?: string;
    props?: Record<string, string>;
  }
> = {
  "blog-list": {
    module: "blog",
    uiKits: ["shadcn", "minimal"],
    nextFile: "blog-list.tsx",
    nuxtFile: "BlogList.vue",
    exportName: "BlogList",
  },
  "blog-list-cards": {
    module: "blog",
    uiKits: ["shadcn", "minimal"],
    nextFile: "blog-list-cards.tsx",
    nuxtFile: "BlogListCards.vue",
    exportName: "BlogListCards",
  },
  "blog-detail": {
    module: "blog",
    uiKits: ["shadcn", "minimal"],
    nextFile: "blog-detail.tsx",
    nuxtFile: "BlogDetail.vue",
    exportName: "BlogDetail",
    props: { slug: '"sample-getting-started"' },
  },
  "page-detail": {
    module: "pages",
    uiKits: ["shadcn", "minimal"],
    nextFile: "page-detail.tsx",
    nuxtFile: "PageDetail.vue",
    exportName: "PageDetail",
    props: { slug: '"about"' },
  },
  "contact-form-ui": {
    module: "contact-form",
    uiKits: ["shadcn", "minimal"],
    nextFile: "contact-form.tsx",
    exportName: "ContactForm",
  },
  "page-renderer": {
    module: "page-builder",
    uiKits: ["shadcn", "minimal"],
    nextFile: "page-renderer.tsx",
    exportName: "PageRenderer",
    props: { slug: '"sample"' },
  },
};

function readUiFile(
  blockId: string,
  kit: PreviewUiKit,
  framework: "next" | "nuxt",
  fileName: string,
): string | null {
  const abs = path.join(
    registryRoot(),
    "blocks",
    blockId,
    "ui",
    kit,
    framework,
    fileName,
  );
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8");
}

function rewriteImports(source: string): string {
  return source.replace(/^["']use client["'];?\s*/m, "");
}

function sharedLibFiles(
  moduleId: string,
  prefix: "/lib" | "/src/lib",
): SandpackFiles {
  const files: SandpackFiles = {
    [`${prefix}/dkit/config.ts`]: buildConfigMockSource(),
  };
  if (moduleId === "blog") {
    files[`${prefix}/dkit/blog.ts`] = buildBlogMockSource();
  }
  if (moduleId === "pages") {
    files[`${prefix}/dkit/pages.ts`] = buildPagesMockSource();
  }
  if (moduleId === "contact-form") {
    files[`${prefix}/dkit/contact-form.ts`] = buildContactMockSource();
  }
  if (moduleId === "page-builder") {
    files[`${prefix}/dkit/page-builder.ts`] = buildPageBuilderMockSource();
  }
  return files;
}

function ensureVueAutoImports(vueSource: string): string {
  let src = vueSource;
  const injections: string[] = [];

  if (src.includes("useAsyncData") && !src.includes("nuxt-shims")) {
    injections.push("import { useAsyncData } from '@/nuxt-shims'");
  }
  if (/\bcomputed\b/.test(src) && !/import\s*{[^}]*\bcomputed\b/.test(src)) {
    injections.push("import { computed } from 'vue'");
  }

  if (!injections.length) return src;
  return src.replace(/(<script setup[^>]*>)/, `$1\n${injections.join("\n")}\n`);
}

function buildNextProject(
  blockId: string,
  kit: PreviewUiKit,
  meta: (typeof BLOCK_META)[string],
): SandpackFiles | null {
  if (!meta.nextFile || !meta.exportName) return null;
  const raw = readUiFile(blockId, kit, "next", meta.nextFile);
  if (!raw) return null;

  const component = rewriteImports(raw);
  const propEntries = meta.props ? Object.entries(meta.props) : [];
  const propsJsx = propEntries.map(([k, v]) => `${k}={${v}}`).join(" ");
  const propsObj = propEntries.map(([k, v]) => `${k}: ${v}`).join(", ");
  const isClientOnly = blockId === "contact-form-ui";

  const appAsync = `import { useEffect, useState, type ReactNode } from "react";
import { ${meta.exportName} } from "./components/Block";
import "./styles.css";

export default function App() {
  const [ui, setUi] = useState<ReactNode>(null);
  useEffect(() => {
    void Promise.resolve(${meta.exportName}({ ${propsObj} } as any)).then(setUi);
  }, []);
  return <div>{ui}</div>;
}
`;

  const appClient = `import { ${meta.exportName} } from "./components/Block";
import "./styles.css";

export default function App() {
  return (
    <div className="px-6 py-12">
      <${meta.exportName} ${propsJsx} />
    </div>
  );
}
`;

  return {
    ...sharedLibFiles(meta.module, "/lib"),
    "/components/Block.tsx": component,
    "/App.tsx": isClientOnly ? appClient : appAsync,
    "/styles.css": SANDPACK_THEME_CSS,
    "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <title>${blockId}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>
`,
    "/vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
`,
  };
}

function buildNuxtProject(
  blockId: string,
  kit: PreviewUiKit,
  meta: (typeof BLOCK_META)[string],
): SandpackFiles | null {
  if (!meta.nuxtFile) return null;
  const raw = readUiFile(blockId, kit, "nuxt", meta.nuxtFile);
  if (!raw) return null;

  const component = ensureVueAutoImports(rewriteImports(raw));
  const propsLine = meta.props
    ? Object.entries(meta.props)
        .map(([k, v]) => `${k}=${v}`)
        .join(" ")
    : "";

  return {
    ...sharedLibFiles(meta.module, "/src/lib"),
    "/src/components/Block.vue": component,
    "/src/nuxt-shims.ts": `import { ref, type Ref } from "vue";

export async function useAsyncData<T>(
  _key: string,
  handler: () => Promise<T> | T,
): Promise<{ data: Ref<T | null> }> {
  const data = ref(null) as Ref<T | null>;
  data.value = ((await handler()) as T) ?? null;
  return { data };
}
`,
    "/src/components/NuxtLink.vue": `<script setup lang="ts">
defineProps<{ to: string }>();
</script>
<template>
  <a :href="to"><slot /></a>
</template>
`,
    "/src/App.vue": `<script setup lang="ts">
import Block from "./components/Block.vue";
</script>
<template>
  <Block ${propsLine} />
</template>
`,
    "/src/styles.css": SANDPACK_THEME_CSS,
    "/src/main.ts": `import { createApp } from "vue";
import App from "./App.vue";
import NuxtLink from "./components/NuxtLink.vue";
import "./styles.css";

const app = createApp(App);
app.component("NuxtLink", NuxtLink);
app.mount("#app");
`,
    "/index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <title>${blockId}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
    "/vite.config.ts": `import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
`,
  };
}

export function buildBlockSandpackProject(
  blockId: string,
  info?: { title?: string; description?: string },
): BlockSandpackProject | null {
  const meta = BLOCK_META[blockId];
  if (!meta) return null;

  const variants: BlockSandpackProject["variants"] = {};
  const frameworks = new Set<PreviewFramework>();

  for (const kit of meta.uiKits) {
    const next = buildNextProject(blockId, kit, meta);
    const nuxt = buildNuxtProject(blockId, kit, meta);
    if (!next && !nuxt) continue;
    variants[kit] = { next, nuxt };
    if (next) frameworks.add("next");
    if (nuxt) frameworks.add("nuxt");
  }

  if (!Object.keys(variants).length) return null;

  return {
    blockId,
    title: info?.title ?? blockId,
    description: info?.description,
    frameworks: [...frameworks],
    uiKits: meta.uiKits,
    variants,
  };
}

export function buildModuleSandpackProjects(
  blocks: Array<{ id: string; title?: string; description?: string }>,
): BlockSandpackProject[] {
  return blocks
    .map((b) =>
      buildBlockSandpackProject(b.id, {
        title: b.title,
        description: b.description,
      }),
    )
    .filter((p): p is BlockSandpackProject => p !== null);
}
