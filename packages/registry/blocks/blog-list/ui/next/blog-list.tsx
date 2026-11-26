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

function authorName(post: BlogPost): string | null {
  return typeof post.author === "object" && post.author?.name
    ? post.author.name
    : null;
}

function authorAvatarUrl(post: BlogPost): string | null {
  if (typeof post.author !== "object" || !post.author) return null;
  const id = directusFileId(post.author.avatar);
  return id ? directusAssetUrl(id) : null;
}

export async function BlogList({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getPosts();

  return (
    <div className="relative mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <header className="mb-12 border-b border-stone-200 pb-10 dark:border-stone-800">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-teal-800 uppercase dark:text-teal-300">
          Journal
        </p>
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
          Blog
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-stone-500 dark:text-stone-400">
          Stories and notes from Directus — newest first.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center text-stone-500 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-400">
          No published posts yet. Add one in Directus and refresh.
        </p>
      ) : (
        <ul className="space-y-2">
          {posts.map((post, i) => {
            const imageId = directusFileId(post.featured_image);
            const imageUrl = imageId ? directusAssetUrl(imageId) : null;
            return (
              <li key={post.id}>
                <a
                  href={`${basePath}/${post.slug}`}
                  className="group flex gap-5 rounded-2xl px-4 py-5 transition hover:bg-stone-100/80 dark:hover:bg-stone-900/60"
                >
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt=""
                      className="mt-0.5 h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                    />
                  ) : (
                    <span className="mt-1 w-8 shrink-0 font-mono text-xs text-stone-400 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-xl tracking-tight text-stone-900 transition group-hover:text-teal-800 dark:text-stone-50 dark:group-hover:text-teal-300">
                      {post.title}
                    </span>
                    {post.excerpt ? (
                      <span className="mt-2 block text-sm leading-relaxed text-stone-500 dark:text-stone-400">
                        {post.excerpt}
                      </span>
                    ) : null}
                    <span className="mt-3 flex flex-wrap items-center gap-x-2 text-xs text-stone-400">
                      {authorName(post) ? (
                        <span className="inline-flex items-center gap-1.5">
                          {authorAvatarUrl(post) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={authorAvatarUrl(post)!}
                              alt=""
                              className="h-5 w-5 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                            />
                          ) : null}
                          <span>{authorName(post)}</span>
                        </span>
                      ) : null}
                      {authorName(post) && post.published_at ? (
                        <span aria-hidden>·</span>
                      ) : null}
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
                      <span className="ml-auto text-teal-800 opacity-0 transition group-hover:opacity-100 dark:text-teal-300">
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
