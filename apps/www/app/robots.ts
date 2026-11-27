import { absoluteUrl, SITE } from "@/lib/seo";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/modules/", "/docs/installation/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml").replace(/\/$/, ""),
    host: SITE.url,
  };
}
