import { getSettings, siteLogoUrl } from "@/lib/dkit/settings";

/** Settings logo only. Returns null when no logo is set. */
export async function SiteLogo({
  homeHref,
  alt,
}: {
  homeHref?: string;
  alt?: string;
}) {
  const settings = await getSettings();
  const src = siteLogoUrl(settings);
  if (!src) return null;

  const label = alt ?? settings?.site_name?.trim() ?? "";
  const image = (
    <img className="dkit-site-logo" src={src} alt={label} />
  );

  return (
    <>
      <style>{`
        .dkit-site-logo {
          height: 2rem;
          width: auto;
          display: block;
        }
        a:has(> .dkit-site-logo) {
          display: inline-flex;
          align-items: center;
          text-decoration: none;
        }
      `}</style>
      {homeHref ? <a href={homeHref}>{image}</a> : image}
    </>
  );
}
