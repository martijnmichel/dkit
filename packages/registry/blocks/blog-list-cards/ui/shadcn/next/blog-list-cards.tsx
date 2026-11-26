import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPosts,
} from "@/lib/dkit/blog";
import { joinModulePath, moduleBasePath } from "@/lib/dkit/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/** Uses your project's shadcn/ui components. */
export async function BlogListCards({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getBlogPosts();

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
          No posts yet.
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
                className="group block no-underline transition hover:-translate-y-0.5"
              >
                <Card className="h-full overflow-hidden pt-0 pb-6 shadow-sm transition group-hover:border-primary/40 group-hover:shadow-md">
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
                  <CardHeader>
                    {post.published_at ? (
                      <CardDescription>
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </time>
                      </CardDescription>
                    ) : null}
                    <CardTitle className="text-2xl transition-colors group-hover:text-primary">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  {post.excerpt ? (
                    <CardContent>
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                    </CardContent>
                  ) : null}
                  <CardFooter className="justify-between gap-3">
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
                  </CardFooter>
                </Card>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
