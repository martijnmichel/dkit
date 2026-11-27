import {
  getSettings,
  siteSocialLinks,
  socialLinkLabel,
  socialLinkProps,
  type SiteSocialLink,
} from "@/lib/dkit/settings";

/** Link row from site settings social_links (platform + href). */
export async function SocialLinks({
  links: linksProp,
  className,
  "aria-label": ariaLabel = "Social links",
}: {
  /** Override fetched settings links (e.g. tests / previews). */
  links?: SiteSocialLink[];
  className?: string;
  "aria-label"?: string;
}) {
  const links =
    linksProp ??
    siteSocialLinks(await getSettings());

  if (links.length === 0) return null;

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {links.map((link) => {
          const props = socialLinkProps(link);
          return (
            <li key={`${link.platform}-${link.href}`}>
              <a
                {...props}
                data-platform={link.platform}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {socialLinkLabel(link)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
