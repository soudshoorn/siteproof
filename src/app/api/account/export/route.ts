import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/supabase/auth";

export async function GET() {
  const user = await requireAuth();

  // Gather all user data for AVG data portability
  const userData = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      memberships: {
        include: {
          organization: {
            include: {
              websites: {
                include: {
                  scans: {
                    include: {
                      pages: true,
                      issues: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userData) {
    return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
  }

  // Strip internal IDs and sensitive fields for export
  const exportData = {
    exportedAt: new Date().toISOString(),
    user: {
      email: userData.email,
      fullName: userData.fullName,
      createdAt: userData.createdAt,
    },
    organizations: userData.memberships.map((m) => ({
      name: m.organization.name,
      role: m.role,
      plan: m.organization.planType,
      websites: m.organization.websites.map((w) => ({
        name: w.name,
        url: w.url,
        scans: w.scans.map((s) => ({
          status: s.status,
          score: s.score,
          totalPages: s.totalPages,
          totalIssues: s.totalIssues,
          criticalIssues: s.criticalIssues,
          seriousIssues: s.seriousIssues,
          moderateIssues: s.moderateIssues,
          minorIssues: s.minorIssues,
          createdAt: s.createdAt,
          completedAt: s.completedAt,
          pages: s.pages.map((p) => ({
            url: p.url,
            title: p.title,
            score: p.score,
            issueCount: p.issueCount,
          })),
          issues: s.issues.map((i) => ({
            severity: i.severity,
            wcagCriteria: i.wcagCriteria,
            description: i.description,
            fixSuggestion: i.fixSuggestion,
            pageUrl: i.pageUrl,
            htmlElement: i.htmlElement,
          })),
        })),
      })),
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="siteproof-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
