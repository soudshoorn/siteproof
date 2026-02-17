import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SiteProof — Bewijs dat je website toegankelijk is";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Shield icon */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L4 6v5c0 4.5 3.4 8.7 8 10 4.6-1.3 8-5.5 8-10V6L12 2z"
            fill="#14b8a6"
          />
          <path
            d="M10.5 14.17l-2.09-2.08L7 13.5l3.5 3.5 5.5-5.5-1.41-1.41L10.5 14.17z"
            fill="#0a0a0a"
          />
        </svg>

        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 800,
            color: "#ffffff",
            marginTop: 24,
            letterSpacing: -1,
          }}
        >
          SiteProof
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#14b8a6",
            marginTop: 12,
            fontWeight: 600,
          }}
        >
          Bewijs dat je website toegankelijk is.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 18,
            color: "#a1a1aa",
            marginTop: 20,
            maxWidth: 700,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Scan je website op WCAG 2.1 AA · Resultaten in begrijpelijk Nederlands · EAA compliance check
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 32,
            fontSize: 14,
            color: "#71717a",
          }}
        >
          <span>siteproof.nl</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
