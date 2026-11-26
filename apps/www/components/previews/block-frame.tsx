export function BlockFrame({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <header className="border-b border-border bg-muted/50 px-4 py-3">
        <h3 className="font-mono text-sm font-medium text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="preview-canvas min-h-[12rem]">{children}</div>
    </section>
  );
}
