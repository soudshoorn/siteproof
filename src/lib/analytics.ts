import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type { AnalyticsEventType } from "@/lib/analytics-client";
export { trackEventFromClient } from "@/lib/analytics-client";

export async function trackEvent(
  event: string,
  metadata: Prisma.InputJsonValue = {},
  userId?: string
) {
  try {
    await prisma.analyticsEvent.create({
      data: { event, userId, metadata },
    });
  } catch {
    // Analytics should never break the app
  }
}
