import {
  getNavMenuByKey,
  navLinkProps,
  type NavItem,
} from "@/lib/dkit/navigation";
import { loadSoftBrand, softSocialLabel, type SoftSocialLink } from "./soft-brand";

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

/** Site footer — footer menu + optional settings brand/contact/socials. */
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
  let socials: SoftSocialLink[] = [];

  if (brandName === undefined || contactEmail === undefined) {
    const soft = await loadSoftBrand();
    if (brandName === undefined) name = soft?.name;
    if (contactEmail === undefined) email = soft?.contactEmail ?? null;
    socials = (soft?.socialLinks ?? []).filter(
      (s) => typeof s.href === "string" && s.href.trim(),
    );
  }

  const title = name?.trim();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            {title ? (
              <p className="text-sm font-semibold tracking-tight text-foreground">
                {title}
              </p>
            ) : null}
            {email ? (
              <a
                href={`mailto:${email}`}
                className="block text-sm text-muted-foreground hover:text-foreground"
              >
                {email}
              </a>
            ) : null}
          </div>
          <nav aria-label="Footer">
            <FooterLinks items={items} />
          </nav>
        </div>
        {socials.length > 0 ? (
          <ul className="flex flex-wrap gap-4">
            {socials.map((s) => (
              <li key={`${s.platform ?? "link"}-${s.href}`}>
                <a
                  href={s.href}
                  target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    s.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  data-platform={s.platform}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {softSocialLabel(s)}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="text-xs text-muted-foreground">
          © {year}
          {title ? ` ${title}` : ""}
        </p>
      </div>
    </footer>
  );
}
