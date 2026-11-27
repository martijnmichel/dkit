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
    <div className="dkit-maintenance-gate">
      <style>{`
        .dkit-maintenance-gate {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.25rem;
          text-align: center;
        }
        .dkit-maintenance-gate__inner {
          max-width: 28rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }
        .dkit-maintenance-gate__brand {
          margin: 0;
          font-size: 0.75rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #666;
        }
        .dkit-maintenance-gate__title {
          margin: 0;
          font-size: 1.875rem;
          font-weight: 600;
          line-height: 1.2;
        }
        .dkit-maintenance-gate__body {
          margin: 0;
          color: #555;
          line-height: 1.6;
        }
        .dkit-maintenance-gate__logo {
          height: 2.5rem;
          width: auto;
        }
        .dkit-maintenance-gate__email {
          color: #555;
          font-size: 0.875rem;
        }
        .dkit-maintenance-gate__social {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem 1.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-maintenance-gate__social a {
          color: #555;
          font-size: 0.875rem;
          text-decoration: none;
        }
        .dkit-maintenance-gate__social a:hover {
          text-decoration: underline;
          color: inherit;
        }
      `}</style>
      <div className="dkit-maintenance-gate__inner">
        {logo ? (
          <img className="dkit-maintenance-gate__logo" src={logo} alt="" />
        ) : null}
        <p className="dkit-maintenance-gate__brand">{name}</p>
        <h1 className="dkit-maintenance-gate__title">{heading}</h1>
        <p className="dkit-maintenance-gate__body">{body}</p>
        {email ? (
          <a className="dkit-maintenance-gate__email" href={`mailto:${email}`}>
            {email}
          </a>
        ) : null}
        {socials.length > 0 ? (
          <ul className="dkit-maintenance-gate__social">
            {socials.map((link) => {
              const props = socialLinkProps(link);
              return (
                <li key={`${link.platform}-${link.href}`}>
                  <a {...props} data-platform={link.platform}>
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
