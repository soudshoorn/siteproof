import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/scan`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/wcag-checker`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/eaa-compliance`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/toegankelijkheid-testen`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/toegankelijkheidsverklaring`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/wcag-richtlijnen`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/cookies`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/voorwaarden`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Published blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
      },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    });

    blogPages = posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // Database might not be available during build
  }

  // Public scan result pages
  let scanPages: MetadataRoute.Sitemap = [];
  try {
    const recentScans = await prisma.quickScan.findMany({
      where: { status: "COMPLETED" },
      select: { id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    scanPages = recentScans.map((scan) => ({
      url: `${BASE_URL}/scan/resultaat/${scan.id}`,
      lastModified: scan.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }));
  } catch {
    // Database might not be available during build
  }

  return [...staticPages, ...blogPages, ...scanPages];
}
