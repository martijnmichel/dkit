import {
  OnThisPageMobile,
  OnThisPageRail,
  type TocItem,
} from "@/components/on-this-page";

export function DocsPage({
  title,
  description,
  toc,
  children,
}: {
  title: string;
  description?: string;
  toc?: TocItem[];
  children: React.ReactNode;
}) {
  const items = toc ?? [];

  return (
    <div className="bg-background px-6 py-10 lg:px-10">
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_11rem] xl:gap-12">
        <article className="module-prose min-w-0">
          {items.length ? <OnThisPageMobile items={items} /> : null}
          <h1 className="text-foreground">{title}</h1>
          {description ? (
            <p className="lede mt-3 max-w-2xl">{description}</p>
          ) : null}
          <div className="mt-10 space-y-10">{children}</div>
        </article>
        {items.length ? (
          <aside className="hidden xl:block">
            <OnThisPageRail items={items} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

export function DocsSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-foreground">{title}</h2>
      <div className="mt-4 space-y-4 text-[0.9875rem] leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}
