import { DkitWordmark } from "@/components/dkit-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-6">
        <a href="/" className="no-underline hover:no-underline">
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

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <p>
          MIT · Directus 11+ (12.2+ recommended) · Use a staging project before
          applying modules to production
        </p>
        <div className="flex gap-4">
          <a href="/docs/" className="hover:text-foreground hover:no-underline">
            Docs
          </a>
          <a
            href="/docs/modules/"
            className="hover:text-foreground hover:no-underline"
          >
            Modules
          </a>
        </div>
      </div>
    </footer>
  );
}
