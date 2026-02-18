"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { nl } from "@/lib/i18n/nl";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

interface EventFunnel {
  scansStarted: number;
  scansCompleted: number;
  signupsFromScan: number;
  upgradeClicked: number;
  checkoutStarted: number;
  checkoutCompleted: number;
  scanLimitHit: number;
}

interface AnalyticsData {
  quickScansByDay: Array<{ date: string; count: number }>;
  signupsByDay: Array<{ date: string; count: number }>;
  funnel: {
    quickScans: number;
    registrations: number;
    paidConversions: number;
    conversionRate: string;
  };
  eventFunnel?: EventFunnel;
  cancelledOrgs: number;
  topPosts: Array<{
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    publishedAt: string | null;
  }>;
  totalUsers: number;
  totalPaidOrgs: number;
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`);
        const json = await res.json();
        setData(json);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [days]);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{nl.admin.analytics}</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const totalQuickScansInPeriod = data.quickScansByDay.reduce((s, d) => s + d.count, 0);
  const totalSignupsInPeriod = data.signupsByDay.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{nl.admin.analytics}</h1>
          <p className="text-sm text-muted-foreground">
            Inzicht in groei en conversie.
          </p>
        </div>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Afgelopen 7 dagen</SelectItem>
            <SelectItem value="30">Afgelopen 30 dagen</SelectItem>
            <SelectItem value="90">Afgelopen 90 dagen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4" />
            Conversie funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-4">
            <FunnelStep
              label="Gratis scans"
              value={data.funnel.quickScans}
              color="text-blue-500"
            />
            <ArrowRight className="size-5 text-muted-foreground rotate-90 sm:rotate-0" />
            <FunnelStep
              label="Registraties"
              value={data.funnel.registrations}
              color="text-green-500"
            />
            <ArrowRight className="size-5 text-muted-foreground rotate-90 sm:rotate-0" />
            <FunnelStep
              label="Betaald"
              value={data.funnel.paidConversions}
              color="text-primary"
            />
            <div className="text-center">
              <p className="text-2xl font-bold">{data.funnel.conversionRate}%</p>
              <p className="text-xs text-muted-foreground">Conversie</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed event funnel */}
      {data.eventFunnel && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-4" />
              Gedetailleerde conversie funnel ({days} dagen)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Quick scans gestart", value: data.eventFunnel.scansStarted, color: "bg-blue-500" },
                { label: "Quick scans voltooid", value: data.eventFunnel.scansCompleted, color: "bg-blue-400" },
                { label: "Registraties na scan", value: data.eventFunnel.signupsFromScan, color: "bg-green-500" },
                { label: "Upgrade clicks", value: data.eventFunnel.upgradeClicked, color: "bg-yellow-500" },
                { label: "Checkout gestart", value: data.eventFunnel.checkoutStarted, color: "bg-orange-500" },
                { label: "Betaling voltooid", value: data.eventFunnel.checkoutCompleted, color: "bg-primary" },
              ].map((step, i, arr) => {
                const maxValue = Math.max(...arr.map((s) => s.value), 1);
                const pct = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
                const prevValue = i > 0 ? arr[i - 1].value : null;
                const convRate = prevValue && prevValue > 0
                  ? ((step.value / prevValue) * 100).toFixed(1)
                  : null;

                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 text-sm">
                      {step.label}
                    </div>
                    <div className="flex-1 h-6 rounded bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded ${step.color} transition-all`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <div className="w-12 text-right text-sm font-bold">
                      {step.value}
                    </div>
                    {convRate && (
                      <div className="w-16 text-right text-xs text-muted-foreground">
                        {convRate}%
                      </div>
                    )}
                  </div>
                );
              })}
              {data.eventFunnel.scanLimitHit > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {data.eventFunnel.scanLimitHit}x scan limiet bereikt (potentiele upgrades)
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Period stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
              <BarChart3 className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalQuickScansInPeriod}</p>
              <p className="text-xs text-muted-foreground">Gratis scans ({days}d)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
              <Users className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSignupsInPeriod}</p>
              <p className="text-xs text-muted-foreground">Signups ({days}d)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.totalPaidOrgs}</p>
              <p className="text-xs text-muted-foreground">Betaalde klanten</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10">
              <ArrowDown className="size-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data.cancelledOrgs}</p>
              <p className="text-xs text-muted-foreground">Churn (verlopen)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity charts (simple bar representation) */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gratis scans per dag</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={data.quickScansByDay} color="bg-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Signups per dag</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={data.signupsByDay} color="bg-green-500" />
          </CardContent>
        </Card>
      </div>

      {/* Top posts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="size-4" />
            Populairste blogposts
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/40">
          {data.topPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Geen gepubliceerde posts.</p>
          ) : (
            data.topPosts.map((post, i) => (
              <div key={post.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-sm font-bold text-muted-foreground w-6 text-right">
                    {i + 1}.
                  </span>
                  <p className="truncate text-sm font-medium">{post.title}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 ml-4">
                  <Eye className="size-3 mr-1" />
                  {post.viewCount}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FunnelStep({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function SimpleBarChart({
  data,
  color,
}: {
  data: Array<{ date: string; count: number }>;
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  // Show last 14 data points for readability
  const visible = data.slice(-14);

  return (
    <div className="flex items-end gap-1 h-24">
      {visible.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-sm ${color} min-h-[2px] transition-all`}
            style={{ height: `${(d.count / max) * 100}%` }}
            title={`${d.date}: ${d.count}`}
          />
          {visible.length <= 7 && (
            <span className="text-[8px] text-muted-foreground">
              {d.date.slice(5)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
