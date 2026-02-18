import { z } from "zod";
import { trackEvent, type AnalyticsEventType } from "@/lib/analytics";
import { jsonSuccess, jsonError } from "@/lib/api/helpers";

const schema = z.object({
  event: z.enum([
    "quick_scan_started",
    "quick_scan_completed",
    "signup_from_scan",
    "upgrade_clicked",
    "checkout_started",
    "checkout_completed",
    "scan_limit_hit",
    "pdf_upgrade_nudge_shown",
    "fix_suggestion_gate_shown",
    "trend_upgrade_nudge_shown",
    "eaa_upgrade_nudge_shown",
    "share_scan_clicked",
  ] as const),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return jsonError("Ongeldige request body.", 400);

    const validation = schema.safeParse(body);
    if (!validation.success) return jsonError("Ongeldig event.", 400);

    await trackEvent(
      validation.data.event as AnalyticsEventType,
      (validation.data.metadata ?? {}) as Record<string, string | number | boolean>
    );
    return jsonSuccess({ tracked: true });
  } catch {
    return jsonError("Tracking mislukt.", 500);
  }
}
