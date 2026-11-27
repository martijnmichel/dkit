import {
  directusAssetUrl,
  directusFileId,
  getDirectus,
  readSingleton,
} from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";

export type SoftBrand = {
  name?: string;
  logoUrl?: string | null;
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
        fields: ["site_name", "logo"],
      }),
    );
    const logoId = directusFileId(
      (row as { logo?: string | { id: string } | null }).logo,
    );
    return {
      name: (row as { site_name?: string }).site_name,
      logoUrl: logoId ? directusAssetUrl(logoId) : null,
    };
  } catch {
    return null;
  }
}
