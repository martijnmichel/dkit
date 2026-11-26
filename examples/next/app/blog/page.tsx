import fs from "node:fs";
import path from "node:path";
import { SetupHint } from "../_components/setup-hint";

export default async function BlogPage() {
  const file = path.join(
    process.cwd(),
    "components/dkit/blog-list/blog-list.tsx",
  );
  const cards = path.join(
    process.cwd(),
    "components/dkit/blog-list-cards/blog-list-cards.tsx",
  );

  if (fs.existsSync(file)) {
    const { BlogList } = await import("@/components/dkit/blog-list/blog-list");
    return <BlogList />;
  }
  if (fs.existsSync(cards)) {
    const { BlogListCards } = await import(
      "@/components/dkit/blog-list-cards/blog-list-cards"
    );
    return <BlogListCards />;
  }
  return <SetupHint />;
}
