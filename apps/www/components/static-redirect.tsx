"use client";

import { useEffect } from "react";

/** Client redirect for static export (next/navigation redirect is unavailable). */
export function StaticRedirect({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <main className="mx-auto max-w-lg px-6 py-16 text-center">
      <p className="text-muted-foreground">
        Moved to{" "}
        <a className="underline underline-offset-2" href={href}>
          {href}
        </a>
      </p>
    </main>
  );
}
