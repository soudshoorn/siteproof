"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="nl">
      <body
        style={{
          margin: 0,
          fontFamily:
            "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          backgroundColor: "#0a0a0a",
          color: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <div
            style={{
              width: "4rem",
              height: "4rem",
              margin: "0 auto 1.5rem",
              borderRadius: "50%",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            ⚠
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            Er ging iets mis
          </h1>
          <p
            style={{
              marginTop: "0.75rem",
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            De applicatie is een kritieke fout tegengekomen. Probeer de pagina te
            herladen.
          </p>
          {error.digest && (
            <p
              style={{
                marginTop: "0.5rem",
                fontFamily: "monospace",
                fontSize: "0.75rem",
                color: "#64748b",
              }}
            >
              Foutcode: {error.digest}
            </p>
          )}
          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                border: "none",
                backgroundColor: "#14b8a6",
                color: "#0a0a0a",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Opnieuw proberen
            </button>
            <a
              href="/"
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "transparent",
                color: "#f1f5f9",
                fontWeight: 600,
                fontSize: "0.875rem",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Naar homepage
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
