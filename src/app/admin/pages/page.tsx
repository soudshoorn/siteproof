import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { nl } from "@/lib/i18n/nl";
import { formatDate } from "@/lib/utils";
import { Pencil, ExternalLink } from "lucide-react";

const defaultSeoPages = [
  {
    slug: "wcag-checker",
    title: "Gratis WCAG Checker",
    metaDescription:
      "Scan je website gratis op WCAG 2.1 AA compliance. Ontvang direct een rapport met concrete verbeterpunten in begrijpelijk Nederlands.",
  },
  {
    slug: "eaa-compliance",
    title: "European Accessibility Act (EAA)",
    metaDescription:
      "De EAA is sinds 28 juni 2025 van kracht. Controleer of jouw website voldoet aan de EAA en WCAG 2.1 AA.",
  },
  {
    slug: "toegankelijkheid-testen",
    title: "Website Toegankelijkheid Testen",
    metaDescription:
      "Test je website op toegankelijkheid met de SiteProof WCAG checker. Resultaten in begrijpelijk Nederlands.",
  },
  {
    slug: "toegankelijkheidsverklaring",
    title: "Toegankelijkheidsverklaring Generator",
    metaDescription:
      "Genereer een toegankelijkheidsverklaring voor je website op basis van je WCAG scan resultaten.",
  },
  {
    slug: "wcag-richtlijnen",
    title: "WCAG 2.1 Richtlijnen Uitgelegd",
    metaDescription:
      "Alle WCAG 2.1 richtlijnen uitgelegd in begrijpelijk Nederlands. Leer wat elke richtlijn betekent voor jouw website.",
  },
  {
    slug: "privacy",
    title: "Privacyverklaring",
    metaDescription:
      "Lees hoe SiteProof omgaat met je persoonsgegevens conform de AVG.",
  },
  {
    slug: "cookies",
    title: "Cookieverklaring",
    metaDescription:
      "Welke cookies SiteProof plaatst, waarvoor, en hoe je ze kunt beheren.",
  },
  {
    slug: "voorwaarden",
    title: "Algemene Voorwaarden",
    metaDescription:
      "De algemene voorwaarden van SiteProof voor het gebruik van onze WCAG audit dienst.",
  },
];

async function ensureSeoPages() {
  const count = await prisma.seoPage.count();
  if (count > 0) return;

  await prisma.seoPage.createMany({
    data: defaultSeoPages.map((p) => ({
      slug: p.slug,
      title: p.title,
      metaDescription: p.metaDescription,
      content: "",
    })),
    skipDuplicates: true,
  });
}

export default async function AdminPagesPage() {
  await ensureSeoPages();

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
    </div>
  );
}
