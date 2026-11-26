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
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900/80">
        <h3 className="font-mono text-sm font-medium text-stone-900 dark:text-stone-100">
          {title}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs text-stone-500">{description}</p>
        ) : null}
      </header>
      <div className="preview-canvas min-h-[12rem] bg-[var(--color-paper,#f7f4ef)]">
        {children}
      </div>
    </section>
  );
}
