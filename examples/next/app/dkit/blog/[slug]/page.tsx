import { Detail, installed } from "@/components/dkit/blog";

export default async function DkitBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!installed) {
    return <p>Run <code>dkit add blog</code> to install UI.</p>;
  }
  return <Detail slug={slug} />;
}
