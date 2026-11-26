import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getPosts,
} from "@/lib/dkit/blog";
import { joinModulePath, moduleBasePath } from "@/lib/dkit/config";

/** Styled with shadcn theme tokens — inherits your app theme (Next shadcn/ui). */
export async function BlogList({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getPosts();

  return (
    <div className="relative mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <header className="mb-12 border-b border-border pb-10">
        <p className="mb-3 text-xs font-medium tracking-[0.2em] text-primary uppercase">
          Journal
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Blog
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          Stories and notes from Directus — newest first.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted/40 px-6 py-10 text-center text-muted-foreground">
          No published posts yet. Add one in Directus and refresh.
        </p>
      ) : (
        <ul className="space-y-1">
          {posts.map((post, i) => {
            const imageUrl = featuredImageUrl(post);
            const avatar = authorAvatarUrl(post);
            const name = authorName(post);
            return (
              <li key={post.id}>
                <a
                  href={joinModulePath(basePath, post.slug)}
                  className="group flex gap-5 rounded-xl px-4 py-5 transition-colors hover:bg-muted/60"
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt=""
                      className="mt-0.5 h-16 w-16 shrink-0 rounded-lg object-cover ring-1 ring-border"
                    />
                  ) : (
                    <span className="mt-1 w-8 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </span>
                    {post.excerpt ? (
                      <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </span>
                    ) : null}
                    <span className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {name ? (
                        <span className="inline-flex items-center gap-1.5">
                          {avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatar}
                              alt=""
                              className="h-5 w-5 rounded-full object-cover ring-1 ring-border"
                            />
                          ) : null}
                          <span>{name}</span>
                        </span>
                      ) : null}
                      {name && post.published_at ? <span aria-hidden>·</span> : null}
                      {post.published_at ? (
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </time>
                      ) : null}
                      <span className="ml-auto text-primary opacity-0 transition group-hover:opacity-100">
                        Read →
                      </span>
                    </span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
