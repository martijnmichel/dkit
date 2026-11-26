import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getPost,
  normalizeCategories,
} from "@/lib/dkit/blog";
import { moduleBasePath } from "@/lib/dkit/config";

/** Styled with shadcn theme tokens — inherits your app theme (Next shadcn/ui). */
export async function BlogDetail({
  slug,
  basePath = moduleBasePath("blog", "/blog"),
}: {
  slug: string;
  basePath?: string;
}) {
  const post = await getPost(slug);
  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center text-muted-foreground">
        <p className="text-2xl font-semibold text-foreground">Post not found</p>
        <a
          href={basePath}
          className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          ← Back to blog
        </a>
      </div>
    );
  }

  const name = authorName(post);
  const avatar = authorAvatarUrl(post);
  const categories = normalizeCategories(post.categories);
  const imageUrl = featuredImageUrl(post);

  return (
    <article className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <a
        href={basePath}
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground no-underline transition-colors hover:text-primary"
      >
        ← All posts
      </a>

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
              <span
                key={c.id}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {c.title ?? c.slug}
              </span>
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
