import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dkit — Directus modules you own",
  description:
    "Install Directus schema, permissions, flows, and frontend code in one command.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <a href="/" className="font-semibold tracking-tight">
              dkit
            </a>
            <nav className="flex gap-4 text-sm text-neutral-600">
              <a href="/modules/">Modules</a>
              <a href="https://github.com/martijnmichel/dkit">GitHub</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-neutral-200">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-neutral-500">
            MIT · Requires Directus 11+ (best on 12.2+) · Back up before applying
          </div>
        </footer>
      </body>
    </html>
  );
}
