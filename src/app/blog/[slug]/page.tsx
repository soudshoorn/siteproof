import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScanWidget } from "@/components/scan/scan-widget";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { CalendarDays, Clock, ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/structured-data";
import { marked } from "marked";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

function estimateReadingTime(content: string): number {
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: { id: string; text: string; level: number }[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[2].replace(/[*_`]/g, "");
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level: match[1].length });
  }
  return headings;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    select: { title: true, metaDescription: true, excerpt: true },
  });

  if (!post) return { title: "Post niet gevonden" };

  return {
    title: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.excerpt || undefined,
      type: "article",
    },
  };
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: { select: { fullName: true, avatarUrl: true } },
    },
  });

  if (!post || post.status !== "PUBLISHED" || (post.publishedAt && post.publishedAt > new Date())) {
    notFound();
  }

  // Increment view count (fire and forget)
  prisma.blogPost
    .update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })
    .catch(() => {});

  const readingTime = estimateReadingTime(post.content);
  const headings = extractHeadings(post.content);

  // Convert markdown to HTML
  const renderer = new marked.Renderer();
  renderer.heading = ({ text, depth }) => {
    const id = text
      .replace(/<[^>]*>/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };
  const htmlContent = await marked(post.content, { renderer });

  // Fetch related posts
  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      id: { not: post.id },
      ...(post.category ? { category: post.category } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
      category: true,
    },
  });

  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: post.title, href: `/blog/${post.slug}` }]} />
      <ArticleJsonLd
        title={post.title}
        description={post.metaDescription || post.excerpt || ""}
        url={`/blog/${post.slug}`}
        datePublished={post.publishedAt?.toISOString() || post.createdAt.toISOString()}
        dateModified={post.updatedAt.toISOString()}
        authorName={post.author.fullName || "SiteProof"}
        image={undefined}
      />
      <Header />
      <main id="main-content">
        <article className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              {/* Back link */}
              <Link
                href="/blog"
                className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Terug naar blog
              </Link>

              {/* Header */}
              <header>
                {post.category && (
                  <Badge variant="outline" className="mb-4">
                    {post.category}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {post.title}
                </h1>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {post.author.fullName && (
                    <span>Door {post.author.fullName}</span>
                  )}
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-4" />
                      {formatDate(post.publishedAt)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="size-4" />
                    {readingTime} min leestijd
                  </span>
                </div>

                {post.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </header>

              <div className="mt-12 flex gap-8">
                {/* Table of contents (desktop sidebar) */}
                {headings.length > 0 && (
                  <aside className="hidden w-56 shrink-0 lg:block">
                    <nav
                      className="sticky top-24 space-y-1"
                      aria-label="Inhoudsopgave"
                    >
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Inhoudsopgave
                      </p>
                      {headings.map((heading) => (
                        <a
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={`block text-sm text-muted-foreground transition-colors hover:text-foreground ${
                            heading.level === 3 ? "pl-4" : ""
                          }`}
                        >
                          {heading.text}
                        </a>
                      ))}
                    </nav>
                  </aside>
                )}

                {/* Content */}
                <div
                  className="prose prose-invert min-w-0 max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              </div>
            </div>
          </div>
        </article>

        {/* Scan CTA */}
        <section className="border-t border-border/40 bg-card/30 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              Test je website op toegankelijkheid
            </h2>
            <p className="mt-4 text-center text-base text-muted-foreground">
              Scan je website gratis op WCAG 2.1 AA en ontvang concrete
              verbeterpunten in begrijpelijk Nederlands.
            </p>
            <div className="mt-8">
              <ScanWidget variant="hero" />
            </div>
          </div>
        </section>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-2xl font-bold tracking-tight">
                Gerelateerde artikelen
              </h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <article
                    key={related.slug}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card/50 transition-colors hover:border-border"
                  >
                    <div className="flex flex-1 flex-col p-5">
                      {related.category && (
                        <Badge
                          variant="outline"
                          className="mb-3 w-fit text-xs"
                        >
                          {related.category}
                        </Badge>
                      )}
                      <h3 className="text-lg font-semibold leading-tight">
                        <Link
                          href={`/blog/${related.slug}`}
                          className="hover:text-primary"
                        >
                          {related.title}
                        </Link>
                      </h3>
                      {related.excerpt && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {related.excerpt}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
