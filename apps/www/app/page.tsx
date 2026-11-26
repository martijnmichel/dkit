import { DkitLogo } from "@/components/dkit-logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Boxes,
  Bot,
  Code2,
  Database,
  Rocket,
  Terminal,
  Workflow,
} from "lucide-react";

const FEATURES = [
  {
    title: "Getting started",
    body: "From empty folder to first module against your Directus project.",
    href: "/docs/getting-started/",
    icon: Rocket,
  },
  {
    title: "Schema + access",
    body: "Collections, relations, and public/admin policies applied to Directus.",
    href: "/docs/modules/",
    icon: Database,
  },
  {
    title: "Services",
    body: "Optional flows and seed data so you can smoke-test UI right after install.",
    href: "/docs/services/",
    icon: Workflow,
  },
  {
    title: "Owned UI",
    body: "Unbundled React or Vue blocks in your repo — restyle or replace freely.",
    href: "/docs/ui-kits/",
    icon: Code2,
  },
  {
    title: "CLI",
    body: "init, add, list, doctor — interactive prompts or --yes for CI.",
    href: "/docs/cli/",
    icon: Terminal,
  },
  {
    title: "Modules",
    body: "Browse blog, pages, contact form, page builder and live Sandpack previews.",
    href: "/docs/modules/",
    icon: Boxes,
  },
  {
    title: "MCP server",
    body: "Agent tools over the same registry — list modules, draft dkit add.",
    href: "/docs/mcp/",
    icon: Bot,
  },
] as const;

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
        <p className="mt-4 max-w-3xl text-2xl font-medium tracking-tight text-foreground sm:text-3xl sm:leading-snug">
          The foundation for Directus modules you own
        </p>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Composable schema, access, services, and UI for Next.js and Nuxt —
          with thoughtful defaults. Install into your repo as code you can
          customize, extend, and make your own.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href="/docs/getting-started/">Get started</a>
          </Button>
          <Button asChild variant="outline">
            <a href="/docs/modules/">Browse modules</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="https://github.com/martijnmichel/dkit">GitHub</a>
          </Button>
        </div>
        <pre className="code mt-10">{`npx dkit init
npx dkit add blog --seed`}</pre>
        <section className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, body, href, icon: Icon }) => (
            <a
              key={title}
              href={href}
              className="block no-underline hover:no-underline"
            >
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader className="gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{body}</CardDescription>
                </CardHeader>
              </Card>
            </a>
          ))}
        </section>
      </div>
    </div>
  );
}
