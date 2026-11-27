import {
  dkitQueryFailed,
  getDirectus,
  readItem,
  readItems,
} from "@/lib/dkit/client";
import { collections } from "@/lib/dkit/config";
import type {
  GetNavItemsOptions,
  GetNavMenuByKeyOptions,
  GetNavMenusOptions,
  NavItem,
  NavMenu,
  NavMenuTree,
} from "./types";

export type {
  GetNavItemsOptions,
  GetNavMenuByKeyOptions,
  GetNavMenusOptions,
  NavItem,
  NavMenu,
  NavMenuTree,
} from "./types";

const MENU_FIELDS = [
  "id",
  "status",
  "name",
  "key",
  "description",
] as const;

const ITEM_FIELDS = [
  "id",
  "status",
  "label",
  "href",
  "open_in_new_tab",
  "sort",
  "parent",
  { menu: ["id", "key", "name", "status"] },
] as const;

function statusFilter(status: string | null | undefined) {
  if (status === null) return undefined;
  return { status: { _eq: status ?? "published" } };
}

/** Directus rejects `limit=undefined` — only send a finite number. */
function queryLimit(limit: number | undefined): number | undefined {
  return typeof limit === "number" && Number.isFinite(limit) ? limit : undefined;
}

function parentId(item: NavItem): string | null {
  if (!item.parent) return null;
  if (typeof item.parent === "string") return item.parent;
  return item.parent.id ?? null;
}

function sortItems(a: NavItem, b: NavItem): number {
  return (a.sort ?? 0) - (b.sort ?? 0);
}

/** Build a 2-level (practical) tree from a flat item list. */
export function buildNavTree(items: NavItem[]): NavItem[] {
  const byId = new Map<string, NavItem>();
  for (const item of items) {
    byId.set(item.id, { ...item, children: [] });
  }
  const roots: NavItem[] = [];
  for (const item of byId.values()) {
    const pid = parentId(item);
    if (pid && byId.has(pid)) {
      byId.get(pid)!.children!.push(item);
    } else {
      roots.push(item);
    }
  }
  for (const node of byId.values()) {
    node.children?.sort(sortItems);
  }
  return roots.sort(sortItems);
}

export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

export function navLinkProps(item: Pick<NavItem, "href" | "open_in_new_tab">): {
  href: string;
  target?: "_blank";
  rel?: string;
} {
  const external = isExternalHref(item.href) || Boolean(item.open_in_new_tab);
  return {
    href: item.href,
    ...(external ? { target: "_blank" as const, rel: "noopener noreferrer" } : {}),
  };
}

export async function getNavMenus(
  options: GetNavMenusOptions = {},
): Promise<NavMenu[]> {
  const client = getDirectus();
  if (!client) return [];
  if (!collections.nav_menus) {
    dkitQueryFailed(
      'collections.nav_menus missing from lib/dkit/config — re-run `dkit add navigation`',
    );
    return [];
  }
  const limit = queryLimit(options.limit);
  try {
    return await client.request(
      readItems(collections.nav_menus, {
        filter: statusFilter(options.status),
        fields: [...MENU_FIELDS],
        sort: options.sort ?? ["name"],
        ...(limit !== undefined ? { limit } : {}),
      }),
    );
  } catch (err) {
    dkitQueryFailed(
      `getNavMenus failed (collection=${collections.nav_menus})`,
      err,
    );
    return [];
  }
}

export async function getNavMenuById(id: string): Promise<NavMenu | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.nav_menus) return null;
  try {
    return await client.request(
      readItem(collections.nav_menus, id, {
        fields: [...MENU_FIELDS],
      }),
    );
  } catch (err) {
    dkitQueryFailed(`getNavMenuById(${id}) failed`, err);
    return null;
  }
}

/**
 * Load a menu by key (`primary`, `footer`, …) with nested items.
 * Soft-fails to null when missing or Directus is down.
 */
export async function getNavMenuByKey(
  key: string,
  options: GetNavMenuByKeyOptions = {},
): Promise<NavMenuTree | null> {
  const client = getDirectus();
  if (!client) return null;
  if (!collections.nav_menus || !collections.nav_items) {
    dkitQueryFailed("collections.nav_menus / nav_items missing from config");
    return null;
  }
  const status = statusFilter(options.status);
  const menuAnd: Record<string, unknown>[] = [{ key: { _eq: key } }];
  if (status) menuAnd.unshift(status);

  try {
    const menus = await client.request(
      readItems(collections.nav_menus, {
        filter: { _and: menuAnd },
        fields: [...MENU_FIELDS],
        limit: 1,
      }),
    );
    const menu = menus[0];
    if (!menu) return null;

    const itemAnd: Record<string, unknown>[] = [
      { menu: { _eq: menu.id } },
    ];
    if (status) itemAnd.unshift(status);

    const items = await client.request(
      readItems(collections.nav_items, {
        filter: { _and: itemAnd },
        fields: [...ITEM_FIELDS],
        sort: ["sort"],
        limit: -1,
      }),
    );

    return {
      id: menu.id,
      key: menu.key,
      name: menu.name,
      items: buildNavTree(items),
    };
  } catch (err) {
    dkitQueryFailed(`getNavMenuByKey(${key}) failed`, err);
    return null;
  }
}

/**
 * Items for a menu key. Default returns a nested tree; pass `{ tree: false }` for flat.
 */
export async function getNavItems(
  key: string,
  options: GetNavItemsOptions = {},
): Promise<NavItem[]> {
  const tree = await getNavMenuByKey(key, { status: options.status });
  if (!tree) return [];
  if (options.tree === false) {
    const flat: NavItem[] = [];
    const walk = (nodes: NavItem[]) => {
      for (const n of nodes) {
        flat.push(n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(tree.items);
    return flat;
  }
  return tree.items;
}
