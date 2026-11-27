import {
  getNavMenuByKey,
  type NavItem,
} from "@/lib/dkit/navigation";
import { NavHeaderClient } from "./nav-header-client";
import { loadSoftBrand } from "./soft-brand";

export async function NavHeader({
  menuKey = "primary",
  brandName,
  logoUrl,
  homeHref = "/",
}: {
  menuKey?: string;
  /** Override brand name (skips soft settings lookup when set). */
  brandName?: string;
  /** Override logo URL. */
  logoUrl?: string | null;
  homeHref?: string;
}) {
  const menu = await getNavMenuByKey(menuKey);
  const items: NavItem[] = menu?.items ?? [];

  let name = brandName;
  let logo = logoUrl;
  if (brandName === undefined || logoUrl === undefined) {
    const soft = await loadSoftBrand();
    if (brandName === undefined) name = soft?.name;
    if (logoUrl === undefined) logo = soft?.logoUrl ?? null;
  }

  return (
    <NavHeaderClient
      items={items}
      brandName={name}
      logoUrl={logo}
      homeHref={homeHref}
    />
  );
}
