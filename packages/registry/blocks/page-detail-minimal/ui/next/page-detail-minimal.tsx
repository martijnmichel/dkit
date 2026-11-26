import { getPage } from "@/lib/dkit/pages";

export async function PageDetailMinimal({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) return <p>Page not found.</p>;

  return (
    <article>
      <h1>{page.title}</h1>
      {page.published_at ? (
        <p>
          <time dateTime={page.published_at}>
            {new Date(page.published_at).toLocaleDateString()}
          </time>
        </p>
      ) : null}
      {page.body ? (
        <div
          className="dkit-prose dkit-prose--compact"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      ) : null}
    </article>
  );
}
