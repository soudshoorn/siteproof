import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="24"
          height="24"
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
      </div>
    ),
    { ...size }
  );
}
