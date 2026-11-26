import { getPage } from "@/lib/dkit/pages";
import { moduleBasePath } from "@/lib/dkit/config";

export async function PageDetail({
  slug,
  basePath = moduleBasePath("pages", "/pages"),
}: {
  slug: string;
  basePath?: string;
}) {
  const page = await getPage(slug);
  if (!page) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center text-stone-500">
        <p className="font-serif text-2xl text-stone-800 dark:text-stone-200">
          Page not found
        </p>
        <a
          href={basePath === "/" ? "/" : basePath}
          className="mt-4 inline-block text-sm text-teal-800 underline-offset-4 hover:underline dark:text-teal-300"
        >
          ← Back
        </a>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-2xl px-6 py-16 sm:py-20">
      <header className="border-b border-stone-200 pb-10 dark:border-stone-800">
        <h1 className="font-serif text-4xl leading-[1.15] tracking-tight text-stone-900 sm:text-5xl dark:text-stone-50">
          {page.title}
        </h1>
        {page.published_at ? (
          <time
            dateTime={page.published_at}
            className="mt-6 block text-sm text-stone-500"
          >
            {new Date(page.published_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        ) : null}
        {page.excerpt ? (
          <p className="mt-4 text-lg leading-relaxed text-stone-500 dark:text-stone-400">
            {page.excerpt}
          </p>
        ) : null}
      </header>

      {page.body ? (
        <div
          className="mt-10 space-y-4 text-[1.05rem] leading-8 text-stone-700 [&_a]:text-teal-800 [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-teal-700/40 [&_blockquote]:pl-4 [&_blockquote]:text-stone-500 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:tracking-tight [&_h2]:text-stone-900 [&_h3]:mt-8 [&_h3]:font-serif [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-4 dark:text-stone-300 dark:[&_a]:text-teal-300 dark:[&_h2]:text-stone-50"
          dangerouslySetInnerHTML={{ __html: page.body }}
        />
      ) : null}
    </article>
  );
}
