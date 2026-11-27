import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <div
          style={{
            width: 96,
            height: 72,
            background: "#00c769",
            borderRadius: 16,
            transform: "skewX(-12deg)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
