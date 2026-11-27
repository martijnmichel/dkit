import {
  getSettings,
  siteLogoUrl,
} from "@/lib/dkit/settings";

/**
 * Brand mark from settings (logo + name + tagline).
 * Place beside NavHeader or above NavFooter / SocialLinks in your layout.
 * Logo renders whenever settings.logo is set — use SiteLogo for logo-only.
 */
export async function SiteBrand({
  homeHref = "/",
  showTagline = true,
  className,
}: {
  homeHref?: string;
  showTagline?: boolean;
  className?: string;
}) {
  const settings = await getSettings();
  if (!settings) return null;

  const name = settings.site_name?.trim();
  if (!name) return null;

  const logo = siteLogoUrl(settings);
  const tagline = settings.tagline?.trim();

  return (
    <div className={className}>
      <a
        href={homeHref}
        className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground"
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-8 w-auto" />
        ) : null}
        <span className="truncate text-lg">{name}</span>
      </a>
      {showTagline && tagline ? (
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {tagline}
        </p>
      ) : null}
    </div>
  );
}
