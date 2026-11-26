import Script from "next/script";

const SCRIPT_URL =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ??
  "https://analytics.kurbo.dev/script.js";
const WEBSITE_ID =
  process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ??
  "5c426473-3bf1-49eb-abab-f5f0c7e57a25";

/** Umami pageviews — production only. */
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  if (!WEBSITE_ID) return null;

  return (
    <Script
      src={SCRIPT_URL}
      data-website-id={WEBSITE_ID}
      strategy="afterInteractive"
      defer
    />
  );
}
