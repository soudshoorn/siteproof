import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { downgradeToFree } from "@/lib/mollie/webhooks";
import { sendEmail } from "@/lib/email/client";
import { baseEmailLayout, emailButton } from "@/lib/email/templates/base";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl";

/**
 * Cron endpoint for checking expired paid plans.
 * Triggered daily at 2 AM (see vercel.json).
 *
 * Organizations that have:
 * - A paid plan (not FREE)
 * - No active subscription (cancelled or failed)
 * - An expired period (mollieCurrentPeriodEnd < now)
 *
 * …are downgraded to the FREE plan.
 */
export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this automatically)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find organizations with expired paid plans that have no active subscription
    const expiredOrgs = await prisma.organization.findMany({
      where: {
        planType: { not: "FREE" },
        mollieSubscriptionId: null, // Subscription already cancelled
        mollieCurrentPeriodEnd: { lt: now },
      },
      include: {
        members: {
          where: { role: "OWNER" },
          include: { user: { select: { email: true, fullName: true } } },
        },
      },
    });

    let downgraded = 0;

    for (const org of expiredOrgs) {
      const previousPlan = org.planType;
      await downgradeToFree(org.id);
      downgraded++;

      // Notify owner
      const owner = org.members[0]?.user;
      if (owner) {
        const content = `
          <h1 style="color: #f5f5f5; font-size: 22px; font-weight: 700; margin: 0 0 8px;">Plan gewijzigd naar Gratis</h1>
          <p style="color: #a3a3a3; font-size: 15px; margin: 0 0 24px; line-height: 1.6;">
            Je <strong style="color: #f5f5f5;">${previousPlan}</strong> abonnement voor <strong style="color: #f5f5f5;">${org.name}</strong> is verlopen.
            Je account is automatisch overgezet naar het gratis plan.
          </p>
          <p style="color: #a3a3a3; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">
            Je scan-data is bewaard. Wil je weer upgraden? Je kunt op elk moment een nieuw abonnement starten.
          </p>
          ${emailButton("Opnieuw upgraden", `${APP_URL}/pricing`)}
        `;

        await sendEmail({
          to: owner.email,
          subject: `Je SiteProof plan is gewijzigd naar Gratis`,
          html: baseEmailLayout({
            title: "Plan gewijzigd",
            preheader: `Je ${previousPlan} abonnement is verlopen. Upgrade wanneer je klaar bent.`,
            content,
          }),
        }).catch((err) =>
          console.error(`[Cron] Failed to send downgrade email to ${owner.email}:`, err)
        );
      }
    }

    return NextResponse.json({
      success: true,
      checked: expiredOrgs.length,
      downgraded,
    });
  } catch (error) {
    console.error("[Cron] Check expired plans failed:", error);
    return NextResponse.json(
      { error: "Cron job mislukt" },
      { status: 500 }
    );
  }
}
