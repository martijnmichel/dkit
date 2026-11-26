import { createDirectus, readItems, rest } from "@directus/sdk";
import type { BlogPost } from "@/lib/dkit/blog";
import { collections } from "@/lib/dkit/config";

async function getPost(slug: string): Promise<BlogPost | null> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  const client = createDirectus(url).with(rest());
  const rows = (await client.request(
    readItems(collections.posts, {
      filter: {
        _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
      },
      fields: [
        "id",
        "title",
        "slug",
        "body",
        "published_at",
        { author: ["id", "name", "slug"] },
        { categories: ["id", "title", "slug"] },
      ],
      limit: 1,
    }),
  )) as BlogPost[];
  return rows[0] ?? null;
}

export async function BlogDetail({ slug }: { slug: string }) {
  const post = await getPost(slug);
  if (!post) {
    return (
      <div className="mx-auto max-w-2xl py-10 text-neutral-500">
        Post not found.
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl space-y-6 py-10">
      <header className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">{post.title}</h1>
        <p className="text-sm text-neutral-500">
          {typeof post.author === "object" && post.author?.name
            ? post.author.name
            : null}
          {post.published_at
            ? ` · ${new Date(post.published_at).toLocaleDateString()}`
            : null}
        </p>
      </header>
      {post.body ? (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      ) : null}
    </article>
  );
}
