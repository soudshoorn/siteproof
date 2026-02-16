import { prisma } from "@/lib/db";
import { jsonSuccess, jsonError } from "@/lib/api/helpers";

/**
 * GET /api/scan/quick/[id]
 *
 * Poll for quick scan results. No auth required.
 * Returns the current status and results when complete.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quickScan = await prisma.quickScan.findUnique({
      where: { id },
    });

    if (!quickScan) {
      return jsonError("Scan niet gevonden.", 404);
    }

    // Return appropriate response based on status
    switch (quickScan.status) {
      case "QUEUED":
      case "CRAWLING":
      case "SCANNING":
      case "ANALYZING":
        return jsonSuccess({
          id: quickScan.id,
          url: quickScan.url,
          status: quickScan.status,
          score: null,
          results: null,
        });

      case "COMPLETED":
        return jsonSuccess({
          id: quickScan.id,
          url: quickScan.url,
          status: quickScan.status,
          score: quickScan.score,
          results: quickScan.results,
          createdAt: quickScan.createdAt,
        });

      case "FAILED":
        return jsonSuccess({
          id: quickScan.id,
          url: quickScan.url,
          status: quickScan.status,
          score: null,
          results: quickScan.results,
          createdAt: quickScan.createdAt,
        });

      default:
        return jsonSuccess({
          id: quickScan.id,
          url: quickScan.url,
          status: quickScan.status,
          score: quickScan.score,
          results: quickScan.results,
        });
    }
  } catch (error) {
    console.error("Quick scan poll error:", error);
    return jsonError("Er is een onverwachte fout opgetreden.", 500);
  }
}
