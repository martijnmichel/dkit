import { getBlogPosts } from "@/lib/dkit/blog";
import { joinModulePath, moduleBasePath } from "@/lib/dkit/config";

/** Minimal kit — semantic HTML card list (no theme tokens). */
export async function BlogListCards({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getBlogPosts();

  return (
    <section>
      <header>
        <h1>Blog</h1>
        <p>Browse posts.</p>
      </header>

      {posts.length === 0 ? (
        <p>No published posts yet.</p>
      ) : (
        <div>
          {posts.map((post) => (
            <article key={post.id}>
              <h2>
                <a href={joinModulePath(basePath, post.slug)}>{post.title}</a>
              </h2>
              {post.published_at ? (
                <p>
                  <time dateTime={post.published_at}>
                    {new Date(post.published_at).toLocaleDateString()}
                  </time>
                </p>
              ) : null}
              {post.excerpt ? <p>{post.excerpt}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
