import {
  getNavMenuByKey,
  type NavItem,
} from "@/lib/dkit/navigation";
import { NavHeaderClient } from "./nav-header-client";

/** Primary nav only — compose with SiteBrand / SocialLinks yourself. */
export async function NavHeader({ menuKey = "primary" }: { menuKey?: string }) {
  const menu = await getNavMenuByKey(menuKey);
  const items: NavItem[] = menu?.items ?? [];
  return <NavHeaderClient items={items} />;
}
