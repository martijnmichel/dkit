import { getSettings, siteLogoUrl } from "@/lib/dkit/settings";

/** Settings logo only. Returns null when no logo is set. */
export async function SiteLogo({
  homeHref,
  className,
  alt,
}: {
  /** When set, wrap the image in a link. */
  homeHref?: string;
  className?: string;
  alt?: string;
}) {
  const settings = await getSettings();
  const src = siteLogoUrl(settings);
  if (!src) return null;

  const label = alt ?? settings?.site_name?.trim() ?? "";
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className={className ?? "h-8 w-auto"}
    />
  );

  if (!homeHref) return image;
  return (
    <a href={homeHref} className="inline-flex items-center">
      {image}
    </a>
  );
}
