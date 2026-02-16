"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { nl } from "@/lib/i18n/nl";
import { formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  Activity,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";

interface Scan {
  id: string;
  status: string;
  score: number | null;
  totalPages: number;
  scannedPages: number;
  totalIssues: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  website: {
    name: string;
    url: string;
    organization: { name: string } | null;
  };
  startedBy: { fullName: string | null; email: string } | null;
}

const statusIcons: Record<string, typeof CheckCircle> = {
  COMPLETED: CheckCircle,
  FAILED: XCircle,
  QUEUED: Clock,
  CRAWLING: Zap,
  SCANNING: Activity,
  ANALYZING: Activity,
};

const statusColors: Record<string, string> = {
  COMPLETED: "default",
  FAILED: "destructive",
  QUEUED: "outline",
  CRAWLING: "secondary",
  SCANNING: "secondary",
  ANALYZING: "secondary",
};

export function ScanMonitoring() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [restartingId, setRestartingId] = useState<string | null>(null);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "25" });
    if (statusFilter !== "ALL") params.set("status", statusFilter);

    try {
      const res = await fetch(`/api/admin/scans?${params}`);
      const data = await res.json();
      setScans(data.scans);
      setTotal(data.total);
      setStatusCounts(data.statusCounts);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchScans, 10000);
    return () => clearInterval(interval);
  }, [fetchScans]);

  async function handleRestart(scanId: string) {
    setRestartingId(scanId);
    try {
      const res = await fetch(`/api/admin/scans/${scanId}/restart`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Herstarten mislukt.");
        return;
      }
      toast.success("Scan opnieuw gestart.");
      fetchScans();
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setRestartingId(null);
    }
  }

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{nl.admin.scans}</h1>
          <p className="text-sm text-muted-foreground">
            Monitoring en queue status.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchScans}>
          <RefreshCw className="size-4" />
          Vernieuwen
        </Button>
      </div>

      {/* Queue status overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(["QUEUED", "CRAWLING", "SCANNING", "ANALYZING", "COMPLETED", "FAILED"] as const).map((status) => {
          const Icon = statusIcons[status] ?? Activity;
          return (
            <Card
              key={status}
              className={`cursor-pointer transition-colors ${statusFilter === status ? "border-primary" : "hover:border-primary/30"}`}
              onClick={() => {
                setStatusFilter(statusFilter === status ? "ALL" : status);
                setPage(1);
              }}
            >
              <CardContent className="flex items-center gap-3 py-3">
                <Icon className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold">{statusCounts[status] ?? 0}</p>
                  <p className="text-xs text-muted-foreground">{status}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scans list */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : scans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Activity className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Geen scans gevonden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {scans.map((scan) => (
            <Card key={scan.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">
                      {scan.website.name}
                    </p>
                    <Badge
                      variant={statusColors[scan.status] as "default" | "secondary" | "outline" | "destructive"}
                      className="text-xs shrink-0"
                    >
                      {scan.status}
                    </Badge>
                    {scan.score != null && (
                      <Badge
                        variant={scan.score >= 80 ? "default" : scan.score >= 50 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        Score: {Math.round(scan.score)}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{scan.website.url}</span>
                    {scan.website.organization && (
                      <span>{scan.website.organization.name}</span>
                    )}
                    <span>{formatRelativeTime(scan.createdAt)}</span>
                    {scan.totalPages > 0 && (
                      <span>{scan.scannedPages}/{scan.totalPages} pagina&apos;s</span>
                    )}
                    {scan.totalIssues > 0 && (
                      <span>{scan.totalIssues} issues</span>
                    )}
                    {scan.startedBy && (
                      <span>Door: {scan.startedBy.fullName || scan.startedBy.email}</span>
                    )}
                  </div>
                  {scan.errorMessage && (
                    <p className="mt-1 text-xs text-destructive line-clamp-2">
                      {scan.errorMessage}
                    </p>
                  )}
                </div>
                <div className="shrink-0 ml-4">
                  {(scan.status === "FAILED" || scan.status === "COMPLETED") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestart(scan.id)}
                      disabled={restartingId === scan.id}
                    >
                      {restartingId === scan.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <RotateCcw className="size-4" />
                      )}
                      Herstart
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {page} van {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
