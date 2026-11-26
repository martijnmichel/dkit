import { getPost } from "@/lib/dkit/blog";

export async function BlogDetailMinimal({ slug }: { slug: string }) {
  const post = await getPost(slug);
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
        <div dangerouslySetInnerHTML={{ __html: post.body }} />
      ) : null}
    </article>
  );
}
