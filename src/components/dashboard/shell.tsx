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
import { SidebarPlanCard } from "@/components/dashboard/sidebar-plan-card";
import { type PlanType } from "@/lib/features";
import { getFeatureGates } from "@/lib/features";
import {
  Shield,
  LayoutDashboard,
  Globe,
  FileText,
  Settings,
  CreditCard,
  Palette,
  Key,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Lock,
} from "lucide-react";

interface DashboardShellProps {
  user: {
    id: string;
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  organization: {
    id: string;
    name: string;
    planType: string;
  } | null;
  children: React.ReactNode;
}

const navItems: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact: boolean;
  gatedFeature?: keyof ReturnType<typeof getFeatureGates>;
  gatedPlan?: string;
}> = [
  { href: "/dashboard", label: nl.dashboard.overview, icon: LayoutDashboard, exact: true },
  { href: "/dashboard/websites", label: nl.dashboard.websites, icon: Globe, exact: false },
  { href: "/dashboard/reports", label: nl.dashboard.reports, icon: FileText, exact: true, gatedFeature: "pdfExport", gatedPlan: "Starter" },
  { href: "/dashboard/settings", label: nl.dashboard.settings, icon: Settings, exact: false },
  { href: "/dashboard/settings/billing", label: nl.dashboard.billing, icon: CreditCard, exact: true },
  { href: "/dashboard/settings/white-label", label: nl.dashboard.whiteLabel, icon: Palette, exact: true, gatedFeature: "whitelabel", gatedPlan: "Bureau" },
  { href: "/dashboard/settings/api", label: nl.dashboard.api, icon: Key, exact: true, gatedFeature: "apiAccess", gatedPlan: "Bureau" },
];

export function DashboardShell({ user, organization, children }: DashboardShellProps) {
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

  const planType = (organization?.planType ?? "FREE") as PlanType;

  const gates = getFeatureGates(planType);

  const sidebar = (
    <div className="flex flex-1 flex-col">
      <nav className="flex flex-1 flex-col gap-1 p-4" aria-label="Dashboard navigatie">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          const isLocked = item.gatedFeature ? !gates[item.gatedFeature] : false;

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
              <span className="flex-1">{item.label}</span>
              {isLocked && (
                <span className="flex items-center gap-1">
                  <Lock className="size-3 text-muted-foreground/50" />
                  {item.gatedPlan && (
                    <Badge variant="outline" className="px-1 py-0 text-[9px] font-normal text-muted-foreground/60">
                      {item.gatedPlan}
                    </Badge>
                  )}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <SidebarPlanCard planType={planType} />
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-card/30 md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-border/40 px-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Shield className="size-5 text-primary" />
            {nl.common.appName}
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
              <Link href="/" className="flex items-center gap-2 text-lg font-bold">
                <Shield className="size-5 text-primary" />
                {nl.common.appName}
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
            {organization && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{organization.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {organization.planType}
                </Badge>
              </div>
            )}
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
                <p className="text-sm font-medium">{user.fullName || "Gebruiker"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">{nl.dashboard.settings}</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings/billing">{nl.dashboard.billing}</Link>
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
