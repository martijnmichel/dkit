import { loadModuleSeed } from "@/lib/preview/seeds";
import type { SitePage } from "../../../../packages/registry/modules/pages/types";

export type { SitePage } from "../../../../packages/registry/modules/pages/types";

function seedPages(): SitePage[] {
  return (loadModuleSeed("pages")?.items?.pages ?? []).map(
    (r) => r as unknown as SitePage,
  );
}

export async function getPages(): Promise<SitePage[]> {
  return seedPages()
    .filter((p) => p.status === "published")
    .sort((a, b) =>
      String(b.published_at ?? "").localeCompare(String(a.published_at ?? "")),
    );
}

export async function getPageBySlug(slug: string): Promise<SitePage | null> {
  return (
    seedPages().find((p) => p.status === "published" && p.slug === slug) ?? null
  );
}

export async function getPageById(id: string): Promise<SitePage | null> {
  return seedPages().find((p) => p.id === id) ?? null;
}

export const getPage = getPageBySlug;
