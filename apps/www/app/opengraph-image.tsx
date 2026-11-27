import { SITE } from "@/lib/seo";
import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 56,
              height: 42,
              background: "#00c769",
              borderRadius: 10,
              transform: "skewX(-12deg)",
            }}
          />
          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            {SITE.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 650,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            {SITE.tagline}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#a3a3a3",
              maxWidth: 820,
              lineHeight: 1.35,
            }}
          >
            Schema, access, services, and UI for Next.js — installed as
            code you own.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#737373",
            fontSize: 24,
          }}
        >
          <span>dkit.run</span>
          <span style={{ color: "#00c769" }}>Directus modules</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
