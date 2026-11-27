import type { ReactNode } from "react";
import {
  installed as settingsInstalled,
  MaintenanceGate,
  SiteBrand,
  SocialLinks,
} from "@/components/dkit/settings";
import {
  installed as navigationInstalled,
  NavFooter,
  NavHeader,
} from "@/components/dkit/navigation";

/**
 * Layout chrome: when settings / navigation are installed, compose seeded
 * brand + menus. Falls back to a simple static header otherwise.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const chrome = (
    <>
      <header className="sticky top-0 z-10 border-b border-[color:var(--color-line)] bg-[color:var(--color-paper)]/80 backdrop-blur-md">
        <div className="container flex items-center justify-between gap-4 py-3">
          <div className="min-w-0 shrink">
            {settingsInstalled ? (
              <SiteBrand showTagline={false} homeHref="/" />
            ) : (
              <a
                href="/"
                className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[color:var(--color-ink)] no-underline"
              >
                dkit
                <span className="ml-2 text-sm font-normal text-[color:var(--color-ink-muted)]">
                  / next
                </span>
              </a>
            )}
          </div>
          <div className="min-w-0 flex-1">
            {navigationInstalled ? (
              <NavHeader />
            ) : (
              <nav className="flex justify-end gap-4">
                <a
                  href="/blog"
                  className="text-sm text-[color:var(--color-ink-muted)] no-underline transition hover:text-[color:var(--color-accent)]"
                >
                  Blog
                </a>
              </nav>
            )}
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-[color:var(--color-line)] bg-[color:var(--color-paper)]">
        <div className="container flex flex-col gap-6 py-10">
          {settingsInstalled ? (
            <SiteBrand homeHref="/" showTagline />
          ) : null}
          {navigationInstalled ? <NavFooter /> : null}
          {settingsInstalled ? <SocialLinks /> : null}
          {!settingsInstalled && !navigationInstalled ? (
            <p className="text-sm text-[color:var(--color-ink-muted)]">
              Install{" "}
              <code className="font-mono text-xs">settings</code> and{" "}
              <code className="font-mono text-xs">navigation</code> to wire
              seeded chrome into this layout.
            </p>
          ) : null}
        </div>
      </footer>
    </>
  );

  if (settingsInstalled) {
    return <MaintenanceGate>{chrome}</MaintenanceGate>;
  }

  return chrome;
}
