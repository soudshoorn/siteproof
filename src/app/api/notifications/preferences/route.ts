import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  authenticateRequest,
  jsonSuccess,
  jsonError,
  withErrorHandling,
} from "@/lib/api/helpers";
import { PLANS } from "@/lib/mollie/plans";

const updatePrefsSchema = z.object({
  scanCompleted: z.boolean().optional(),
  scoreDropAlert: z.boolean().optional(),
  criticalIssueAlert: z.boolean().optional(),
  weeklyReport: z.boolean().optional(),
});

export const GET = withErrorHandling(async () => {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return errorResponse;

  const org = user.memberships[0]?.organization;
  if (!org) return jsonError("Geen organisatie gevonden.", 404);

  // Return current preferences (create defaults if needed)
  let prefs = await prisma.notificationPreference.findUnique({
    where: { organizationId: org.id },
  });

  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { organizationId: org.id },
    });
  }

  const planSupportsEmail = PLANS[org.planType].features.emailAlerts;

  return jsonSuccess({
    preferences: {
      scanCompleted: prefs.scanCompleted,
      scoreDropAlert: prefs.scoreDropAlert,
      criticalIssueAlert: prefs.criticalIssueAlert,
      weeklyReport: prefs.weeklyReport,
    },
    planSupportsEmail,
  });
});

export const PATCH = withErrorHandling(async (request: Request) => {
  const [user, errorResponse] = await authenticateRequest();
  if (errorResponse) return errorResponse;

  const org = user.memberships[0]?.organization;
  if (!org) return jsonError("Geen organisatie gevonden.", 404);

  // Only OWNER and ADMIN can change notification settings
  const membership = user.memberships.find(
    (m) => m.organizationId === org.id
  );
  if (!membership || membership.role === "MEMBER") {
    return jsonError("Je hebt geen rechten om notificatie-instellingen te wijzigen.", 403);
  }

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Ongeldige request body.", 400);

  const validation = updatePrefsSchema.safeParse(body);
  if (!validation.success) return jsonError("Validatiefout.", 400);

  const prefs = await prisma.notificationPreference.upsert({
    where: { organizationId: org.id },
    create: {
      organizationId: org.id,
      ...validation.data,
    },
    update: validation.data,
  });

  return jsonSuccess({
    preferences: {
      scanCompleted: prefs.scanCompleted,
      scoreDropAlert: prefs.scoreDropAlert,
      criticalIssueAlert: prefs.criticalIssueAlert,
      weeklyReport: prefs.weeklyReport,
    },
  });
});
