/** Directory config — logical collection names (no install prefix). */
export const collectionPrefix = "" as const;

export const collections = {
  site: "site",
  pages: "pages",
  blog: "blog",
  authors: "authors",
  categories: "categories",
  posts: "posts",
  posts_categories: "posts_categories",
  contact: "contact",
  form_submissions: "form_submissions",
  page_builder: "page_builder",
  builder_pages: "builder_pages",
  block_hero: "block_hero",
  block_richtext: "block_richtext",
  block_cta: "block_cta",
  builder_pages_blocks: "builder_pages_blocks",
  site_settings: "site_settings",
  nav_menus: "nav_menus",
  nav_items: "nav_items",
} as const;

export type DkitCollection = keyof typeof collections;

export const modules = {
  blog: { basePath: "/docs/modules/blog/demo", blocks: undefined },
  pages: { basePath: "/docs/modules/pages/demo", blocks: undefined },
  "contact-form": { basePath: "/contact", blocks: undefined },
  "page-builder": { basePath: "/composed", blocks: undefined },
  settings: { basePath: undefined, blocks: undefined },
  navigation: { basePath: undefined, blocks: undefined },
} as const;

export function collection(name: DkitCollection): string {
  return collections[name];
}

export function moduleBasePath(moduleId: string, fallback = "/"): string {
  const mod = (modules as Record<string, { basePath?: string }>)[moduleId];
  return mod?.basePath ?? fallback;
}

export function joinModulePath(basePath: string, ...parts: string[]): string {
  const base = !basePath || basePath === "/" ? "" : basePath.replace(/\/$/, "");
  const rest = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
  const joined = `${base}/${rest}`.replace(/\/{2,}/g, "/");
  return joined.startsWith("/") ? joined : `/${joined}`;
}
