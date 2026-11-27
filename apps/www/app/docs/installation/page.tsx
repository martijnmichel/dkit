import { StaticRedirect } from "@/components/static-redirect";
import { redirectMetadata } from "@/lib/seo";

export const metadata = redirectMetadata("/docs/getting-started/");

export default function InstallationRedirectPage() {
  return <StaticRedirect href="/docs/getting-started/" />;
}
