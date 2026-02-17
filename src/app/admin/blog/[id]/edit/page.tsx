import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { nl } from "@/lib/i18n/nl";
import { BlogEditor } from "@/components/admin/blog-editor";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{nl.admin.editPost}</h1>
        <p className="text-sm text-muted-foreground">
          Bewerk &ldquo;{post.title}&rdquo;
        </p>
      </div>
      <BlogEditor
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          metaDescription: post.metaDescription,
          category: post.category,
          tags: post.tags,
          status: post.status,
          publishedAt: post.publishedAt?.toISOString() ?? null,
        }}
      />
    </div>
  );
}
