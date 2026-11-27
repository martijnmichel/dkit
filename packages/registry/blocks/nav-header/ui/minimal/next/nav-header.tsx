import {
  getNavMenuByKey,
  navLinkProps,
  type NavItem,
} from "@/lib/dkit/navigation";
import { loadSoftBrand } from "./soft-brand";

function NavAnchor({ item }: { item: NavItem }) {
  const props = navLinkProps(item);
  return <a {...props}>{item.label}</a>;
}

function ItemList({ items }: { items: NavItem[] }) {
  return (
    <ul className="dkit-nav-header__list">
      {items.map((item) => {
        const children = item.children?.filter(Boolean) ?? [];
        return (
          <li key={item.id}>
            <NavAnchor item={item} />
            {children.length > 0 ? (
              <ul className="dkit-nav-header__children">
                {children.map((child) => (
                  <li key={child.id}>
                    <NavAnchor item={child} />
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Minimal kit — semantic header + nested lists; mobile via details. */
export async function NavHeader({
  menuKey = "primary",
  brandName,
  logoUrl,
  homeHref = "/",
}: {
  menuKey?: string;
  brandName?: string;
  logoUrl?: string | null;
  homeHref?: string;
}) {
  const menu = await getNavMenuByKey(menuKey);
  const items = menu?.items ?? [];

  let name = brandName;
  let logo = logoUrl;
  if (brandName === undefined || logoUrl === undefined) {
    const soft = await loadSoftBrand();
    if (brandName === undefined) name = soft?.name;
    if (logoUrl === undefined) logo = soft?.logoUrl ?? null;
  }
  const title = name?.trim() || "Home";

  return (
    <header className="dkit-nav-header">
      <style>{`
        .dkit-nav-header {
          border-bottom: 1px solid #ddd;
        }
        .dkit-nav-header__inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          max-width: 64rem;
          margin: 0 auto;
          padding: 0.75rem 1rem;
        }
        .dkit-nav-header__brand {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          text-decoration: none;
          color: inherit;
        }
        .dkit-nav-header__brand img {
          height: 1.75rem;
          width: auto;
        }
        .dkit-nav-header__list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-nav-header__list a {
          color: inherit;
          text-decoration: none;
        }
        .dkit-nav-header__list a:hover {
          text-decoration: underline;
        }
        .dkit-nav-header__children {
          list-style: none;
          margin: 0.35rem 0 0;
          padding: 0 0 0 0.75rem;
          border-left: 1px solid #ddd;
        }
        .dkit-nav-header__desktop {
          display: none;
        }
        .dkit-nav-header__mobile summary {
          cursor: pointer;
          list-style: none;
          font-size: 0.875rem;
        }
        .dkit-nav-header__mobile summary::-webkit-details-marker {
          display: none;
        }
        .dkit-nav-header__mobile[open] .dkit-nav-header__panel {
          display: block;
        }
        .dkit-nav-header__panel {
          display: none;
          padding: 0.75rem 0 0;
        }
        @media (min-width: 768px) {
          .dkit-nav-header__desktop {
            display: block;
          }
          .dkit-nav-header__mobile {
            display: none;
          }
          .dkit-nav-header__children {
            display: none;
            position: absolute;
            margin: 0;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-left: 1px solid #ddd;
            background: #fff;
            min-width: 10rem;
          }
          .dkit-nav-header__desktop li {
            position: relative;
          }
          .dkit-nav-header__desktop li:hover > .dkit-nav-header__children,
          .dkit-nav-header__desktop li:focus-within > .dkit-nav-header__children {
            display: block;
          }
        }
      `}</style>
      <div className="dkit-nav-header__inner">
        <a href={homeHref} className="dkit-nav-header__brand">
          {logo ? <img src={logo} alt="" /> : null}
          <span>{title}</span>
        </a>
        <nav className="dkit-nav-header__desktop" aria-label="Primary">
          <ItemList items={items} />
        </nav>
        <details className="dkit-nav-header__mobile">
          <summary>Menu</summary>
          <div className="dkit-nav-header__panel">
            <nav aria-label="Primary">
              <ItemList items={items} />
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
