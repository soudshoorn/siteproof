import { requireAdmin } from "@/lib/supabase/auth";
import { AdminShell } from "@/components/admin/shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <AdminShell
      user={{ id: user.id, fullName: user.fullName, email: user.email }}
    >
      {children}
    </AdminShell>
  );
}
