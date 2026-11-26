import { createDirectus, readItems, rest } from "@directus/sdk";
import type { BlogPost } from "@/lib/dkit/blog";

async function getPosts(): Promise<BlogPost[]> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return [];
  const client = createDirectus(url).with(rest());
  return client.request(
    readItems("posts", {
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

export async function BlogList({
  basePath = "/blog",
}: {
  basePath?: string;
}) {
  const posts = await getPosts();

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-2 text-neutral-500">Published posts from Directus.</p>
      </header>
      <ul className="space-y-6">
        {posts.map((post) => (
          <li key={post.id} className="border-b border-neutral-200 pb-6 dark:border-neutral-800">
            <a href={`${basePath}/${post.slug}`} className="group block">
              <h2 className="text-xl font-medium group-hover:underline">{post.title}</h2>
              {post.excerpt ? (
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">{post.excerpt}</p>
              ) : null}
              <p className="mt-2 text-sm text-neutral-400">
                {typeof post.author === "object" && post.author?.name
                  ? post.author.name
                  : null}
                {post.published_at
                  ? ` · ${new Date(post.published_at).toLocaleDateString()}`
                  : null}
              </p>
            </a>
          </li>
        ))}
        {posts.length === 0 ? (
          <li className="text-neutral-500">No published posts yet.</li>
        ) : null}
      </ul>
    </div>
  );
}
