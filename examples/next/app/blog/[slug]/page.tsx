import fs from "node:fs";
import path from "node:path";
import { SetupHint } from "../../_components/setup-hint";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const full = path.join(
    process.cwd(),
    "components/dkit/blog-detail/blog-detail.tsx",
  );
  const minimal = path.join(
    process.cwd(),
    "components/dkit/blog-detail-minimal/blog-detail-minimal.tsx",
  );

  if (fs.existsSync(full)) {
    const { BlogDetail } = await import(
      "@/components/dkit/blog-detail/blog-detail"
    );
    return <BlogDetail slug={slug} />;
  }
  if (fs.existsSync(minimal)) {
    const { BlogDetailMinimal } = await import(
      "@/components/dkit/blog-detail-minimal/blog-detail-minimal"
    );
    return <BlogDetailMinimal slug={slug} />;
  }
  return <SetupHint />;
}
