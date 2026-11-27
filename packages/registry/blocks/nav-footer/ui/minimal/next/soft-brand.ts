import { getDirectus, readSingleton } from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";

export type SoftSocialLink = {
  platform?: string;
  href: string;
  label?: string | null;
};

export type SoftBrand = {
  name?: string;
  contactEmail?: string | null;
  socialLinks?: SoftSocialLink[] | null;
};

const PLATFORM_LABELS: Record<string, string> = {
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

export function softSocialLabel(link: SoftSocialLink): string {
  const override = link.label?.trim();
  if (override) return override;
  if (link.platform && PLATFORM_LABELS[link.platform]) {
    return PLATFORM_LABELS[link.platform]!;
  }
  return link.platform || "Link";
}

/** Soft-link to settings when `site_settings` is in config. */
export async function loadSoftBrand(): Promise<SoftBrand | null> {
  const physical = (collections as Record<string, string | undefined>)
    .site_settings;
  if (!physical) return null;
  const client = getDirectus();
  if (!client) return null;
  try {
    const row = await client.request(
      readSingleton(physical, {
        fields: ["site_name", "contact_email", "social_links"],
      }),
    );
    const r = row as {
      site_name?: string;
      contact_email?: string | null;
      social_links?: SoftSocialLink[] | null;
    };
    return {
      name: r.site_name,
      contactEmail: r.contact_email ?? null,
      socialLinks: r.social_links ?? null,
    };
  } catch {
    return null;
  }
}
