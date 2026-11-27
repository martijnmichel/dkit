import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Compact mark for browser tabs. */
export default function Icon() {
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
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 18,
            height: 14,
            background: "#00c769",
            borderRadius: 3,
            transform: "skewX(-12deg)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
