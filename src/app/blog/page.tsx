import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { CalendarDays, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog — Toegankelijkheid, WCAG en de EAA",
  description:
    "Artikelen over webtoegankelijkheid, WCAG richtlijnen, de European Accessibility Act en hoe je je website toegankelijk maakt. Tips en tutorials in het Nederlands.",
  openGraph: {
    title: "SiteProof Blog — Toegankelijkheid, WCAG en de EAA",
    description:
      "Alles over webtoegankelijkheid, WCAG en de EAA. Praktische tips en tutorials.",
  },
};

const POSTS_PER_PAGE = 12;

function estimateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; categorie?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = params.categorie || undefined;

  const where = {
    status: "PUBLISHED" as const,
    publishedAt: { lte: new Date() },
    ...(category ? { category } : {}),
  };

  const [posts, totalCount, categories] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: POSTS_PER_PAGE,
      skip: (page - 1) * POSTS_PER_PAGE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        publishedAt: true,
        content: true,
      },
    }),
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  const uniqueCategories = categories
    .map((c) => c.category)
    .filter((c): c is string => c !== null);

  return (
    <>
      <Header />
      <main id="main-content">
        <section className="border-b border-border/40 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Blog
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Artikelen over webtoegankelijkheid, WCAG, de European
                Accessibility Act en hoe je je website toegankelijk maakt.
              </p>
            </div>

            {/* Category filter */}
            {uniqueCategories.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Link href="/blog">
                  <Badge
                    variant={!category ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    Alles
                  </Badge>
                </Link>
                {uniqueCategories.map((cat) => (
                  <Link key={cat} href={`/blog?categorie=${encodeURIComponent(cat)}`}>
                    <Badge
                      variant={category === cat ? "default" : "outline"}
                      className="cursor-pointer"
                    >
                      {cat}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {posts.length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground">
                  Nog geen blogposts gepubliceerd. Kom binnenkort terug!
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 transition-colors hover:border-border"
                    >
                      <div className="flex flex-1 flex-col p-5">
                        {post.category && (
                          <Badge variant="outline" className="mb-3 w-fit text-xs">
                            {post.category}
                          </Badge>
                        )}
                        <h2 className="text-lg font-semibold leading-tight">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        {post.excerpt && (
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                          {post.publishedAt && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="size-3.5" />
                              {formatDate(post.publishedAt)}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {estimateReadingTime(post.content)} min leestijd
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav
                    className="mt-12 flex items-center justify-center gap-2"
                    aria-label="Blog paginering"
                  >
                    {page > 1 && (
                      <Link
                        href={`/blog?page=${page - 1}${category ? `&categorie=${category}` : ""}`}
                        className="rounded-md border border-border/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        Vorige
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <Link
                          key={p}
                          href={`/blog?page=${p}${category ? `&categorie=${category}` : ""}`}
                          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                            p === page
                              ? "bg-primary text-primary-foreground"
                              : "border border-border/50 hover:bg-accent"
                          }`}
                          aria-current={p === page ? "page" : undefined}
                        >
                          {p}
                        </Link>
                      )
                    )}
                    {page < totalPages && (
                      <Link
                        href={`/blog?page=${page + 1}${category ? `&categorie=${category}` : ""}`}
                        className="rounded-md border border-border/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                      >
                        Volgende
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
