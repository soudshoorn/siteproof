import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { addQuickScanJob } from "@/lib/scanner/queue";
import { applyRateLimit, jsonSuccess, jsonError } from "@/lib/api/helpers";

const quickScanSchema = z.object({
  url: z
    .string()
    .url("Voer een geldige URL in (bijv. https://jouwwebsite.nl)")
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === "https:" || parsed.protocol === "http:";
        } catch {
          return false;
        }
      },
      { message: "URL moet beginnen met http:// of https://" }
    ),
});

/**
 * POST /api/scan/quick
 *
 * Start a free quick scan (1 page, no auth required).
 * Rate limited to 3 per IP per day.
 *
 * Request body: { url: string }
 * Response: { success: true, data: { id: string, status: string } }
 */
export async function POST(request: Request) {
  try {
    // Rate limit: 3 quick scans per IP per day
    const rateLimitResponse = await applyRateLimit("quickScan");
    if (rateLimitResponse) return rateLimitResponse;

    // Parse and validate body
    const body = await request.json().catch(() => null);
    if (!body) {
      return jsonError("Ongeldige request body.", 400);
    }

    const validation = quickScanSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return NextResponse.json(
        {
          success: false,
          error: "Validatiefout",
          details: errors,
        },
        { status: 400 }
      );
    }

    // Normalize URL
    const parsedUrl = new URL(validation.data.url);
    // Ensure https if no protocol specified
    const url =
      parsedUrl.protocol === "http:"
        ? validation.data.url
        : validation.data.url;

    // Get client IP for tracking
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Create QuickScan record
    const quickScan = await prisma.quickScan.create({
      data: {
        url,
        status: "QUEUED",
        ipAddress: ip,
      },
    });

    // Queue the job
    try {
      await addQuickScanJob({
        quickScanId: quickScan.id,
        url,
      });
    } catch {
      // Redis not available — update status to failed
      await prisma.quickScan.update({
        where: { id: quickScan.id },
        data: {
          status: "FAILED",
          results: {
            error:
              "Scanner is momenteel niet beschikbaar. Probeer het later opnieuw.",
          },
        },
      });

      return jsonError(
        "Scanner is momenteel niet beschikbaar. Probeer het later opnieuw.",
        503
      );
    }

    return jsonSuccess(
      {
        id: quickScan.id,
        status: quickScan.status,
        url: quickScan.url,
      },
      201
    );
  } catch (error) {
    console.error("Quick scan error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
