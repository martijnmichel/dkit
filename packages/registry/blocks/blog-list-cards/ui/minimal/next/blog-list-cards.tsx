import {
  authorAvatarUrl,
  authorName,
  featuredImageUrl,
  getBlogPosts,
} from "@/lib/dkit/blog";
import { joinModulePath, moduleBasePath } from "@/lib/dkit/config";

/** Minimal kit — plain HTML card grid (no Tailwind / shadcn). */
export async function BlogListCards({
  basePath = moduleBasePath("blog", "/blog"),
}: {
  basePath?: string;
}) {
  const posts = await getBlogPosts();

  return (
    <section>
      <style>{`
        .dkit-blog-cards {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .dkit-blog-cards {
            grid-template-columns: 1fr 1fr;
          }
        }
        .dkit-blog-cards article {
          border: 1px solid #ccc;
          padding: 0;
          overflow: hidden;
        }
        .dkit-blog-cards article > a {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        .dkit-blog-cards .dkit-blog-cards__media {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          background: #eee;
          border: 0;
        }
        .dkit-blog-cards .dkit-blog-cards__body {
          padding: 0.75rem 1rem 1rem;
        }
        .dkit-blog-cards .dkit-blog-cards__meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin: 0.75rem 0 0;
          font-size: 0.875rem;
        }
        .dkit-blog-cards .dkit-blog-cards__avatar {
          width: 1.5rem;
          height: 1.5rem;
          border-radius: 9999px;
          object-fit: cover;
          vertical-align: middle;
        }
      `}</style>

      <header>
        <h1>Blog</h1>
        <p>Browse posts.</p>
      </header>

      {posts.length === 0 ? (
        <p>No published posts yet.</p>
      ) : (
        <div className="dkit-blog-cards">
          {posts.map((post) => {
            const imageUrl = featuredImageUrl(post);
            const name = authorName(post);
            const avatar = authorAvatarUrl(post);
            return (
              <article key={post.id}>
                <a href={joinModulePath(basePath, post.slug)}>
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className="dkit-blog-cards__media"
                      src={imageUrl}
                      alt=""
                    />
                  ) : (
                    <span
                      className="dkit-blog-cards__media"
                      aria-hidden
                    />
                  )}
                  <div className="dkit-blog-cards__body">
                    {post.published_at ? (
                      <p>
                        <time dateTime={post.published_at}>
                          {new Date(post.published_at).toLocaleDateString()}
                        </time>
                      </p>
                    ) : null}
                    <h2>{post.title}</h2>
                    {post.excerpt ? <p>{post.excerpt}</p> : null}
                    {name ? (
                      <p className="dkit-blog-cards__meta">
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className="dkit-blog-cards__avatar"
                            src={avatar}
                            alt=""
                          />
                        ) : null}
                        <span>{name}</span>
                      </p>
                    ) : null}
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
