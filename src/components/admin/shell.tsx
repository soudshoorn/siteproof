"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/auth/actions";
import {
  ShieldAlert,
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  BarChart3,
  FileEdit,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";

interface AdminShellProps {
  user: {
    id: string;
    fullName: string | null;
    email: string;
  };
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin", label: nl.admin.dashboard, icon: LayoutDashboard, exact: true },
  { href: "/admin/blog", label: nl.admin.blog, icon: FileText, exact: false },
  { href: "/admin/customers", label: nl.admin.customers, icon: Users, exact: false },
  { href: "/admin/scans", label: nl.admin.scans, icon: Activity, exact: false },
  { href: "/admin/analytics", label: nl.admin.analytics, icon: BarChart3, exact: false },
  { href: "/admin/pages", label: nl.admin.pages, icon: FileEdit, exact: false },
  { href: "/admin/settings", label: nl.admin.settings, icon: Settings, exact: true },
];

export function AdminShell({ user, children }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email[0].toUpperCase();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const sidebar = (
    <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Admin navigatie">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setSidebarOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}

      <div className="my-3 border-t border-border/40" />

      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Terug naar dashboard
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-card/30 md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border/40 px-6">
          <Link href="/admin" className="flex items-center gap-2 text-lg font-bold">
            <ShieldAlert className="size-5 text-primary" />
            <span>{nl.common.appName}</span>
            <Badge variant="secondary" className="text-[10px]">Admin</Badge>
          </Link>
        </div>
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-background shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border/40 px-6">
              <Link href="/admin" className="flex items-center gap-2 text-lg font-bold">
                <ShieldAlert className="size-5 text-primary" />
                <span>Admin</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Menu sluiten"
                className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-border/40 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground md:hidden"
              aria-label="Menu openen"
            >
              <Menu className="size-5" />
            </button>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              Admin Panel
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm sm:inline">
                  {user.fullName || user.email}
                </span>
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.fullName || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <form action={logoutAction}>
                  <button type="submit" className="flex w-full items-center gap-2">
                    <LogOut className="size-4" />
                    {nl.common.logout}
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
