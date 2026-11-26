import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getPost,
  normalizeCategories,
} from "@/lib/dkit/blog";
import { moduleBasePath } from "@/lib/dkit/config";

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
      <div className="mx-auto max-w-2xl px-6 py-20 text-center text-stone-500">
        <p className="font-serif text-2xl text-stone-800 dark:text-stone-200">
          Post not found
        </p>
        <a
          href={basePath}
          className="mt-4 inline-block text-sm text-teal-800 underline-offset-4 hover:underline dark:text-teal-300"
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
        className="mb-10 inline-flex items-center gap-2 text-sm text-stone-500 no-underline transition hover:text-teal-800 dark:hover:text-teal-300"
      >
        ← All posts
      </a>

      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="mb-10 aspect-[16/9] w-full rounded-3xl object-cover ring-1 ring-stone-200 dark:ring-stone-800"
        />
      ) : null}

      <header className="border-b border-stone-200 pb-10 dark:border-stone-800">
        {categories.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900 dark:bg-teal-950 dark:text-teal-200"
              >
                {c.title ?? c.slug}
              </span>
            ))}
          </div>
        ) : null}
        <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
          {post.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-stone-500">
          {name ? (
            <span className="inline-flex items-center gap-2 font-medium text-stone-700 dark:text-stone-300">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
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
          className="mt-10 space-y-4 text-[1.05rem] leading-8 text-stone-700 [&_a]:text-teal-800 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-teal-700/40 [&_blockquote]:pl-4 [&_blockquote]:text-stone-500 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:text-stone-900 [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 dark:text-stone-300 dark:[&_a]:text-teal-300 dark:[&_h2]:text-stone-50"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      ) : null}
    </article>
  );
}
