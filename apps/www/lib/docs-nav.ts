export type DocsNavLink = {
  href: string;
  title: string;
  description?: string;
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
  },
  {
    href: "/docs/cli/",
    title: "CLI reference",
    description: "init, add, list, doctor",
  },
  {
    href: "/docs/services/",
    title: "Services",
    description: "Fetch helpers in lib/dkit",
  },
  {
    href: "/docs/ui-kits/",
    title: "UI kits",
    description: "shadcn, minimal, themes",
  },
  {
    href: "/docs/mcp/",
    title: "MCP server",
    description: "Agent tooling for dkit",
  },
];

export function docsNavSections(
  modules: Array<{ id: string; title: string }>,
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
        },
        ...modules.map((m) => ({
          href: `/docs/modules/${m.id}/`,
          title: m.title,
          description: m.id,
        })),
      ],
    },
  ];
}
