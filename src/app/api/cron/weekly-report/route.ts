import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendWeeklyReports } from "@/lib/email/notifications";

/**
 * Cron endpoint for sending weekly reports.
 * Triggered by Vercel Cron (see vercel.json).
 * Runs every Monday at 08:00 CET.
 */
export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Niet gemachtigd." }, { status: 401 });
  }

  try {
    await sendWeeklyReports(prisma);
    return NextResponse.json({ success: true, message: "Wekelijkse rapporten verzonden." });
  } catch (error) {
    console.error("[Cron] Weekly report failed:", error);
    return NextResponse.json(
      { success: false, error: "Verzenden mislukt." },
      { status: 500 }
    );
  }
}
