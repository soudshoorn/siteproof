import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Goed";
  if (score >= 50) return "Matig";
  return "Slecht";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quickScan = await prisma.quickScan.findUnique({
    where: { id },
  });

  if (!quickScan || quickScan.status !== "COMPLETED") {
    return new Response("Scan niet gevonden", { status: 404 });
  }

  const score = Math.round(quickScan.score ?? 0);
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  let hostname = "website";
  try {
    hostname = new URL(quickScan.url).hostname;
  } catch {
    // fallback
  }

  const results = quickScan.results as Record<string, unknown> | null;
  const totalIssues = (results?.totalIssues as number) ?? 0;
  const criticalIssues = (results?.criticalIssues as number) ?? 0;
  const seriousIssues = (results?.seriousIssues as number) ?? 0;

  // SVG circle math
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const dashOffset = circumference - progress;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200",
          height: "630",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          color: "#f1f5f9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "32px 48px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v10l9 5 9-5V7l-9-5z"
                fill="#14b8a6"
                stroke="#14b8a6"
                strokeWidth="1.5"
              />
              <path
                d="M9 12l2 2 4-4"
                stroke="#0a0a0a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: "28px", fontWeight: 700 }}>SiteProof</span>
          </div>
          <span style={{ fontSize: "18px", color: "#94a3b8" }}>
            siteproof.nl
          </span>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "80px",
            padding: "0 48px",
          }}
        >
          {/* Score circle */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "200px",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                style={{
                  transform: "rotate(-90deg)",
                  position: "absolute",
                }}
              >
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="10"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <span
                style={{
                  fontSize: "72px",
                  fontWeight: 800,
                  color: scoreColor,
                  position: "relative",
                }}
              >
                {score}
              </span>
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: scoreColor,
              }}
            >
              {scoreLabel}
            </span>
          </div>

          {/* Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "550px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Toegankelijkheidsscore
              </span>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {hostname}
              </span>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: "24px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  padding: "12px 20px",
                  backgroundColor: "#1a1a1a",
                  borderRadius: "12px",
                }}
              >
                <span style={{ fontSize: "28px", fontWeight: 700 }}>
                  {totalIssues}
                </span>
                <span style={{ fontSize: "14px", color: "#94a3b8" }}>
                  Issues totaal
                </span>
              </div>
              {criticalIssues > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "12px 20px",
                    backgroundColor: "rgba(239,68,68,0.1)",
                    borderRadius: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#ef4444",
                    }}
                  >
                    {criticalIssues}
                  </span>
                  <span style={{ fontSize: "14px", color: "#ef4444" }}>
                    Kritiek
                  </span>
                </div>
              )}
              {seriousIssues > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "12px 20px",
                    backgroundColor: "rgba(249,115,22,0.1)",
                    borderRadius: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "28px",
                      fontWeight: 700,
                      color: "#f97316",
                    }}
                  >
                    {seriousIssues}
                  </span>
                  <span style={{ fontSize: "14px", color: "#f97316" }}>
                    Serieus
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 48px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ fontSize: "16px", color: "#94a3b8" }}>
            Bewijs dat je website toegankelijk is.
          </span>
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#14b8a6",
            }}
          >
            Scan jouw website gratis →
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
