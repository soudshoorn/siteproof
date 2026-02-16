import { notFound } from "next/navigation";
import { requireAuth, getCurrentOrganization, getUserRole } from "@/lib/supabase/auth";
import { prisma } from "@/lib/db";
import { WebsiteSettingsForm } from "@/components/dashboard/website-settings-form";

export default async function WebsiteSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAuth();
  const organization = await getCurrentOrganization();

  const website = await prisma.website.findUnique({
    where: { id },
    include: {
      schedules: true,
    },
  });

  if (!website || website.organizationId !== organization?.id) {
    notFound();
  }

  const role = organization ? await getUserRole(organization.id) : null;
  const canDelete = role === "OWNER" || role === "ADMIN";

  return (
    <WebsiteSettingsForm
      website={{
        id: website.id,
        name: website.name,
        url: website.url,
        schedule: website.schedules[0] || null,
      }}
      canDelete={canDelete}
    />
  );
}
