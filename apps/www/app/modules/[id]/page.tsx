import { StaticRedirect } from "@/components/static-redirect";
import { getRegistry } from "@/lib/registry";

export function generateStaticParams() {
  return getRegistry()
    .items.filter((i) => i.type === "dkit:module")
    .map((i) => ({ id: i.id }));
}

export default async function ModuleRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StaticRedirect href={`/docs/modules/${id}/`} />;
}
