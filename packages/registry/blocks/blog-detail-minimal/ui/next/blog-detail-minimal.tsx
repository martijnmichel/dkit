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
      fields: ["id", "title", "slug", "body", "published_at"],
      limit: 1,
    }),
  )) as BlogPost[];
  return rows[0] ?? null;
}

export async function BlogDetailMinimal({ slug }: { slug: string }) {
  const post = await getPost(slug);
  if (!post) {
    return <p className="p-8 text-neutral-500">Post not found.</p>;
  }

  return (
    <article className="mx-auto max-w-xl space-y-4 py-10">
      <h1 className="text-2xl font-semibold">{post.title}</h1>
      {post.published_at ? (
        <p className="text-xs text-neutral-400">
          {new Date(post.published_at).toLocaleDateString()}
        </p>
      ) : null}
      {post.body ? (
        <div
          className="text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      ) : null}
    </article>
  );
}
