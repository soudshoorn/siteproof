import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { SeoPageEditor } from "@/components/admin/seo-page-editor";

export default async function EditSeoPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await prisma.seoPage.findUnique({ where: { id } });

  if (!page) {
    notFound();
  }

  return (
    <SeoPageEditor
      page={{
        id: page.id,
        slug: page.slug,
        title: page.title,
        metaDescription: page.metaDescription,
        content: page.content,
      }}
    />
  );
}
