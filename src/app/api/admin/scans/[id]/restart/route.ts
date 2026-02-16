import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/supabase/auth";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;

  const scan = await prisma.scan.findUnique({
    where: { id },
    select: { websiteId: true, status: true },
  });

  if (!scan) {
    return NextResponse.json({ error: "Scan niet gevonden" }, { status: 404 });
  }

  if (!["FAILED", "COMPLETED"].includes(scan.status)) {
    return NextResponse.json(
      { error: "Alleen mislukte of voltooide scans kunnen opnieuw gestart worden" },
      { status: 400 }
    );
  }

  // Create a new scan for the same website
  const newScan = await prisma.scan.create({
    data: {
      websiteId: scan.websiteId,
      status: "QUEUED",
    },
  });

  // If BullMQ is available, add to queue
  try {
    const { scanQueue } = await import("@/lib/scanner/queue");
    if (scanQueue) {
      await scanQueue.add("scan", {
        scanId: newScan.id,
        websiteId: scan.websiteId,
      });
    }
  } catch {
    // Queue not available — scan stays in QUEUED
  }

  return NextResponse.json({ scan: newScan }, { status: 201 });
}
