import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { prisma } from "@/lib/db";
import { WebsitesList } from "@/components/dashboard/websites-list";

export default async function WebsitesPage() {
  const user = await requireAuth();
  const organization = await getCurrentOrganization();

  if (!organization) {
    return <p className="text-muted-foreground">Geen organisatie gevonden.</p>;
  }

  const websites = await prisma.website.findMany({
    where: { organizationId: organization.id, isActive: true },
    include: {
      scans: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          score: true,
          status: true,
          totalIssues: true,
          criticalIssues: true,
          seriousIssues: true,
          scannedPages: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <WebsitesList
      websites={websites}
      organizationId={organization.id}
      planType={organization.planType}
      maxWebsites={organization.maxWebsites}
    />
  );
}
