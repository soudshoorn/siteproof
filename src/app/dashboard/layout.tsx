import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const organization = await getCurrentOrganization();

  return (
    <DashboardShell
      user={{ id: user.id, fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl }}
      organization={organization ? { id: organization.id, name: organization.name, planType: organization.planType } : null}
    >
      {children}
    </DashboardShell>
  );
}
