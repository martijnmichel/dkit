import {
  getNavMenuByKey,
  navLinkProps,
  type NavItem,
} from "@/lib/dkit/navigation";
import { loadSoftBrand } from "./soft-brand";

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

/** Minimal kit — semantic footer with optional settings soft-brand. */
export async function NavFooter({
  menuKey = "footer",
  brandName,
  contactEmail,
}: {
  menuKey?: string;
  brandName?: string;
  contactEmail?: string | null;
}) {
  const menu = await getNavMenuByKey(menuKey);
  const items = menu?.items ?? [];

  let name = brandName;
  let email = contactEmail;
  let socials: Array<{ label: string; href: string }> = [];

  if (brandName === undefined || contactEmail === undefined) {
    const soft = await loadSoftBrand();
    if (brandName === undefined) name = soft?.name;
    if (contactEmail === undefined) email = soft?.contactEmail ?? null;
    socials = soft?.socialLinks ?? [];
  }

  const title = name?.trim();
  const year = new Date().getFullYear();

  return (
    <footer className="dkit-nav-footer">
      <style>{`
        .dkit-nav-footer {
          border-top: 1px solid #ddd;
          margin-top: 3rem;
        }
        .dkit-nav-footer__inner {
          max-width: 64rem;
          margin: 0 auto;
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .dkit-nav-footer__row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .dkit-nav-footer__brand {
          font-weight: 600;
          margin: 0 0 0.35rem;
        }
        .dkit-nav-footer__email {
          color: #555;
          text-decoration: none;
          font-size: 0.875rem;
        }
        .dkit-nav-footer__links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-nav-footer__links a,
        .dkit-nav-footer__social a {
          color: #555;
          text-decoration: none;
          font-size: 0.875rem;
        }
        .dkit-nav-footer__links a:hover,
        .dkit-nav-footer__social a:hover,
        .dkit-nav-footer__email:hover {
          text-decoration: underline;
          color: inherit;
        }
        .dkit-nav-footer__social {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-nav-footer__copy {
          margin: 0;
          font-size: 0.75rem;
          color: #777;
        }
      `}</style>
      <div className="dkit-nav-footer__inner">
        <div className="dkit-nav-footer__row">
          <div>
            {title ? <p className="dkit-nav-footer__brand">{title}</p> : null}
            {email ? (
              <a className="dkit-nav-footer__email" href={`mailto:${email}`}>
                {email}
              </a>
            ) : null}
          </div>
          <nav aria-label="Footer">
            <FooterLinks items={items} />
          </nav>
        </div>
        {socials.length > 0 ? (
          <ul className="dkit-nav-footer__social">
            {socials.map((s) => (
              <li key={`${s.label}-${s.href}`}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="dkit-nav-footer__copy">
          © {year}
          {title ? ` ${title}` : ""}
        </p>
      </div>
    </footer>
  );
}
