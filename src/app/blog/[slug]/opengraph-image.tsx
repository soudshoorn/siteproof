import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "edge";
export const alt = "SiteProof Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, category: true },
  });

  const title = post?.title ?? "Blog";
  const category = post?.category ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: logo + category */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg
            width="40"
            height="40"
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
          <span style={{ fontSize: 24, fontWeight: 700, color: "#ffffff" }}>
            SiteProof
          </span>
          {category && (
            <span
              style={{
                fontSize: 14,
                color: "#14b8a6",
                border: "1px solid #14b8a6",
                borderRadius: 9999,
                padding: "4px 14px",
                marginLeft: 8,
              }}
            >
              {category}
            </span>
          )}
        </div>

        {/* Center: title */}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 40 : 52,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1.2,
            letterSpacing: -1,
            maxWidth: 900,
          }}
        >
          {title}
        </div>

        {/* Bottom: URL */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
            color: "#71717a",
          }}
        >
          <span>siteproof.nl/blog</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
