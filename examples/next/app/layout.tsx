import type { ReactNode } from "react";

export const metadata = {
  title: "dkit example (Next.js)",
  description: "Playground for testing dkit installs",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#fafafa",
          color: "#111",
        }}
      >
        <header
          style={{
            borderBottom: "1px solid #e5e5e5",
            padding: "12px 24px",
            display: "flex",
            gap: 16,
          }}
        >
          <a href="/" style={{ fontWeight: 600, color: "inherit", textDecoration: "none" }}>
            dkit / next
          </a>
          <a href="/blog" style={{ color: "#666", textDecoration: "none" }}>
            Blog
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}
