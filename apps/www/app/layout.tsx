import { DkitWordmark } from "@/components/dkit-logo";
import type { Metadata } from "next";
import { JetBrains_Mono, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "dkit — Directus modules for your app",
  description:
    "Browse and install Directus schema, permissions, flows, and typed Next.js / Nuxt UI with one CLI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        <header className="border-b border-border bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <a href="/" className="no-underline hover:no-underline">
              <DkitWordmark />
            </a>
            <nav className="flex gap-4 text-sm text-muted-foreground">
              <a
                href="/modules/"
                className="hover:text-foreground hover:no-underline"
              >
                Modules
              </a>
              <a
                href="https://github.com/martijnmichel/dkit"
                className="hover:text-foreground hover:no-underline"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="mt-20 border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-muted-foreground">
            MIT · Directus 11+ (12.2+ recommended) · Use a staging project before
            applying modules to production
          </div>
        </footer>
      </body>
    </html>
  );
}
