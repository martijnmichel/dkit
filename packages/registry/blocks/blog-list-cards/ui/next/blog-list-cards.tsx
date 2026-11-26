import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getPosts,
} from "@/lib/dkit/blog";
import { joinModulePath, moduleBasePath } from "@/lib/dkit/config";

/** Styled with shadcn theme tokens — inherits your app theme (Next shadcn/ui). */
export async function BlogListCards({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <header className="mb-12 max-w-xl">
        <p className="mb-3 text-xs font-medium tracking-[0.2em] text-primary uppercase">
          Journal
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Blog
        </h1>
        <p className="mt-4 text-muted-foreground">Browse posts in a card grid.</p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted-foreground">
          No published posts yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => {
            const imageUrl = featuredImageUrl(post);
            const name = authorName(post);
            const avatar = authorAvatarUrl(post);
            return (
              <a
                key={post.id}
                href={joinModulePath(basePath, post.slug)}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-muted" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-primary transition group-hover:scale-x-100" />
                  {post.published_at ? (
                    <time
                      dateTime={post.published_at}
                      className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                    >
                      {new Date(post.published_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  ) : null}
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    {name ? (
                      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatar}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
                          />
                        ) : null}
                        {name}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-sm font-medium text-primary">
                      Read article →
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
