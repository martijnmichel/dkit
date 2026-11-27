import { StaticRedirect } from "@/components/static-redirect";
import { getRegistry } from "@/lib/registry";
import { redirectMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getRegistry()
    .items.filter((i) => i.type === "dkit:module")
    .map((i) => ({ id: i.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return redirectMetadata(`/docs/modules/${id}/`);
}

export default async function ModuleRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StaticRedirect href={`/docs/modules/${id}/`} />;
}
