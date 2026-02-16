import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addScanJob } from "@/lib/scanner/queue";
import { getMaxPagesPerScan } from "@/lib/mollie/plans";
import type { PlanType, ScheduleFrequency } from "@prisma/client";

/**
 * Cron endpoint for triggering scheduled scans.
 * Triggered by Vercel Cron every 6 hours (see vercel.json).
 *
 * Logic:
 * - Finds all active schedules where nextRunAt <= now
 * - Creates a Scan record and queues a BullMQ job for each
 * - Updates lastRunAt and calculates the next nextRunAt
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Niet gemachtigd." }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all schedules that are due
    const dueSchedules = await prisma.scanSchedule.findMany({
      where: {
        isActive: true,
        OR: [
          { nextRunAt: { lte: now } },
          { nextRunAt: null },
        ],
      },
      include: {
        website: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (dueSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Geen geplande scans om uit te voeren.",
        scheduled: 0,
      });
    }

    let scheduled = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const schedule of dueSchedules) {
      const { website } = schedule;

      // Skip inactive websites
      if (!website.isActive) {
        skipped++;
        continue;
      }

      // Check if the organization's plan allows this scan frequency
      const orgPlan = website.organization.planType;
      if (!isFrequencyAllowedByPlan(schedule.frequency, orgPlan)) {
        skipped++;
        continue;
      }

      // Check if there's already an active scan for this website (avoid duplicates)
      const activeScan = await prisma.scan.findFirst({
        where: {
          websiteId: website.id,
          status: { in: ["QUEUED", "CRAWLING", "SCANNING", "ANALYZING"] },
        },
      });

      if (activeScan) {
        skipped++;
        continue;
      }

      try {
        const maxPages = getMaxPagesPerScan(orgPlan);

        // Create scan record
        const scan = await prisma.scan.create({
          data: {
            websiteId: website.id,
            status: "QUEUED",
            metadata: { triggeredBy: "schedule", scheduleId: schedule.id },
          },
        });

        // Queue the job
        await addScanJob({
          scanId: scan.id,
          websiteId: website.id,
          url: website.url,
          maxPages,
        });

        // Update schedule timestamps
        await prisma.scanSchedule.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: now,
            nextRunAt: calculateNextRunAt(schedule.frequency, now),
          },
        });

        scheduled++;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Onbekende fout";
        errors.push(`Website ${website.id}: ${message}`);
        console.error(
          `[Cron] Failed to schedule scan for website ${website.id}:`,
          error
        );
      }
    }

    return NextResponse.json({
      success: true,
      scheduled,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[Cron] Schedule check failed:", error);
    return NextResponse.json(
      { success: false, error: "Geplande scans konden niet worden gestart." },
      { status: 500 }
    );
  }
}

/**
 * Calculate the next run time based on frequency.
 */
function calculateNextRunAt(
  frequency: ScheduleFrequency,
  from: Date
): Date {
  const next = new Date(from);

  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + 1);
      break;
    case "WEEKLY":
      next.setDate(next.getDate() + 7);
      break;
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}

/**
 * Check whether a schedule frequency is allowed by the organization's plan.
 * - FREE: only MONTHLY
 * - STARTER: WEEKLY or MONTHLY
 * - PROFESSIONAL / BUREAU: DAILY, WEEKLY, or MONTHLY
 */
function isFrequencyAllowedByPlan(
  frequency: ScheduleFrequency,
  planType: PlanType
): boolean {
  const allowedFrequencies: Record<string, ScheduleFrequency[]> = {
    FREE: ["MONTHLY"],
    STARTER: ["WEEKLY", "MONTHLY"],
    PROFESSIONAL: ["DAILY", "WEEKLY", "MONTHLY"],
    BUREAU: ["DAILY", "WEEKLY", "MONTHLY"],
  };

  return (allowedFrequencies[planType] ?? []).includes(frequency);
}
