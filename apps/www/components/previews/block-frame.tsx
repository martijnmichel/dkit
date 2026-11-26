export function BlockFrame({
  title,
  description,
  toolbar,
  children,
}: {
  title: string;
  description?: string;
  /** Optional bar under the header (e.g. PreviewSelectBar). */
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-white text-foreground shadow-sm">
      <header className="border-b border-border bg-zinc-50 px-4 py-3">
        <h3 className="font-mono text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>
      {toolbar}
      <div className="preview-canvas min-h-[12rem] bg-white">{children}</div>
    </section>
  );
}
