import {
  getSettings,
  siteLogoUrl,
  siteSocialLinks,
  socialLinkLabel,
  socialLinkProps,
} from "@/lib/dkit/settings";

/**
 * Layout wrapper: when `maintenance_mode` is on, render a full-page notice
 * instead of `children`. Pass `bypass` to force the live site (e.g. preview).
 */
export async function MaintenanceGate({
  children,
  bypass = false,
  active,
  title,
  message,
}: {
  children: React.ReactNode;
  /** Skip the gate even when maintenance_mode is true. */
  bypass?: boolean;
  /** Force on/off — overrides settings when set (useful for previews). */
  active?: boolean;
  title?: string;
  message?: string;
}) {
  const settings = await getSettings();
  const on = active ?? Boolean(settings?.maintenance_mode);
  if (bypass || !on) {
    return <>{children}</>;
  }

  const name = settings.site_name?.trim() || "We'll be back soon";
  const heading = title?.trim() || "Under maintenance";
  const body =
    message?.trim() ||
    settings.tagline?.trim() ||
    "We're making improvements. Please check back shortly.";
  const logo = siteLogoUrl(settings);
  const email = settings.contact_email?.trim();
  const socials = siteSocialLinks(settings);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-10 w-auto" />
        ) : null}
        <p className="text-xs font-medium tracking-[0.2em] text-primary uppercase">
          {name}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {heading}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">{body}</p>
        {email ? (
          <a
            href={`mailto:${email}`}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {email}
          </a>
        ) : null}
        {socials.length > 0 ? (
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {socials.map((link) => {
              const props = socialLinkProps(link);
              return (
                <li key={`${link.platform}-${link.href}`}>
                  <a
                    {...props}
                    data-platform={link.platform}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {socialLinkLabel(link)}
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
