"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { nl } from "@/lib/i18n/nl";
import { formatDate } from "@/lib/utils";
import { Search, Users, ArrowRight, ChevronLeft, ChevronRight, Download } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  slug: string;
  planType: string;
  ownerEmail: string | null;
  ownerName: string | null;
  websiteCount: number;
  memberCount: number;
  createdAt: string;
  mollieCustomerId: string | null;
}

const planColors: Record<string, string> = {
  FREE: "outline",
  STARTER: "secondary",
  PROFESSIONAL: "default",
  BUREAU: "default",
};

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "25" });
    if (search) params.set("search", search);
    if (planFilter !== "ALL") params.set("plan", planFilter);

    try {
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers);
      setTotal(data.total);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const totalPages = Math.ceil(total / 25);

  async function handleExportCSV() {
    const params = new URLSearchParams({ page: "1", limit: "10000" });
    if (planFilter !== "ALL") params.set("plan", planFilter);
    const res = await fetch(`/api/admin/customers?${params}`);
    const data = await res.json();

    const headers = ["Naam", "Plan", "Eigenaar", "Email", "Websites", "Leden", "Aangemeld"];
    const rows = data.customers.map((c: Customer) => [
      c.name,
      c.planType,
      c.ownerName ?? "",
      c.ownerEmail ?? "",
      c.websiteCount,
      c.memberCount,
      new Date(c.createdAt).toLocaleDateString("nl-NL"),
    ]);

    const csv = [headers, ...rows].map((r) => r.map((v: string | number) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `klanten-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{nl.admin.customers}</h1>
          <p className="text-sm text-muted-foreground">
            {total} organisaties totaal
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="size-4" />
          CSV export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam of e-mail..."
            className="pl-9"
          />
        </div>
        <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle plans</SelectItem>
            <SelectItem value="FREE">Free</SelectItem>
            <SelectItem value="STARTER">Starter</SelectItem>
            <SelectItem value="PROFESSIONAL">Professional</SelectItem>
            <SelectItem value="BUREAU">Bureau</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Users className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Geen klanten gevonden.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => (
            <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
              <Card className="transition-colors hover:border-primary/30">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{customer.name}</p>
                      <Badge variant={planColors[customer.planType] as "default" | "secondary" | "outline" | "destructive"} className="text-xs shrink-0">
                        {customer.planType}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{customer.ownerEmail}</span>
                      <span>{customer.websiteCount} websites</span>
                      <span>{customer.memberCount} leden</span>
                      <span>{formatDate(customer.createdAt)}</span>
                    </div>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground shrink-0 ml-4" />
                </CardContent>
              </Card>
            </Link>
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
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
