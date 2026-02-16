import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { z } from "zod/v4";

const schema = z.object({
  email: z.email("Ongeldig e-mailadres"),
});

export async function POST(request: NextRequest) {
  await requireAdmin();

  const body = await request.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Ongeldig e-mailadres" },
      { status: 400 }
    );
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "SiteProof <noreply@siteproof.nl>",
      to: result.data.email,
      subject: "SiteProof — Test e-mail",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #0D9488;">SiteProof Test E-mail</h1>
          <p>Als je dit kunt lezen, werkt de e-mail configuratie correct.</p>
          <p style="color: #666; font-size: 14px;">
            Verstuurd vanuit het SiteProof admin panel.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "E-mail verzenden mislukt. Controleer je Resend API key." },
      { status: 500 }
    );
  }
}
