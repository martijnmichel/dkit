import { createDirectus, readItems, rest } from "@directus/sdk";
import type { SitePage } from "@/lib/dkit/pages";
import { collections } from "@/lib/dkit/config";

async function getPage(slug: string): Promise<SitePage | null> {
  const url = process.env.DIRECTUS_URL;
  if (!url) return null;
  try {
    const client = createDirectus(url).with(rest());
    const rows = (await client.request(
      readItems(collections.pages, {
        filter: {
          _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }],
        },
        fields: ["id", "title", "slug", "body", "published_at"],
        limit: 1,
      }),
    )) as SitePage[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

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
        <div dangerouslySetInnerHTML={{ __html: page.body }} />
      ) : null}
    </article>
  );
}
