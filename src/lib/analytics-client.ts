export type AnalyticsEventType =
  | "quick_scan_started"
  | "quick_scan_completed"
  | "signup_from_scan"
  | "upgrade_clicked"
  | "checkout_started"
  | "checkout_completed"
  | "scan_limit_hit"
  | "pdf_upgrade_nudge_shown"
  | "fix_suggestion_gate_shown"
  | "trend_upgrade_nudge_shown"
  | "eaa_upgrade_nudge_shown"
  | "share_scan_clicked";

export async function trackEventFromClient(
  event: AnalyticsEventType,
  metadata: Record<string, unknown> = {}
) {
  try {
    await fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, metadata }),
    });
  } catch {
    // Fire and forget
  }
}
