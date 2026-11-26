/**
 * Shared Directus client + asset helpers for www previews.
 * Same contract as the CLI-generated lib/dkit/client.ts — modules must not
 * redefine getDirectus / directusFileId / directusAssetUrl.
 */
import { previewAssetUrl } from "@/lib/preview/seeds";

export type DirectusFileRef = { id: string };

/** Preview site has no live Directus — services use seed mocks instead. */
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

/**
 * Asset URL for previews. Prefers seeded preview assets; falls back to the
 * standard Directus `/assets/:id` shape when DIRECTUS_URL is set.
 */
export function directusAssetUrl(
  fileId: string,
  baseUrl = process.env.DIRECTUS_URL,
  moduleId = "blog",
): string | null {
  if (!fileId) return null;
  const preview = previewAssetUrl(moduleId, fileId);
  if (preview) return preview;
  const base = baseUrl?.replace(/\/$/, "");
  if (!base) return null;
  return `${base}/assets/${fileId}`;
}

export { createItem, readItem, readItems } from "@directus/sdk";
