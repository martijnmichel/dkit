import { createDirectus, readItems, rest } from "@directus/sdk";
import type { BlogPost } from "@/lib/dkit/blog";
import { collections, moduleBasePath } from "@/lib/dkit/config";

async function getPosts(): Promise<BlogPost[]> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return [];
  const client = createDirectus(url).with(rest());
  return client.request(
    readItems(collections.posts, {
      filter: { status: { _eq: "published" } },
      fields: [
        "id",
        "title",
        "slug",
        "excerpt",
        "published_at",
        { author: ["id", "name", "slug"] },
      ],
      sort: ["-published_at"],
    }),
  ) as Promise<BlogPost[]>;
}

export async function BlogListCards({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-5xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <a
            key={post.id}
            href={`${basePath}/${post.slug}`}
            className="rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400 dark:border-neutral-800"
          >
            <h2 className="text-lg font-medium">{post.title}</h2>
            {post.excerpt ? (
              <p className="mt-2 line-clamp-3 text-sm text-neutral-500">
                {post.excerpt}
              </p>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  );
}
