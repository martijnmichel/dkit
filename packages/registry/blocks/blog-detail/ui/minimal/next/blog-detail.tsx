import { getBlogPostBySlug } from "@/lib/dkit/blog";

/** Minimal kit — semantic HTML + dkit-prose only. */
export async function BlogDetail({ slug }: { slug: string }) {
  const post = await getBlogPostBySlug(slug);
  if (!post) return <p>Post not found.</p>;

  return (
    <article>
      <h1>{post.title}</h1>
      {post.published_at ? (
        <p>
          <time dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString()}
          </time>
        </p>
      ) : null}
      {post.body ? (
        <div
          className="dkit-prose dkit-prose--compact"
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      ) : null}
    </article>
  );
}
