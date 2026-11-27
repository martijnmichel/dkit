import { DOCS_GUIDES } from "@/lib/docs-nav";
import { getRegistry } from "@/lib/registry";
import { absoluteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const modules = getRegistry().items.filter((i) => i.type === "dkit:module");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/docs/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/docs/modules/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/privacy/"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...DOCS_GUIDES.map((g) => ({
      url: absoluteUrl(g.href),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];

  const moduleRoutes: MetadataRoute.Sitemap = modules.map((m) => ({
    url: absoluteUrl(`/docs/modules/${m.id}/`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...moduleRoutes];
}
