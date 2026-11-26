import { getBlogPosts } from "@/lib/dkit/blog";
import { joinModulePath, moduleBasePath } from "@/lib/dkit/config";

/** Minimal kit — semantic HTML only. */
export async function BlogList({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getBlogPosts();

  return (
    <section>
      <header>
        <h1>Blog</h1>
      </header>

      {posts.length === 0 ? (
        <p>No published posts yet.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <a href={joinModulePath(basePath, post.slug)}>{post.title}</a>
              {post.published_at ? (
                <>
                  {" "}
                  <time dateTime={post.published_at}>
                    {new Date(post.published_at).toLocaleDateString()}
                  </time>
                </>
              ) : null}
              {post.excerpt ? <p>{post.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
