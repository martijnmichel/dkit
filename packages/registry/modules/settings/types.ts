export type DirectusFileRef = { id: string };

/** Known social platforms for the settings list dropdown. */
export type SiteSocialPlatform =
  | "x"
  | "github"
  | "linkedin"
  | "instagram"
  | "facebook"
  | "youtube"
  | "bluesky"
  | "mastodon"
  | "discord"
  | "tiktok"
  | "threads"
  | "email"
  | "website"
  | "other";

export type SiteSocialLink = {
  platform: SiteSocialPlatform;
  href: string;
  /** Optional override; defaults to the platform display name. */
  label?: string | null;
};

export type SiteFeatureFlags = Record<string, boolean>;

/** Singleton site brand / config row. */
export type SiteSettings = {
  id: string;
  site_name: string;
  tagline?: string | null;
  logo?: string | DirectusFileRef | null;
  favicon?: string | DirectusFileRef | null;
  /** Optional Open Graph / social share image. */
  og_image?: string | DirectusFileRef | null;
  contact_email?: string | null;
  social_links?: SiteSocialLink[] | null;
  maintenance_mode?: boolean | null;
  feature_flags?: SiteFeatureFlags | null;
};

export type GetSettingsOptions = {
  /** Unused today — reserved for future draft/preview. */
  status?: string | null;
};

/** Options for building Next-compatible metadata from settings. */
export type BuildSiteMetadataOptions = {
  /**
   * Absolute site origin (`https://example.com`).
   * Falls back to `NEXT_PUBLIC_SITE_URL` / `SITE_URL` / `NUXT_PUBLIC_SITE_URL`.
   */
  siteUrl?: string;
  /** Page path appended to siteUrl for canonical / OG url (default `/`). */
  path?: string;
  /** Override document title (default: site_name). */
  title?: string;
  /** Override description (default: tagline). */
  description?: string | null;
  /** When true, use `title` as the absolute document title. */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  noIndex?: boolean;
};

/**
 * Plain metadata object compatible with Next.js `Metadata`
 * (`export const metadata` / `generateMetadata`).
 */
export type SiteMetadata = {
  title: string | { absolute: string };
  description?: string;
  icons?: { icon?: string };
  alternates?: { canonical?: string };
  openGraph?: {
    title: string;
    description?: string;
    url?: string;
    siteName?: string;
    type?: "website" | "article";
    images?: Array<{ url: string }>;
  };
  twitter?: {
    card: "summary" | "summary_large_image";
    title: string;
    description?: string;
    images?: string[];
  };
  robots?:
    | { index: boolean; follow: boolean }
    | undefined;
};
