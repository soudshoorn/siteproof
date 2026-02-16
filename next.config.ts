import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  serverExternalPackages: [
    "puppeteer",
    "@react-pdf/renderer",
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
  ],
  poweredByHeader: false,
  compress: true,
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
