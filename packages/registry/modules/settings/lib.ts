import {
  directusAssetUrl,
  directusFileId,
  dkitQueryFailed,
  getDirectus,
  readSingleton,
} from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type { GetSettingsOptions, SiteSettings } from "./types";

export type {
  DirectusFileRef,
  GetSettingsOptions,
  SiteFeatureFlags,
  SiteSettings,
  SiteSocialLink,
} from "./types";

const SETTINGS_FIELDS = [
  "id",
  "site_name",
  "tagline",
  "logo",
  "favicon",
  "contact_email",
  "social_links",
  "maintenance_mode",
  "feature_flags",
] as const;

/**
 * Read the site settings singleton.
 * Soft-fails to null when Directus is down or the collection is missing.
 */
export async function getSettings(
  _options: GetSettingsOptions = {},
): Promise<SiteSettings | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.site_settings) {
    dkitQueryFailed(
      'collections.site_settings missing from lib/dkit/config — re-run `dkit add settings`',
    );
    return null;
  }
  try {
    return await client.request(
      readSingleton(collections.site_settings, {
        fields: [...SETTINGS_FIELDS],
      }),
    );
  } catch (err) {
    dkitQueryFailed(
      `getSettings failed (collection=${collections.site_settings})`,
      err,
    );
    return null;
  }
}

/** Typed field accessor — returns undefined when settings are unavailable. */
export async function getSetting<K extends keyof SiteSettings>(
  key: K,
): Promise<SiteSettings[K] | undefined> {
  const row = await getSettings();
  return row?.[key];
}

/** Feature flag lookup — missing flags are false. */
export async function isFeatureEnabled(flag: string): Promise<boolean> {
  const row = await getSettings();
  return Boolean(row?.feature_flags?.[flag]);
}

export function siteLogoUrl(
  settings: SiteSettings | null | undefined,
): string | null {
  if (!settings) return null;
  const id = directusFileId(settings.logo);
  return id ? directusAssetUrl(id) : null;
}

export function siteFaviconUrl(
  settings: SiteSettings | null | undefined,
): string | null {
  if (!settings) return null;
  const id = directusFileId(settings.favicon);
  return id ? directusAssetUrl(id) : null;
}
