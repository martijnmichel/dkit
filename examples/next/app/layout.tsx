import type { ReactNode } from "react";
import { Fraunces, DM_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "dkit example (Next.js)",
  description: "Playground for testing dkit installs",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn(display.variable, "font-sans", geist.variable)}>
      <body className="min-h-screen font-[family-name:var(--font-sans)] antialiased">
        <header className="sticky top-0 z-10 border-b border-[color:var(--color-line)] bg-[color:var(--color-paper)]/80 backdrop-blur-md">
          <div className="container flex items-center gap-6 py-4">
            <a
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[color:var(--color-ink)] no-underline"
            >
              dkit
              <span className="ml-2 text-sm font-normal text-[color:var(--color-ink-muted)]">
                / next
              </span>
            </a>
            <a
              href="/blog"
              className="text-sm text-[color:var(--color-ink-muted)] no-underline transition hover:text-[color:var(--color-accent)]"
            >
              Blog
            </a>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
