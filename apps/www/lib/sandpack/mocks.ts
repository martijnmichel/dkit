import { loadModuleSeed } from "@/lib/preview/seeds";

export function buildClientMockSource(): string {
  return `export type DirectusFileRef = { id: string };

export function getDirectus() {
  return null;
}

export function directusFileId(
  value: string | DirectusFileRef | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

export function directusAssetUrl(fileId: string): string | null {
  if (!fileId) return null;
  return \`https://picsum.photos/seed/\${encodeURIComponent(fileId)}/640/360\`;
}

export function createItem() {
  throw new Error("createItem is not available in preview");
}
export function readItem() {
  throw new Error("readItem is not available in preview");
}
export function readItems() {
  throw new Error("readItems is not available in preview");
}
export function readSingleton() {
  throw new Error("readSingleton is not available in preview");
}
`;
}

export function buildSettingsMockSource(): string {
  const seed = loadModuleSeed("settings");
  const json = JSON.stringify(seed ?? { items: {} });

  return `import { directusAssetUrl, directusFileId } from "@/lib/dkit/client";

const SEED = ${json} as const;

const SOCIAL_PLATFORM_LABELS: Record<string, string> = {
  x: "X",
  github: "GitHub",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  discord: "Discord",
  tiktok: "TikTok",
  threads: "Threads",
  email: "Email",
  website: "Website",
  other: "Link",
};

export function getSettings() {
  const row = (SEED.items?.site_settings ?? [])[0] ?? null;
  return row ? { ...row } : null;
}

export function getSetting(key: string) {
  return getSettings()?.[key];
}

export function isFeatureEnabled(flag: string) {
  return Boolean(getSettings()?.feature_flags?.[flag]);
}

export function isMaintenanceMode() {
  return Boolean(getSettings()?.maintenance_mode);
}

export function siteLogoUrl(settings: any) {
  if (!settings) return null;
  const id = directusFileId(settings.logo);
  return id ? directusAssetUrl(id) : null;
}

export function siteFaviconUrl(settings: any) {
  if (!settings) return null;
  const id = directusFileId(settings.favicon) ?? directusFileId(settings.logo);
  return id ? directusAssetUrl(id) : null;
}

export function siteOgImageUrl(settings: any) {
  if (!settings) return null;
  const id = directusFileId(settings.og_image) ?? directusFileId(settings.logo);
  return id ? directusAssetUrl(id) : null;
}

export function siteSocialLinks(settings: any) {
  const rows = settings?.social_links;
  if (!Array.isArray(rows)) return [];
  return rows.filter((row: any) => row?.platform && typeof row.href === "string" && row.href.trim());
}

export function socialLinkLabel(link: any) {
  const override = link.label?.trim();
  if (override) return override;
  return SOCIAL_PLATFORM_LABELS[link.platform] ?? SOCIAL_PLATFORM_LABELS.other;
}

export function isExternalSocialHref(href: string) {
  return /^https?:\\/\\//i.test(href) || href.startsWith("//") || href.startsWith("mailto:");
}

export function socialLinkProps(link: any) {
  const external = isExternalSocialHref(link.href);
  return {
    href: link.href,
    "aria-label": socialLinkLabel(link),
    ...(external && !link.href.startsWith("mailto:")
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {}),
  };
}

export function buildSiteMetadata(settings: any, options: any = {}) {
  const siteName = settings?.site_name?.trim() || "Site";
  return {
    title: options.title || siteName,
    description: options.description ?? settings?.tagline ?? undefined,
  };
}

export async function getSiteMetadata(options: any = {}) {
  return buildSiteMetadata(getSettings(), options);
}
`;
}

export function buildBlogMockSource(): string {
  const seed = loadModuleSeed("blog");
  const json = JSON.stringify(seed ?? { items: {}, files: [] });

  return `import { directusAssetUrl, directusFileId } from "@/lib/dkit/client";

const SEED = ${json} as const;

function authorsById() {
  const map = new Map<string, any>();
  for (const row of SEED.items?.authors ?? []) map.set(String(row.id), row);
  return map;
}

function categoriesById() {
  const map = new Map<string, any>();
  for (const row of SEED.items?.categories ?? []) map.set(String(row.id), row);
  return map;
}

function hydrate(row: any) {
  const authors = authorsById();
  const categories = categoriesById();
  const junctions = SEED.items?.posts_categories ?? [];
  const authorId = typeof row.author === "string" ? row.author : row.author?.id;
  const catIds = junctions
    .filter((j: any) => String(j.posts_id) === String(row.id))
    .map((j: any) => String(j.categories_id));
  return {
    ...row,
    author: authorId ? authors.get(authorId) ?? authorId : null,
    categories: catIds.map((id: string) => categories.get(id)).filter(Boolean),
  };
}

export function authorName(post: any): string | null {
  return typeof post.author === "object" && post.author?.name ? post.author.name : null;
}
export function authorAvatarUrl(post: any): string | null {
  if (typeof post.author !== "object" || !post.author) return null;
  const id = directusFileId(post.author.avatar);
  return id ? directusAssetUrl(id) : null;
}
export function featuredImageUrl(post: any): string | null {
  const id = directusFileId(post.featured_image);
  return id ? directusAssetUrl(id) : null;
}
export function normalizeCategories(raw: any): any[] {
  return Array.isArray(raw) ? raw.filter((c) => c && typeof c === "object" && "id" in c) : [];
}

export function getBlogPosts(options: { status?: string | null; limit?: number; category?: string } = {}) {
  const status = options.status === null ? null : (options.status ?? "published");
  let rows = (SEED.items?.posts ?? []).map(hydrate);
  if (status !== null) rows = rows.filter((r: any) => r.status === status);
  if (options.category) {
    rows = rows.filter((p: any) =>
      normalizeCategories(p.categories).some((c: any) => c.slug === options.category),
    );
  }
  rows.sort((a: any, b: any) => String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")));
  if (options.limit != null) rows = rows.slice(0, options.limit);
  return rows;
}
export function getBlogPostBySlug(slug: string, options: { status?: string | null } = {}) {
  const status = options.status === null ? null : (options.status ?? "published");
  const row = (SEED.items?.posts ?? []).find((r: any) => {
    if (r.slug !== slug) return false;
    if (status === null) return true;
    return r.status === status;
  });
  return row ? hydrate(row) : null;
}
export function getBlogPostById(id: string) {
  const row = (SEED.items?.posts ?? []).find((r: any) => String(r.id) === id);
  return row ? hydrate(row) : null;
}
export function getBlogAuthors(options: { status?: string | null; limit?: number } = {}) {
  const status = options.status === null ? null : (options.status ?? "published");
  let rows = [...(SEED.items?.authors ?? [])];
  if (status !== null) rows = rows.filter((r: any) => r.status === status);
  if (options.limit != null) rows = rows.slice(0, options.limit);
  return rows;
}
export function getBlogAuthorBySlug(slug: string) {
  return (SEED.items?.authors ?? []).find((r: any) => r.status === "published" && r.slug === slug) ?? null;
}
export function getBlogAuthorById(id: string) {
  return authorsById().get(id) ?? null;
}
export function getBlogCategories(options: { limit?: number } = {}) {
  let rows = [...(SEED.items?.categories ?? [])];
  if (options.limit != null) rows = rows.slice(0, options.limit);
  return rows;
}
export function getBlogCategoryBySlug(slug: string) {
  return (SEED.items?.categories ?? []).find((r: any) => r.slug === slug) ?? null;
}
export function getBlogCategoryById(id: string) {
  return categoriesById().get(id) ?? null;
}
export function getBlogPostsByCategorySlug(categorySlug: string, options: { limit?: number } = {}) {
  return getBlogPosts({ ...options, category: categorySlug });
}
`;
}

export function buildPagesMockSource(): string {
  const seed = loadModuleSeed("pages");
  const json = JSON.stringify(seed ?? { items: {} });
  return `const SEED = ${json} as const;

function pages() {
  return (SEED.items?.pages ?? []) as any[];
}

export function getPages(options: { status?: string | null; limit?: number } = {}) {
  const status = options.status === null ? null : (options.status ?? "published");
  let rows = pages();
  if (status !== null) rows = rows.filter((p) => p.status === status);
  rows.sort((a, b) => String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")));
  if (options.limit != null) rows = rows.slice(0, options.limit);
  return rows;
}
export function getPageBySlug(slug: string, options: { status?: string | null } = {}) {
  const status = options.status === null ? null : (options.status ?? "published");
  return pages().find((p) => {
    if (p.slug !== slug) return false;
    if (status === null) return true;
    return p.status === status;
  }) ?? null;
}
export function getPageById(id: string) {
  return pages().find((p) => p.id === id) ?? null;
}
`;
}

export function buildContactMockSource(): string {
  return `export type ContactFormState = { ok: boolean; error?: string };

export async function createContactSubmission(_input?: {
  name: string;
  email: string;
  message: string;
}) {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true as const, id: "preview" };
}
export async function submitContactForm(
  _prev: ContactFormState,
  _formData: FormData,
): Promise<ContactFormState> {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}
`;
}

export function buildPageBuilderMockSource(): string {
  return `export type PageBlock = {
  collection: string;
  item: Record<string, unknown>;
};

const SAMPLE = {
  id: "preview-builder",
  slug: "sample",
  title: "Sample composed page",
  status: "published",
  blocks: [
    { collection: "block_hero", item: { heading: "Composable blocks", subheading: "M2A sections from the page-builder module" } },
    { collection: "block_richtext", item: { title: "What you get", content: "<p>Install this module to create pages from hero, rich text, and CTA blocks in Directus. Use the renderer UI in your Next.js app to output the composed page.</p>" } },
    { collection: "block_cta", item: { label: "Browse modules", href: "/docs/modules/" } },
  ],
};

export function getPageBuilderPages() {
  return [SAMPLE];
}
export function getPageBuilderPageBySlug(slug: string) {
  return slug === "sample" ? SAMPLE : null;
}
export function getPageBuilderPageById(id: string) {
  return id === SAMPLE.id ? SAMPLE : null;
}
`;
}

export function buildNavigationMockSource(): string {
  const seed = loadModuleSeed("navigation");
  const json = JSON.stringify(seed ?? { items: {} });

  return `const SEED = ${json} as const;

function parentId(item: any): string | null {
  if (!item.parent) return null;
  if (typeof item.parent === "string") return item.parent;
  return item.parent.id ?? null;
}

function sortItems(a: any, b: any) {
  return (a.sort ?? 0) - (b.sort ?? 0);
}

export function buildNavTree(items: any[]) {
  const byId = new Map<string, any>();
  for (const item of items) byId.set(item.id, { ...item, children: [] });
  const roots: any[] = [];
  for (const item of byId.values()) {
    const pid = parentId(item);
    if (pid && byId.has(pid)) byId.get(pid).children.push(item);
    else roots.push(item);
  }
  for (const node of byId.values()) node.children?.sort(sortItems);
  return roots.sort(sortItems);
}

export function isExternalHref(href: string) {
  return /^https?:\\/\\//i.test(href) || href.startsWith("//");
}

export function navLinkProps(item: { href: string; open_in_new_tab?: boolean | null }) {
  const external = isExternalHref(item.href) || Boolean(item.open_in_new_tab);
  return {
    href: item.href,
    ...(external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}),
  };
}

export function getNavMenus(options: { status?: string | null } = {}) {
  const status = options.status === null ? null : (options.status ?? "published");
  let rows = [...(SEED.items?.nav_menus ?? [])];
  if (status !== null) rows = rows.filter((r: any) => r.status === status);
  return rows;
}

export function getNavMenuById(id: string) {
  return (SEED.items?.nav_menus ?? []).find((m: any) => m.id === id) ?? null;
}

export function getNavMenuByKey(key: string, options: { status?: string | null } = {}) {
  const status = options.status === null ? null : (options.status ?? "published");
  let menus = [...(SEED.items?.nav_menus ?? [])].filter((m: any) => m.key === key);
  if (status !== null) menus = menus.filter((m: any) => m.status === status);
  const menu = menus[0];
  if (!menu) return null;
  let items = [...(SEED.items?.nav_items ?? [])].filter((i: any) => i.menu === menu.id);
  if (status !== null) items = items.filter((i: any) => i.status === status);
  return { id: menu.id, key: menu.key, name: menu.name, items: buildNavTree(items) };
}

export function getNavItems(key: string, options: { status?: string | null; tree?: boolean } = {}) {
  const tree = getNavMenuByKey(key, { status: options.status });
  if (!tree) return [];
  if (options.tree === false) {
    const flat: any[] = [];
    const walk = (nodes: any[]) => {
      for (const n of nodes) {
        flat.push(n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(tree.items);
    return flat;
  }
  return tree.items;
}
`;
}

export function buildConfigMockSource(): string {
  return `export const collections = {
  block_hero: "block_hero",
  block_richtext: "block_richtext",
  block_cta: "block_cta",
} as const;

export function moduleBasePath(moduleId: string, fallback = "/") {
  if (moduleId === "blog") return "/blog";
  if (moduleId === "pages") return "/pages";
  return fallback;
}

export function joinModulePath(basePath: string, ...parts: string[]) {
  const base = !basePath || basePath === "/" ? "" : basePath.replace(/\\/$/, "");
  const rest = parts.map((p) => p.replace(/^\\/+|\\/+$/g, "")).filter(Boolean).join("/");
  const joined = \`\${base}/\${rest}\`.replace(/\\/{2,}/g, "/");
  return joined.startsWith("/") ? joined : \`/\${joined}\`;
}
`;
}
