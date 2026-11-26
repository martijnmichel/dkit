import { SetupHint } from "../../_components/setup-hint";
import { Detail, installed } from "@/lib/dkit/entries/blog";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!installed) return <SetupHint />;
  return <Detail slug={slug} />;
}
