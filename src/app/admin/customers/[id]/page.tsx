import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CustomerDetail } from "@/components/admin/customer-detail";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { select: { id: true, fullName: true, email: true, createdAt: true } } },
      },
      websites: {
        include: {
          scans: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { id: true, score: true, status: true, totalIssues: true, createdAt: true },
          },
        },
      },
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  return <CustomerDetail organization={JSON.parse(JSON.stringify(organization))} />;
}
