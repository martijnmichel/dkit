import { DkitWordmark } from "@/components/dkit-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
        <a
          href="/"
          className="inline-flex items-center no-underline hover:no-underline"
        >
          <DkitWordmark />
        </a>
        <nav className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <a href="/docs/">Docs</a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="/docs/modules/">Modules</a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a href="https://github.com/martijnmichel/dkit">GitHub</a>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className="text-muted-foreground hover:text-foreground hover:no-underline"
      {...(external
        ? { rel: "noopener noreferrer", target: "_blank" }
        : {})}
    >
      {children}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <a
              href="/"
              className="inline-flex items-center no-underline hover:no-underline"
            >
              <DkitWordmark />
            </a>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Install Directus modules you own — schema, access, flows, and UI
              for Next.js and Nuxt.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Product</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <FooterLink href="/docs/">Docs</FooterLink>
              </li>
              <li>
                <FooterLink href="/docs/getting-started/">
                  Getting started
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/docs/modules/">Modules</FooterLink>
              </li>
              <li>
                <FooterLink href="/docs/cli/">CLI</FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Resources</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <FooterLink
                  href="https://github.com/martijnmichel/dkit"
                  external
                >
                  GitHub
                </FooterLink>
              </li>
              <li>
                <FooterLink
                  href="https://www.npmjs.com/package/@kurbo/dkit"
                  external
                >
                  npm · @kurbo/dkit
                </FooterLink>
              </li>
              <li>
                <FooterLink href="https://kurbo.dev" external>
                  Kurbo
                </FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground">Legal</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <FooterLink href="/privacy/">Privacy</FooterLink>
              </li>
              <li>
                <FooterLink
                  href="https://github.com/martijnmichel/dkit/blob/main/LICENSE"
                  external
                >
                  MIT License
                </FooterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Kurbo · dkit</p>
          <p>Directus 11+ · Prefer a staging project before production</p>
        </div>
      </div>
    </footer>
  );
}
