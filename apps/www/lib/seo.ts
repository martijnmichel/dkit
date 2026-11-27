import type { Metadata } from "next";

export const SITE = {
  name: "dkit",
  url: "https://dkit.run",
  tagline: "The foundation for your Directus projects",
  description:
    "Composable schema, access, services, and UI for Next.js. Install Directus modules into your repo as code you own.",
  locale: "en_US",
  github: "https://github.com/martijnmichel/dkit",
} as const;

export function absoluteUrl(path = "/"): string {
  const base = SITE.url.replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return normalized.endsWith("/")
    ? `${base}${normalized}`
    : `${base}${normalized}/`;
}

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  /** Use the full string as document title (home). Default: title + " — dkit" via template. */
  absoluteTitle?: boolean;
  noIndex?: boolean;
  type?: "website" | "article";
};

/** Shared Next Metadata for indexable pages (canonical, OG, Twitter). */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  noIndex,
  type = "website",
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  const ogTitle = absoluteTitle ? title : `${title} — ${SITE.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      type,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/** Metadata for legacy redirect routes — keep them out of the index. */
export function redirectMetadata(toPath: string): Metadata {
  return {
    title: "Redirect",
    robots: { index: false, follow: true },
    alternates: { canonical: absoluteUrl(toPath) },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        name: SITE.name,
        url: SITE.url,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/dkit-mark.svg"),
        },
        sameAs: [SITE.github],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        description: SITE.description,
        publisher: { "@id": `${SITE.url}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE.url}/#software`,
        name: SITE.name,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        url: SITE.url,
        description: SITE.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        downloadUrl: SITE.github,
      },
    ],
  };
}

export function breadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function webPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${SITE.url}/#website` },
    inLanguage: "en",
  };
}

export function moduleJsonLd({
  id,
  title,
  description,
}: {
  id: string;
  title: string;
  description: string;
}) {
  const path = `/docs/modules/${id}/`;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: title,
    description,
    url: absoluteUrl(path),
    codeRepository: SITE.github,
    programmingLanguage: ["TypeScript", "JavaScript"],
    runtimePlatform: ["Next.js", "Directus"],
    isPartOf: { "@id": `${SITE.url}/#software` },
  };
}
