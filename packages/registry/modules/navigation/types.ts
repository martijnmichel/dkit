export type NavMenu = {
  id: string;
  status: "published" | "draft" | "archived";
  name: string;
  key: string;
  description?: string | null;
};

export type NavItem = {
  id: string;
  status: "published" | "draft" | "archived";
  menu?: string | NavMenu | null;
  parent?: string | NavItem | null;
  label: string;
  href: string;
  open_in_new_tab?: boolean | null;
  sort?: number | null;
  children?: NavItem[];
};

/** Menu + nested items tree returned by getNavMenuByKey. */
export type NavMenuTree = {
  id: string;
  key: string;
  name: string;
  items: NavItem[];
};

export type GetNavMenusOptions = {
  /** Directus status filter. Default `"published"`. Pass `null` to skip. */
  status?: string | null;
  limit?: number;
  sort?: string[];
};

export type GetNavMenuByKeyOptions = {
  status?: string | null;
};

export type GetNavItemsOptions = {
  status?: string | null;
  /** When true, return a nested tree (default). Flat list when false. */
  tree?: boolean;
};
