import { getDirectus, readSingleton } from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";

export type SoftBrand = {
  name?: string;
  contactEmail?: string | null;
  socialLinks?: Array<{ label: string; href: string }> | null;
};

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
      social_links?: Array<{ label: string; href: string }> | null;
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
