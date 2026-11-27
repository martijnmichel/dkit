import {
  getNavMenuByKey,
  navLinkProps,
  type NavItem,
} from "@/lib/dkit/navigation";

function FooterLinks({ items }: { items: NavItem[] }) {
  return (
    <ul className="dkit-nav-footer__links">
      {items.map((item) => {
        const link = navLinkProps(item);
        return (
          <li key={item.id}>
            <a {...link}>{item.label}</a>
          </li>
        );
      })}
    </ul>
  );
}

/** Footer menu links only — compose with SiteBrand / SocialLinks yourself. */
export async function NavFooter({
  menuKey = "footer",
}: {
  menuKey?: string;
}) {
  const menu = await getNavMenuByKey(menuKey);
  const items: NavItem[] = menu?.items ?? [];

  return (
    <nav className="dkit-nav-footer" aria-label="Footer">
      <style>{`
        .dkit-nav-footer__links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-nav-footer__links a {
          color: #555;
          text-decoration: none;
          font-size: 0.875rem;
        }
        .dkit-nav-footer__links a:hover {
          text-decoration: underline;
          color: inherit;
        }
      `}</style>
      <FooterLinks items={items} />
    </nav>
  );
}
