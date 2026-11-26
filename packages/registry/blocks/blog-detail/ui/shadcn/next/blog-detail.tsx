import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPostBySlug,
  normalizeCategories,
} from "@/lib/dkit/blog";
import { moduleBasePath } from "@/lib/dkit/config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Uses your project's shadcn/ui components. */
export async function BlogDetail({
  slug,
  basePath = moduleBasePath("blog", "/blog"),
}: {
  slug: string;
  basePath?: string;
}) {
  const post = await getBlogPostBySlug(slug);
  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center text-muted-foreground">
        <p className="text-2xl font-semibold text-foreground">Post not found</p>
        <Button asChild variant="link" className="mt-4">
          <a href={basePath}>← Back to blog</a>
        </Button>
      </div>
    );
  }

  const name = authorName(post);
  const avatar = authorAvatarUrl(post);
  const categories = normalizeCategories(post.categories);
  const imageUrl = featuredImageUrl(post);

  return (
    <article className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <Button asChild variant="ghost" className="mb-10 px-0">
        <a href={basePath}>← All posts</a>
      </Button>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="mb-10 aspect-[16/9] w-full rounded-xl object-cover ring-1 ring-border"
        />
      ) : null}

      <header className="border-b border-border pb-10">
        {categories.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Badge key={c.id} variant="secondary">
                {c.title ?? c.slug}
              </Badge>
            ))}
          </div>
        ) : null}
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
          {post.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {name ? (
            <span className="inline-flex items-center gap-2 font-medium text-foreground">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-border"
                />
              ) : null}
              {name}
            </span>
          ) : null}
          {name && post.published_at ? <span aria-hidden>·</span> : null}
          {post.published_at ? (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          ) : null}
        </div>
      </header>

      {post.body ? (
        <div
          className="dkit-prose mt-10"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      ) : null}
    </article>
  );
}
