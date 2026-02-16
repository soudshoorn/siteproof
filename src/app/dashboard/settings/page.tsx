import { requireAuth, getCurrentOrganization } from "@/lib/supabase/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { nl } from "@/lib/i18n/nl";
import { formatDate } from "@/lib/utils";
import { NotificationPreferencesForm } from "@/components/dashboard/notification-preferences-form";
import { AvgRights } from "@/components/dashboard/avg-rights";
import { PLANS } from "@/lib/mollie/plans";

export default async function SettingsPage() {
  const user = await requireAuth();
  const organization = await getCurrentOrganization();

  if (!organization) {
    return <p className="text-muted-foreground">Geen organisatie gevonden.</p>;
  }

  const orgWithMembers = await prisma.organization.findUnique({
    where: { id: organization.id },
    include: {
      members: {
        include: { user: { select: { fullName: true, email: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{nl.dashboard.settings}</h1>
        <p className="text-sm text-muted-foreground">
          Beheer je organisatie en account.
        </p>
      </div>

      {/* Organization info */}
      <Card>
        <CardHeader>
          <CardTitle>Organisatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Naam</p>
              <p className="font-medium">{organization.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <Badge variant="secondary">{organization.planType}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aangemaakt</p>
              <p className="font-medium">{formatDate(organization.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Slug</p>
              <p className="font-mono text-sm">{organization.slug}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team members */}
      <Card>
        <CardHeader>
          <CardTitle>Teamleden</CardTitle>
        </CardHeader>
        <CardContent>
          {orgWithMembers?.members && orgWithMembers.members.length > 0 ? (
            <div className="divide-y divide-border/40">
              {orgWithMembers.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.fullName || member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Geen teamleden.</p>
          )}
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <NotificationPreferencesForm
        planSupportsEmail={PLANS[organization.planType].features.emailAlerts}
      />

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Naam</p>
              <p className="font-medium">{user.fullName || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AVG rights: data export + account deletion */}
      <AvgRights userEmail={user.email} />
    </div>
  );
}
