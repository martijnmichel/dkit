import {
  directusAssetUrl,
  directusFileId,
  dkitQueryFailed,
  getDirectus,
  readSingleton,
} from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type {
  BuildSiteMetadataOptions,
  GetSettingsOptions,
  SiteMetadata,
  SiteSettings,
  SiteSocialLink,
  SiteSocialPlatform,
} from "./types";

export type {
  BuildSiteMetadataOptions,
  DirectusFileRef,
  GetSettingsOptions,
  SiteFeatureFlags,
  SiteMetadata,
  SiteSettings,
  SiteSocialLink,
  SiteSocialPlatform,
} from "./types";

const SETTINGS_FIELDS = [
  "id",
  "site_name",
  "tagline",
  "logo",
  "favicon",
  "og_image",
  "contact_email",
  "social_links",
  "maintenance_mode",
  "feature_flags",
] as const;

/** Display labels for social platform keys. */
export const SOCIAL_PLATFORM_LABELS: Record<SiteSocialPlatform, string> = {
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

/** True when settings.maintenance_mode is enabled. Soft-fails to false. */
export async function isMaintenanceMode(): Promise<boolean> {
  const row = await getSettings();
  return Boolean(row?.maintenance_mode);
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

export function siteOgImageUrl(
  settings: SiteSettings | null | undefined,
): string | null {
  if (!settings) return null;
  const id = directusFileId(settings.og_image) ?? directusFileId(settings.logo);
  return id ? directusAssetUrl(id) : null;
}

/** Normalized social links from settings (skips incomplete rows). */
export function siteSocialLinks(
  settings: SiteSettings | null | undefined,
): SiteSocialLink[] {
  const rows = settings?.social_links;
  if (!Array.isArray(rows)) return [];
  return rows.filter(
    (row): row is SiteSocialLink =>
      Boolean(row?.platform && typeof row.href === "string" && row.href.trim()),
  );
}

export function socialLinkLabel(link: SiteSocialLink): string {
  const override = link.label?.trim();
  if (override) return override;
  return SOCIAL_PLATFORM_LABELS[link.platform] ?? SOCIAL_PLATFORM_LABELS.other;
}

export function isExternalSocialHref(href: string): boolean {
  return (
    /^https?:\/\//i.test(href) ||
    href.startsWith("//") ||
    href.startsWith("mailto:")
  );
}

export function socialLinkProps(link: SiteSocialLink): {
  href: string;
  target?: "_blank";
  rel?: string;
  "aria-label": string;
} {
  const external = isExternalSocialHref(link.href);
  return {
    href: link.href,
    "aria-label": socialLinkLabel(link),
    ...(external && !link.href.startsWith("mailto:")
      ? { target: "_blank" as const, rel: "noopener noreferrer" }
      : {}),
  };
}

function resolveSiteUrl(explicit?: string): string | undefined {
  const raw =
    explicit ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NUXT_PUBLIC_SITE_URL ||
    undefined;
  return raw?.replace(/\/$/, "") || undefined;
}

function joinSiteUrl(siteUrl: string | undefined, path = "/"): string | undefined {
  if (!siteUrl) return undefined;
  if (!path || path === "/") return `${siteUrl}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalized}`;
}

/**
 * Build Next-compatible metadata from a settings row.
 * Use in `generateMetadata` / root layout:
 *
 * ```ts
 * export async function generateMetadata() {
 *   return getSiteMetadata({ path: "/" });
 * }
 * ```
 */
export function buildSiteMetadata(
  settings: SiteSettings | null | undefined,
  options: BuildSiteMetadataOptions = {},
): SiteMetadata {
  const siteName = settings?.site_name?.trim() || "Site";
  const description =
    options.description === null
      ? undefined
      : (options.description?.trim() ||
        settings?.tagline?.trim() ||
        undefined);
  const pageTitle = options.title?.trim() || siteName;
  const ogTitle = options.absoluteTitle
    ? pageTitle
    : options.title
      ? `${pageTitle} — ${siteName}`
      : siteName;

  const siteUrl = resolveSiteUrl(options.siteUrl);
  const canonical = joinSiteUrl(siteUrl, options.path ?? "/");
  const favicon = siteFaviconUrl(settings) ?? undefined;
  const ogImage = siteOgImageUrl(settings);
  const images = ogImage ? [{ url: ogImage }] : undefined;
  const twitterImages = ogImage ? [ogImage] : undefined;

  return {
    title: options.absoluteTitle ? { absolute: pageTitle } : pageTitle,
    ...(description ? { description } : {}),
    ...(favicon ? { icons: { icon: favicon } } : {}),
    ...(canonical ? { alternates: { canonical } } : {}),
    openGraph: {
      title: ogTitle,
      ...(description ? { description } : {}),
      ...(canonical ? { url: canonical } : {}),
      siteName,
      type: options.type ?? "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: ogTitle,
      ...(description ? { description } : {}),
      ...(twitterImages ? { images: twitterImages } : {}),
    },
    ...(options.noIndex
      ? { robots: { index: false, follow: false } }
      : { robots: { index: true, follow: true } }),
  };
}

/** Fetch settings and build site metadata in one call. */
export async function getSiteMetadata(
  options: BuildSiteMetadataOptions = {},
): Promise<SiteMetadata> {
  const settings = await getSettings();
  return buildSiteMetadata(settings, options);
}
