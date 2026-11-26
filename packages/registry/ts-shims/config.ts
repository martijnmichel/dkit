/** Authoring shim — installed apps use generated lib/dkit/config.ts */
export const collections = {
  posts: "posts",
  authors: "authors",
  categories: "categories",
  posts_categories: "posts_categories",
  pages: "pages",
  form_submissions: "form_submissions",
  builder_pages: "builder_pages",
  block_hero: "block_hero",
  block_richtext: "block_richtext",
  block_cta: "block_cta",
  builder_pages_blocks: "builder_pages_blocks",
} as const;

export function moduleBasePath(_moduleId: string, fallback = "/"): string {
  return fallback;
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
