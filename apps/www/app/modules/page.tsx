import { StaticRedirect } from "@/components/static-redirect";
import { redirectMetadata } from "@/lib/seo";

export const metadata = redirectMetadata("/docs/modules/");

export default function ModulesRedirectPage() {
  return <StaticRedirect href="/docs/modules/" />;
}
