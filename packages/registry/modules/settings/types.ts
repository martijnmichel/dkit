export type DirectusFileRef = { id: string };

export type SiteSocialLink = {
  label: string;
  href: string;
};

export type SiteFeatureFlags = Record<string, boolean>;

/** Singleton site brand / config row. */
export type SiteSettings = {
  id: string;
  site_name: string;
  tagline?: string | null;
  logo?: string | DirectusFileRef | null;
  favicon?: string | DirectusFileRef | null;
  contact_email?: string | null;
  social_links?: SiteSocialLink[] | null;
  maintenance_mode?: boolean | null;
  feature_flags?: SiteFeatureFlags | null;
};

export type GetSettingsOptions = {
  /** Unused today — reserved for future draft/preview. */
  status?: string | null;
};
