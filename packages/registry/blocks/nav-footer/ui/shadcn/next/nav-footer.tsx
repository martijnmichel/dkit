import {
  getNavMenuByKey,
  navLinkProps,
  type NavItem,
} from "@/lib/dkit/navigation";

function FooterLinks({ items }: { items: NavItem[] }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {items.map((item) => {
        const link = navLinkProps(item);
        return (
          <li key={item.id}>
            <a
              {...link}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
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
    <nav aria-label="Footer" className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-8 sm:px-6">
        <FooterLinks items={items} />
      </div>
    </nav>
  );
}
