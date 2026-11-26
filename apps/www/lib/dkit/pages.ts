import { loadModuleSeed } from "@/lib/preview/seeds";
import type {
  GetPageBySlugOptions,
  GetPagesOptions,
  SitePage,
} from "../../../../packages/registry/modules/pages/types";

export type {
  GetPageBySlugOptions,
  GetPagesOptions,
  SitePage,
} from "../../../../packages/registry/modules/pages/types";

function seedPages(): SitePage[] {
  return (loadModuleSeed("pages")?.items?.pages ?? []).map(
    (r) => r as unknown as SitePage,
  );
}

export async function getPages(
  options: GetPagesOptions = {},
): Promise<SitePage[]> {
  const status = options.status === null ? null : (options.status ?? "published");
  let rows = seedPages();
  if (status !== null) rows = rows.filter((p) => p.status === status);
  rows.sort((a, b) =>
    String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")),
  );
  if (options.limit != null) rows = rows.slice(0, options.limit);
  return rows;
}

export async function getPageBySlug(
  slug: string,
  options: GetPageBySlugOptions = {},
): Promise<SitePage | null> {
  const status = options.status === null ? null : (options.status ?? "published");
  return (
    seedPages().find((p) => {
      if (p.slug !== slug) return false;
      if (status === null) return true;
      return p.status === status;
    }) ?? null
  );
}

export async function getPageById(id: string): Promise<SitePage | null> {
  return seedPages().find((p) => p.id === id) ?? null;
}

/** @deprecated prefer getPageBySlug */
export const getPage = getPageBySlug;
