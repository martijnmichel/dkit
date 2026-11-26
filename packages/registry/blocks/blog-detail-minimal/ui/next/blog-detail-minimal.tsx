import { createDirectus, readItems, rest } from "@directus/sdk";
import type { BlogPost } from "@/lib/dkit/blog";
import { directusAssetUrl, directusFileId } from "@/lib/dkit/blog";
import { collections } from "@/lib/dkit/config";

/**
 * Unstyled / bare markup template — no design system classes.
 * Use when you want to bring your own styles.
 */
async function getPost(slug: string): Promise<BlogPost | null> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  try {
    const client = createDirectus(url).with(rest());
    const rows = (await client.request(
      readItems(collections.posts, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
        fields: ["id", "title", "slug", "body", "published_at", "featured_image"],
        limit: 1,
      }),
    )) as BlogPost[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function BlogDetailMinimal({ slug }: { slug: string }) {
  const post = await getPost(slug);
  if (!post) {
    return <p>Post not found.</p>;
  }

  const imageId = directusFileId(post.featured_image);
  const imageUrl = imageId ? directusAssetUrl(imageId) : null;

  return (
    <article>
      {imageUrl ? <img src={imageUrl} alt="" /> : null}
      <h1>{post.title}</h1>
      {post.published_at ? (
        <p>
          <time dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString()}
          </time>
        </p>
      ) : null}
      {post.body ? (
        <div dangerouslySetInnerHTML={{ __html: post.body }} />
      ) : null}
    </article>
  );
}
