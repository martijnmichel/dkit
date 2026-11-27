import {
  getSettings,
  siteSocialLinks,
  socialLinkLabel,
  socialLinkProps,
  type SiteSocialLink,
} from "@/lib/dkit/settings";

/** Minimal kit — platform link row from settings. */
export async function SocialLinks({
  links: linksProp,
  "aria-label": ariaLabel = "Social links",
}: {
  links?: SiteSocialLink[];
  "aria-label"?: string;
}) {
  const links = linksProp ?? siteSocialLinks(await getSettings());
  if (links.length === 0) return null;

  return (
    <nav className="dkit-social-links" aria-label={ariaLabel}>
      <style>{`
        .dkit-social-links ul {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-social-links a {
          color: #555;
          text-decoration: none;
          font-size: 0.875rem;
        }
        .dkit-social-links a:hover {
          color: inherit;
          text-decoration: underline;
        }
      `}</style>
      <ul>
        {links.map((link) => {
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
    </nav>
  );
}
