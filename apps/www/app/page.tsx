import { DkitLogo } from "@/components/dkit-logo";

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_50%),radial-gradient(ellipse_at_bottom_right,color-mix(in_oklab,var(--primary)_8%,transparent),transparent_45%)]"
      />
      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <DkitLogo className="h-14 w-auto text-primary sm:h-16" />
        <h1 className="mt-8 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          dkit
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Install Directus schema, permissions, flows, and typed UI into your
          Next.js or Nuxt app — owned source in your repo, not a locked package.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn" href="/modules/">
            Browse modules
          </a>
          <a
            className="inline-flex items-center justify-center rounded-[calc(var(--radius)-2px)] border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground no-underline hover:bg-muted/60 hover:no-underline"
            href="https://github.com/martijnmichel/dkit"
          >
            GitHub
          </a>
        </div>
        <pre className="code mt-10">{`npx dkit init
npx dkit add blog --seed`}</pre>
        <section className="mt-16 grid grid-3">
          {[
            [
              "Schema + access",
              "Collections, relations, and public/admin policies applied to your Directus project.",
            ],
            [
              "Services",
              "Optional flows and seed data so you can smoke-test the UI right after install.",
            ],
            [
              "Owned UI",
              "Unbundled React or Vue blocks written into your codebase — restyle or replace freely.",
            ],
          ].map(([title, body]) => (
            <div key={title} className="card">
              <h2 className="font-medium text-foreground">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
