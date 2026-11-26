import { getPageBySlug } from "@/lib/dkit/pages";
import { moduleBasePath } from "@/lib/dkit/config";

/** Styled with shadcn theme tokens — inherits your app theme (Next shadcn/ui). */
export async function PageDetail({
  slug,
  basePath = moduleBasePath("pages", "/pages"),
}: {
  slug: string;
  basePath?: string;
}) {
  const page = await getPageBySlug(slug);
  if (!page) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center text-muted-foreground">
        <p className="text-2xl font-semibold text-foreground">Page not found</p>
        <a
          href={basePath === "/" ? "/" : basePath}
          className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          ← Back
        </a>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <header className="border-b border-border pb-10">
        <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl">
          {page.title}
        </h1>
        {page.published_at ? (
          <time
            dateTime={page.published_at}
            className="mt-6 block text-sm text-muted-foreground"
          >
            {new Date(page.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        ) : null}
        {page.excerpt ? (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            {page.excerpt}
          </p>
        ) : null}
      </header>

      {page.body ? (
        <div
          className="dkit-prose mt-10"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      ) : null}
    </article>
  );
}
