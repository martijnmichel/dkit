import {
  getSettings,
  siteLogoUrl,
} from "@/lib/dkit/settings";

/**
 * Brand mark from settings — compose into your header/footer layout.
 * Logo renders whenever settings.logo is set — use SiteLogo for logo-only.
 */
export async function SiteBrand({
  homeHref = "/",
  showTagline = true,
}: {
  homeHref?: string;
  showTagline?: boolean;
}) {
  const settings = await getSettings();
  if (!settings) return null;

  const name = settings.site_name?.trim();
  if (!name) return null;

  const logo = siteLogoUrl(settings);
  const tagline = settings.tagline?.trim();

  return (
    <div className="dkit-site-brand">
      <style>{`
        .dkit-site-brand__link {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          font-weight: 600;
          text-decoration: none;
          color: inherit;
        }
        .dkit-site-brand__link img {
          height: 2rem;
          width: auto;
        }
        .dkit-site-brand__name {
          font-size: 1.125rem;
        }
        .dkit-site-brand__tagline {
          margin: 0.35rem 0 0;
          max-width: 24rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #555;
        }
      `}</style>
      <a href={homeHref} className="dkit-site-brand__link">
        {logo ? <img src={logo} alt="" /> : null}
        <span className="dkit-site-brand__name">{name}</span>
      </a>
      {showTagline && tagline ? (
        <p className="dkit-site-brand__tagline">{tagline}</p>
      ) : null}
    </div>
  );
}
