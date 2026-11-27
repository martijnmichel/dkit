export type DocsNavIcon =
  | "rocket"
  | "terminal"
  | "library"
  | "palette"
  | "bot"
  | "module";

export type DocsNavLink = {
  href: string;
  title: string;
  description?: string;
  icon?: DocsNavIcon;
  /** Directus Material Symbol when icon === "module" */
  directusIcon?: string;
};

export type DocsNavSection = {
  title: string;
  items: DocsNavLink[];
};

export const DOCS_GUIDES: DocsNavLink[] = [
  {
    href: "/docs/getting-started/",
    title: "Getting started",
    description: "From empty folder to first module",
    icon: "rocket",
  },
  {
    href: "/docs/cli/",
    title: "CLI reference",
    description: "init, add, list, doctor",
    icon: "terminal",
  },
  {
    href: "/docs/services/",
    title: "Services",
    description: "Fetch helpers in lib/dkit",
    icon: "library",
  },
  {
    href: "/docs/ui-kits/",
    title: "UI kits",
    description: "shadcn, minimal, themes",
    icon: "palette",
  },
  {
    href: "/docs/mcp/",
    title: "MCP server",
    description: "Agent tooling for dkit",
    icon: "bot",
  },
];

export function docsNavSections(
  modules: Array<{ id: string; title: string; icon?: string }>,
): DocsNavSection[] {
  return [
    { title: "Guides", items: DOCS_GUIDES },
    {
      title: "Modules",
      items: [
        {
          href: "/docs/modules/",
          title: "Overview",
          description: "Browse installable modules",
          icon: "module",
          // Material Symbol — same family as per-module icons below
          directusIcon: "widgets",
        },
        ...modules.map((m) => ({
          href: `/docs/modules/${m.id}/`,
          title: m.title,
          description: m.id,
          icon: "module" as const,
          directusIcon: m.icon,
        })),
      ],
    },
  ];
}
