import { PrismaClient } from "@prisma/client";
import { sendEmail } from "./client";
import { scanCompletedEmail } from "./templates/scan-completed";
import { scoreDropEmail } from "./templates/score-drop";
import { criticalIssuesEmail } from "./templates/critical-issues";
import { weeklyReportEmail } from "./templates/weekly-report";
import { welcomeEmail } from "./templates/welcome";
import {
  subscriptionConfirmEmail,
  subscriptionCancelledEmail,
} from "./templates/subscription";
import { PLANS } from "../mollie/plans";
import type { PlanType } from "@prisma/client";

/**
 * Central notification service for SiteProof.
 * Checks notification preferences and plan limits before sending emails.
 *
 * Accepts a PrismaClient instance so it works both in Next.js API routes
 * (using the singleton) and in the standalone scanner worker.
 */

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

async function getNotificationPrefs(prisma: PrismaClient, organizationId: string) {
  let prefs = await prisma.notificationPreference.findUnique({
    where: { organizationId },
  });

  // Create defaults if not yet set
  if (!prefs) {
    prefs = await prisma.notificationPreference.create({
      data: { organizationId },
    });
  }

  return prefs;
}

async function getOrgMembers(prisma: PrismaClient, organizationId: string) {
  const members = await prisma.organizationMember.findMany({
    where: { organizationId },
    include: { user: { select: { email: true, fullName: true } } },
  });
  return members;
}

function planSupportsEmailAlerts(planType: PlanType): boolean {
  const plan = PLANS[planType];
  return plan.features.emailAlerts;
}

async function sendToMembers(
  prisma: PrismaClient,
  organizationId: string,
  buildEmail: (userName: string) => { subject: string; html: string }
) {
  const members = await getOrgMembers(prisma, organizationId);

  const results = await Promise.allSettled(
    members.map(async (member) => {
      const { subject, html } = buildEmail(
        member.user.fullName || ""
      );
      return sendEmail({ to: member.user.email, subject, html });
    })
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `[Notifications] ${failed.length}/${results.length} emails failed for org ${organizationId}`
    );
  }
}

// -------------------------------------------------------------------
// Scan Completed
// -------------------------------------------------------------------

export async function notifyScanCompleted(
  prisma: PrismaClient,
  scanId: string
) {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      website: {
        include: {
          organization: true,
        },
      },
    },
  });

  if (!scan || !scan.website) return;

  const org = scan.website.organization;
  if (!planSupportsEmailAlerts(org.planType)) return;

  const prefs = await getNotificationPrefs(prisma, org.id);
  if (!prefs.scanCompleted) return;

  // Get previous scan score for trend
  const previousScan = await prisma.scan.findFirst({
    where: {
      websiteId: scan.websiteId,
      id: { not: scanId },
      status: "COMPLETED",
    },
    orderBy: { completedAt: "desc" },
    select: { score: true, criticalIssues: true, seriousIssues: true },
  });

  await sendToMembers(prisma, org.id, (userName) =>
    scanCompletedEmail({
      userName,
      websiteName: scan.website.name,
      websiteUrl: scan.website.url,
      scanId: scan.id,
      score: scan.score ?? 0,
      totalIssues: scan.totalIssues,
      criticalIssues: scan.criticalIssues,
      seriousIssues: scan.seriousIssues,
      moderateIssues: scan.moderateIssues,
      minorIssues: scan.minorIssues,
      pagesScanned: scan.scannedPages,
      duration: scan.duration ?? 0,
      previousScore: previousScan?.score,
    })
  );

  // Check if score dropped significantly (>10 points) and send alert
  if (
    previousScan?.score != null &&
    scan.score != null &&
    previousScan.score - scan.score >= 10 &&
    prefs.scoreDropAlert
  ) {
    await sendToMembers(prisma, org.id, (userName) =>
      scoreDropEmail({
        userName,
        websiteName: scan.website.name,
        websiteUrl: scan.website.url,
        scanId: scan.id,
        currentScore: scan.score!,
        previousScore: previousScan.score!,
        newCriticalIssues: Math.max(
          0,
          scan.criticalIssues - (previousScan.criticalIssues ?? 0)
        ),
        newSeriousIssues: Math.max(
          0,
          scan.seriousIssues - (previousScan.seriousIssues ?? 0)
        ),
      })
    );
  }

  // Check for new critical issues
  if (
    scan.criticalIssues > 0 &&
    prefs.criticalIssueAlert &&
    (previousScan == null ||
      scan.criticalIssues > (previousScan.criticalIssues ?? 0))
  ) {
    const criticalIssues = await prisma.issue.findMany({
      where: { scanId: scan.id, severity: "CRITICAL" },
      select: {
        description: true,
        pageUrl: true,
        wcagCriteria: true,
      },
      take: 10,
    });

    await sendToMembers(prisma, org.id, (userName) =>
      criticalIssuesEmail({
        userName,
        websiteName: scan.website.name,
        websiteUrl: scan.website.url,
        scanId: scan.id,
        criticalCount: scan.criticalIssues,
        issues: criticalIssues,
      })
    );
  }
}

// -------------------------------------------------------------------
// Weekly Report
// -------------------------------------------------------------------

export async function sendWeeklyReports(prisma: PrismaClient) {
  // Find all organizations with weekly reports enabled and a paid plan
  const orgs = await prisma.organization.findMany({
    where: {
      planType: { not: "FREE" },
      notificationPrefs: { weeklyReport: true },
    },
    include: {
      websites: {
        where: { isActive: true },
        select: { id: true, name: true, url: true },
      },
      members: {
        include: { user: { select: { email: true, fullName: true } } },
      },
      notificationPrefs: true,
    },
  });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("nl-NL", { day: "numeric", month: "long" });

  for (const org of orgs) {
    if (org.websites.length === 0) continue;

    // Build website summaries
    const websiteSummaries = await Promise.all(
      org.websites.map(async (website) => {
        const latestScan = await prisma.scan.findFirst({
          where: { websiteId: website.id, status: "COMPLETED" },
          orderBy: { completedAt: "desc" },
          select: {
            score: true,
            totalIssues: true,
            criticalIssues: true,
          },
        });

        const previousScan = await prisma.scan.findFirst({
          where: {
            websiteId: website.id,
            status: "COMPLETED",
            completedAt: { lt: weekStart },
          },
          orderBy: { completedAt: "desc" },
          select: { score: true },
        });

        return {
          name: website.name,
          url: website.url,
          websiteId: website.id,
          latestScore: latestScan?.score ?? null,
          previousScore: previousScan?.score ?? null,
          totalIssues: latestScan?.totalIssues ?? 0,
          criticalIssues: latestScan?.criticalIssues ?? 0,
        };
      })
    );

    // Send to all members
    for (const member of org.members) {
      const { subject, html } = weeklyReportEmail({
        userName: member.user.fullName || "",
        organizationName: org.name,
        websites: websiteSummaries,
        weekStartDate: formatDate(weekStart),
        weekEndDate: formatDate(now),
      });

      try {
        await sendEmail({ to: member.user.email, subject, html });
      } catch (error) {
        console.error(
          `[Notifications] Failed to send weekly report to ${member.user.email}:`,
          error
        );
      }
    }
  }
}

// -------------------------------------------------------------------
// Welcome Email
// -------------------------------------------------------------------

export async function sendWelcomeEmail(email: string, userName: string) {
  const { subject, html } = welcomeEmail({ userName, email });
  return sendEmail({ to: email, subject, html });
}

// -------------------------------------------------------------------
// Subscription Emails
// -------------------------------------------------------------------

export async function sendSubscriptionConfirmation(
  prisma: PrismaClient,
  organizationId: string,
  planName: string,
  price: string,
  interval: "maandelijks" | "jaarlijks",
  nextBillingDate: string
) {
  await sendToMembers(prisma, organizationId, (userName) =>
    subscriptionConfirmEmail({
      userName,
      planName,
      price,
      interval,
      nextBillingDate,
    })
  );
}

export async function sendSubscriptionCancelled(
  prisma: PrismaClient,
  organizationId: string,
  planName: string,
  activeUntil: string
) {
  await sendToMembers(prisma, organizationId, (userName) =>
    subscriptionCancelledEmail({
      userName,
      planName,
      activeUntil,
    })
  );
}
