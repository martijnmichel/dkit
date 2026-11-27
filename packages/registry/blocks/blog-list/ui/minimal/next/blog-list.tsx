import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPosts,
} from "@/lib/dkit/blog";
import { joinModulePath, moduleBasePath } from "@/lib/dkit/config";

/** Minimal kit — semantic HTML + small inlined layout CSS (no Tailwind). */
export async function BlogList({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getBlogPosts();

  return (
    <section>
      <style>{`
        .dkit-blog-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .dkit-blog-list > li {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #ddd;
        }
        .dkit-blog-list > li:last-child {
          border-bottom: 0;
        }
        .dkit-blog-list__thumb {
          flex: 0 0 auto;
          width: 7.5rem;
          height: 7.5rem;
          object-fit: cover;
        }
        .dkit-blog-list__body {
          min-width: 0;
          flex: 1;
        }
        .dkit-blog-list__title {
          margin: 0 0 0.25rem;
          font-size: 1.25rem;
        }
        .dkit-blog-list__meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin: 0.5rem 0 0;
          font-size: 0.875rem;
        }
        .dkit-blog-list__avatar {
          width: 1.25rem;
          height: 1.25rem;
          border-radius: 9999px;
          object-fit: cover;
          vertical-align: middle;
        }
        .dkit-blog-list__excerpt {
          margin: 0.5rem 0 0;
        }
      `}</style>

      <header>
        <h1>Blog</h1>
      </header>

      {posts.length === 0 ? (
        <p>No published posts yet.</p>
      ) : (
        <ul className="dkit-blog-list">
          {posts.map((post) => {
            const imageUrl = featuredImageUrl(post);
            const name = authorName(post);
            const avatar = authorAvatarUrl(post);
            return (
              <li key={post.id}>
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    className="dkit-blog-list__thumb"
                    src={imageUrl}
                    alt=""
                    width={120}
                    height={120}
                  />
                ) : null}
                <div className="dkit-blog-list__body">
                  <h2 className="dkit-blog-list__title">
                    <a href={joinModulePath(basePath, post.slug)}>
                      {post.title}
                    </a>
                  </h2>
                  {post.published_at ? (
                    <time dateTime={post.published_at}>
                      {new Date(post.published_at).toLocaleDateString()}
                    </time>
                  ) : null}
                  {name ? (
                    <p className="dkit-blog-list__meta">
                      {avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          className="dkit-blog-list__avatar"
                          src={avatar}
                          alt=""
                          width={20}
                          height={20}
                        />
                      ) : null}
                      <span>{name}</span>
                    </p>
                  ) : null}
                  {post.excerpt ? (
                    <p className="dkit-blog-list__excerpt">{post.excerpt}</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
