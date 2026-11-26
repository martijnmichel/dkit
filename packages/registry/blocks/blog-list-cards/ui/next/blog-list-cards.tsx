import { createDirectus, readItems, rest } from "@directus/sdk";
import type { BlogPost } from "@/lib/dkit/blog";
import { directusAssetUrl, directusFileId } from "@/lib/dkit/blog";
import { collections, moduleBasePath } from "@/lib/dkit/config";

async function getPosts(): Promise<BlogPost[]> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return [];
  try {
    const client = createDirectus(url).with(rest());
    return (await client.request(
      readItems(collections.posts, {
        filter: { status: { _eq: "published" } },
        fields: [
          "id",
          "title",
          "slug",
          "excerpt",
          "published_at",
          "featured_image",
          { author: ["id", "name", "slug", "avatar"] },
        ],
        sort: ["-published_at"],
      }),
    )) as BlogPost[];
  } catch {
    return [];
  }
}

export async function BlogListCards({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <header className="mb-12 max-w-xl">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-teal-800 uppercase dark:text-teal-300">
          Journal
        </p>
        <h1 className="font-serif text-4xl tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
          Blog
        </h1>
        <p className="mt-4 text-stone-500 dark:text-stone-400">
          Browse posts in a card grid.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center text-stone-500 dark:border-stone-700">
          No published posts yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => {
            const imageId = directusFileId(post.featured_image);
            const imageUrl = imageId ? directusAssetUrl(imageId) : null;
            const author =
              typeof post.author === "object" && post.author?.name
                ? post.author
                : null;
            const authorAvatar = author
              ? (() => {
                  const id = directusFileId(author.avatar);
                  return id ? directusAssetUrl(id) : null;
                })()
              : null;
            return (
              <a
                key={post.id}
                href={`${basePath}/${post.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_1px_0_rgba(28,25,23,0.04)] transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:shadow-md dark:border-stone-800 dark:bg-stone-950"
              >
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div className="aspect-[16/9] w-full bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-900 dark:to-stone-800" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-teal-700 transition group-hover:scale-x-100" />
                  {post.published_at ? (
                    <time
                      dateTime={post.published_at}
                      className="text-xs font-medium tracking-wide text-stone-400 uppercase"
                    >
                      {new Date(post.published_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                  ) : null}
                  <h2 className="mt-3 font-serif text-2xl tracking-tight text-stone-900 transition group-hover:text-teal-800 dark:text-stone-50 dark:group-hover:text-teal-300">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                      {post.excerpt}
                    </p>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <div className="mt-6 flex items-center justify-between gap-3">
                    {author ? (
                      <span className="inline-flex items-center gap-2 text-xs text-stone-500">
                        {authorAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={authorAvatar}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                          />
                        ) : null}
                        {author.name}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-sm font-medium text-teal-800 dark:text-teal-300">
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
