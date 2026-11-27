import {
  getNavMenuByKey,
  navLinkProps,
  type NavItem,
} from "@/lib/dkit/navigation";

function NavAnchor({ item }: { item: NavItem }) {
  const props = navLinkProps(item);
  return <a {...props}>{item.label}</a>;
}

function ItemList({
  items,
  variant,
}: {
  items: NavItem[];
  variant: "desktop" | "mobile";
}) {
  return (
    <ul className="dkit-nav-header__list">
      {items.map((item) => {
        const children = item.children?.filter(Boolean) ?? [];
        const hasChildren = children.length > 0;
        return (
          <li
            key={item.id}
            className={
              hasChildren ? "dkit-nav-header__item--has-children" : undefined
            }
          >
            {hasChildren && variant === "desktop" ? (
              <span className="dkit-nav-header__trigger">{item.label}</span>
            ) : (
              <NavAnchor item={item} />
            )}
            {hasChildren ? (
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

/**
 * Primary nav only — compose with SiteBrand / SocialLinks yourself.
 * Desktop: CSS hover/focus dropdown for nested items.
 * Mobile: in-flow `<details>` panel.
 */
export async function NavHeader({
  menuKey = "primary",
}: {
  menuKey?: string;
}) {
  const menu = await getNavMenuByKey(menuKey);
  const items = menu?.items ?? [];

  return (
    <nav className="dkit-nav-header" aria-label="Primary">
      <style>{`
        .dkit-nav-header {
          position: relative;
          display: flex;
          width: 100%;
          flex-direction: column;
          align-items: flex-end;
          overflow: visible;
        }
        .dkit-nav-header__list {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.75rem 1.25rem;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-nav-header__list a,
        .dkit-nav-header__trigger {
          color: inherit;
          text-decoration: none;
        }
        .dkit-nav-header__list a:hover,
        .dkit-nav-header__trigger:hover {
          text-decoration: underline;
        }
        .dkit-nav-header__trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          cursor: default;
        }
        .dkit-nav-header__trigger::after {
          content: "";
          display: inline-block;
          width: 0.3rem;
          height: 0.3rem;
          border-right: 1.5px solid currentColor;
          border-bottom: 1.5px solid currentColor;
          transform: rotate(45deg) translateY(-1px);
        }
        .dkit-nav-header__children {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-nav-header__desktop {
          display: none;
          overflow: visible;
        }
        .dkit-nav-header__mobile {
          width: 100%;
          text-align: right;
        }
        .dkit-nav-header__mobile summary {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          list-style: none;
          font-size: 0.875rem;
          line-height: 1;
          padding: 0.45rem 0.7rem;
          border: 1px solid #ddd;
          border-radius: 0.375rem;
          background: #fff;
          user-select: none;
        }
        .dkit-nav-header__mobile summary::-webkit-details-marker {
          display: none;
        }
        .dkit-nav-header__mobile summary::after {
          content: "";
          display: inline-block;
          width: 0.35rem;
          height: 0.35rem;
          margin-left: 0.45rem;
          border-right: 1.5px solid currentColor;
          border-bottom: 1.5px solid currentColor;
          transform: rotate(45deg) translateY(-1px);
        }
        .dkit-nav-header__mobile[open] summary::after {
          transform: rotate(-135deg) translateY(-1px);
        }
        .dkit-nav-header__panel {
          width: 100%;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid #ddd;
          text-align: left;
        }
        .dkit-nav-header__mobile .dkit-nav-header__list {
          flex-direction: column;
          flex-wrap: nowrap;
          align-items: stretch;
          gap: 0;
        }
        .dkit-nav-header__mobile .dkit-nav-header__list > li > a {
          display: block;
          padding: 0.55rem 0.15rem;
          font-size: 0.9375rem;
        }
        .dkit-nav-header__mobile .dkit-nav-header__children {
          margin: 0 0 0.25rem;
          padding: 0 0 0 0.85rem;
          border-left: 1px solid #ddd;
        }
        .dkit-nav-header__mobile .dkit-nav-header__children a {
          display: block;
          padding: 0.4rem 0.15rem;
          font-size: 0.875rem;
          color: #555;
        }
        @media (min-width: 768px) {
          .dkit-nav-header {
            display: block;
            width: auto;
          }
          .dkit-nav-header__desktop {
            display: block;
          }
          .dkit-nav-header__mobile {
            display: none;
          }
          .dkit-nav-header__desktop .dkit-nav-header__item--has-children {
            position: relative;
          }
          .dkit-nav-header__desktop .dkit-nav-header__children {
            display: none;
            position: absolute;
            z-index: 40;
            top: 100%;
            left: 0;
            min-width: 10rem;
            padding: 0.4rem;
            padding-top: 0.55rem;
            border: 1px solid #ddd;
            border-radius: 0.375rem;
            background: #fff;
            box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
          }
          /* Hover bridge so the gap above the panel doesn't close the menu */
          .dkit-nav-header__desktop .dkit-nav-header__children::before {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            top: -0.5rem;
            height: 0.5rem;
          }
          .dkit-nav-header__desktop .dkit-nav-header__children a {
            display: block;
            padding: 0.4rem 0.55rem;
            border-radius: 0.25rem;
            white-space: nowrap;
          }
          .dkit-nav-header__desktop .dkit-nav-header__children a:hover {
            background: #f5f5f5;
            text-decoration: none;
          }
          .dkit-nav-header__desktop .dkit-nav-header__item--has-children:hover > .dkit-nav-header__children,
          .dkit-nav-header__desktop .dkit-nav-header__item--has-children:focus-within > .dkit-nav-header__children {
            display: block;
          }
        }
      `}</style>
      <div className="dkit-nav-header__desktop">
        <ItemList items={items} variant="desktop" />
      </div>
      <details className="dkit-nav-header__mobile">
        <summary>Menu</summary>
        <div className="dkit-nav-header__panel">
          <ItemList items={items} variant="mobile" />
        </div>
      </details>
    </nav>
  );
}
