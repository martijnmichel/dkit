import { loadModuleSeed } from "@/lib/preview/seeds";

export function buildBlogMockSource(): string {
  const seed = loadModuleSeed("blog");
  const json = JSON.stringify(seed ?? { items: {}, files: [] });

  return `const SEED = ${json} as const;

type FileRef = string | { id?: string } | null | undefined;

function fileId(value: FileRef): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

function asset(file: FileRef): string | null {
  const id = fileId(file);
  if (!id) return null;
  const row = (SEED.files ?? []).find((f: { id: string }) => f.id === id);
  const slug = row?.filename_download?.replace(/\\W+/g, "") ?? id;
  return \`https://picsum.photos/seed/\${encodeURIComponent(slug)}/640/360\`;
}

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
  return asset(post.author.avatar);
}
export function featuredImageUrl(post: any): string | null {
  return asset(post.featured_image);
}
export function normalizeCategories(raw: any): any[] {
  return Array.isArray(raw) ? raw.filter((c) => c && typeof c === "object" && "id" in c) : [];
}

export async function getPosts() {
  return (SEED.items?.posts ?? [])
    .filter((r: any) => r.status === "published")
    .map(hydrate)
    .sort((a: any, b: any) => String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")));
}
export async function getPostBySlug(slug: string) {
  const row = (SEED.items?.posts ?? []).find((r: any) => r.status === "published" && r.slug === slug);
  return row ? hydrate(row) : null;
}
export async function getPostById(id: string) {
  const row = (SEED.items?.posts ?? []).find((r: any) => String(r.id) === id);
  return row ? hydrate(row) : null;
}
export const getPost = getPostBySlug;
`;
}

export function buildPagesMockSource(): string {
  const seed = loadModuleSeed("pages");
  const json = JSON.stringify(seed ?? { items: {} });
  return `const SEED = ${json} as const;

function pages() {
  return (SEED.items?.pages ?? []) as any[];
}

export async function getPages() {
  return pages()
    .filter((p) => p.status === "published")
    .sort((a, b) => String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")));
}
export async function getPageBySlug(slug: string) {
  return pages().find((p) => p.status === "published" && p.slug === slug) ?? null;
}
export async function getPageById(id: string) {
  return pages().find((p) => p.id === id) ?? null;
}
export const getPage = getPageBySlug;
`;
}

export function buildContactMockSource(): string {
  return `export type ContactFormState = { ok: boolean; error?: string };

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
    { collection: "block_hero", item: { heading: "Built with dkit", subheading: "Composable Directus pages" } },
    { collection: "block_richtext", item: { title: "About this preview", content: "<p>This is a directory fixture for the page-builder module.</p>" } },
    { collection: "block_cta", item: { label: "Browse modules", href: "/modules" } },
  ],
};

export async function getBuilderPage(slug: string) {
  return slug === "sample" ? SAMPLE : null;
}
export const getBuilderPageBySlug = getBuilderPage;
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
