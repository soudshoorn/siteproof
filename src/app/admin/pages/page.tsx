import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { nl } from "@/lib/i18n/nl";
import { formatDate } from "@/lib/utils";
import { FileEdit, Pencil, ExternalLink } from "lucide-react";

export default async function AdminPagesPage() {
  const pages = await prisma.seoPage.findMany({
    orderBy: { slug: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{nl.admin.pages}</h1>
        <p className="text-sm text-muted-foreground">
          Bewerk SEO landingspagina&apos;s content en meta-informatie.
        </p>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <FileEdit className="size-10 text-muted-foreground/50" />
            <div>
              <p className="font-medium">Geen SEO-pagina&apos;s</p>
              <p className="mt-1 text-sm text-muted-foreground">
                SEO-pagina&apos;s worden automatisch aangemaakt bij het builden van de applicatie.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <Card key={page.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{page.title}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">/{page.slug}</span>
                    {page.metaDescription && (
                      <span className="truncate max-w-xs">{page.metaDescription}</span>
                    )}
                    <span>Bijgewerkt: {formatDate(page.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/pages/${page.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
