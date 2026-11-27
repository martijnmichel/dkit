import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SiteShell } from "./_components/site-shell";
import { installed as settingsInstalled } from "@/components/dkit/settings";
import { getSiteMetadata } from "@/lib/dkit/settings";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  if (settingsInstalled) {
    return getSiteMetadata({ path: "/" }) as Metadata;
  }
  return {
    title: "dkit example (Next.js)",
    description: "Playground for testing dkit installs",
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(display.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen font-[family-name:var(--font-sans)] antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
