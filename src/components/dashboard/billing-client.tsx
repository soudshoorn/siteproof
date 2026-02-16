"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { nl } from "@/lib/i18n/nl";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  CreditCard,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Receipt,
  RefreshCw,
} from "lucide-react";

interface Payment {
  id: string;
  amount: string;
  status: string;
  description: string;
  createdAt: string;
  method: string | null;
}

interface SubscriptionInfo {
  id: string;
  status: string;
  amount: string;
  interval: string;
  nextPaymentDate: string | null;
}

interface BillingClientProps {
  organizationId: string;
  planType: string;
  planName: string;
  isPaid: boolean;
  monthlyPrice: number;
  maxWebsites: number;
  maxPagesPerScan: number;
  periodEnd: string | null;
  hasSubscription: boolean;
}

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  paid: { label: "Betaald", color: "text-score-good" },
  pending: { label: "In afwachting", color: "text-severity-moderate" },
  open: { label: "Open", color: "text-severity-moderate" },
  failed: { label: "Mislukt", color: "text-severity-critical" },
  expired: { label: "Verlopen", color: "text-muted-foreground" },
  canceled: { label: "Geannuleerd", color: "text-muted-foreground" },
};

const methodLabels: Record<string, string> = {
  ideal: "iDEAL",
  creditcard: "Creditcard",
  bancontact: "Bancontact",
  directdebit: "SEPA Incasso",
  paypal: "PayPal",
};

export function BillingClient({
  planType,
  planName,
  isPaid,
  monthlyPrice,
  maxWebsites,
  maxPagesPerScan,
  periodEnd,
  hasSubscription,
}: BillingClientProps) {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [changingMethod, setChangingMethod] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [upgrading, setUpgrading] = useState(false);

  // Check URL params for status messages and auto-upgrade
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const upgradePlan = params.get("upgrade");

    if (status === "success") {
      setStatusMessage({
        type: "success",
        text: "Betaling geslaagd! Je plan wordt bijgewerkt.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (status === "method-updated") {
      setStatusMessage({
        type: "success",
        text: "Betaalmethode succesvol bijgewerkt.",
      });
      window.history.replaceState({}, "", window.location.pathname);
    } else if (upgradePlan) {
      // Auto-trigger checkout for the selected plan
      window.history.replaceState({}, "", window.location.pathname);
      const validPlans = ["starter", "professional", "bureau"];
      if (validPlans.includes(upgradePlan.toLowerCase())) {
        handleUpgrade(upgradePlan.toUpperCase());
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpgrade(plan: string) {
    setUpgrading(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/mollie/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType: plan, interval: "monthly" }),
      });
      const data = await res.json();
      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Kon de checkout niet starten. Probeer het opnieuw.",
        });
        setUpgrading(false);
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Er is een fout opgetreden bij het starten van de checkout.",
      });
      setUpgrading(false);
    }
  }

  const fetchBillingInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/mollie/subscription");
      const data = await res.json();
      if (data.success) {
        setSubscription(data.data.subscription);
        setPayments(data.data.payments ?? []);
        setPaymentMethod(data.data.paymentMethod);
      }
    } catch {
      // Mollie not configured — show basic view
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPaid) {
      fetchBillingInfo();
    } else {
      setLoading(false);
    }
  }, [isPaid, fetchBillingInfo]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/mollie/subscription", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: "success",
          text: data.data.message,
        });
        setCancelDialogOpen(false);
        setSubscription(null);
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Kon het abonnement niet opzeggen.",
        });
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Er is een fout opgetreden. Probeer het later opnieuw.",
      });
    } finally {
      setCancelling(false);
    }
  }

  async function handleChangePaymentMethod() {
    setChangingMethod(true);
    try {
      const res = await fetch("/api/mollie/payment-method", { method: "POST" });
      const data = await res.json();
      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "Kon de betaalmethode niet bijwerken.",
        });
        setChangingMethod(false);
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "Er is een fout opgetreden.",
      });
      setChangingMethod(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{nl.dashboard.billing}</h1>
        <p className="text-sm text-muted-foreground">
          Beheer je abonnement en facturatie.
        </p>
      </div>

      {/* Upgrade in progress */}
      {upgrading && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <Loader2 className="size-8 animate-spin text-primary" />
            <div>
              <p className="text-lg font-medium">Checkout wordt gestart...</p>
              <p className="text-sm text-muted-foreground">
                Je wordt doorgestuurd naar de betaalpagina.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status messages */}
      {statusMessage && (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 ${
            statusMessage.type === "success"
              ? "border-score-good/30 bg-score-good/5"
              : "border-destructive/30 bg-destructive/5"
          }`}
          role="alert"
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-score-good" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          )}
          <p className="text-sm">{statusMessage.text}</p>
        </div>
      )}

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Huidig plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{planName}</span>
            <Badge variant="secondary">{nl.pricing.currentPlan}</Badge>
            {isPaid && !hasSubscription && periodEnd && (
              <Badge variant="outline" className="border-severity-moderate/30 text-severity-moderate">
                Opgezegd
              </Badge>
            )}
          </div>

          {isPaid && monthlyPrice > 0 && (
            <p className="text-lg">
              {formatCurrency(monthlyPrice)}
              <span className="text-sm text-muted-foreground">
                {nl.common.perMonth}
              </span>
            </p>
          )}

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">
                {nl.pricing.websites}
              </span>
              <span className="font-medium">{maxWebsites}</span>
            </div>
            <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
              <span className="text-muted-foreground">
                {nl.pricing.pagesPerScan}
              </span>
              <span className="font-medium">{maxPagesPerScan}</span>
            </div>
          </div>

          {/* Period end notice */}
          {isPaid && periodEnd && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              {hasSubscription ? (
                <span>Volgende factuurdatum: {formatDate(periodEnd)}</span>
              ) : (
                <span>Plan actief tot: {formatDate(periodEnd)}</span>
              )}
            </div>
          )}

          {/* Free plan upgrade CTA */}
          {!isPaid && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm">
                Upgrade je plan voor meer websites, meer pagina&apos;s per scan,
                en extra features zoals e-mail alerts en PDF exports.
              </p>
              <Button className="mt-3" asChild>
                <Link href="/pricing">
                  {nl.common.upgrade}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}

          {/* Paid plan actions */}
          {isPaid && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" asChild>
                <Link href="/pricing">
                  <ArrowUpRight className="size-4" />
                  Plan wijzigen
                </Link>
              </Button>

              {paymentMethod && (
                <Button
                  variant="outline"
                  onClick={handleChangePaymentMethod}
                  disabled={changingMethod}
                >
                  {changingMethod ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  Betaalmethode wijzigen
                </Button>
              )}

              {hasSubscription && (
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      Abonnement opzeggen
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Abonnement opzeggen</DialogTitle>
                      <DialogDescription>
                        Weet je zeker dat je je {planName} abonnement wilt
                        opzeggen? Je plan blijft actief tot het einde van je
                        huidige factureringsperiode
                        {periodEnd ? ` (${formatDate(periodEnd)})` : ""}.
                        Daarna wordt je account automatisch terugezet naar het
                        Gratis plan.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setCancelDialogOpen(false)}
                      >
                        Behouden
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={cancelling}
                      >
                        {cancelling && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                        Ja, opzeggen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment method */}
      {isPaid && paymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Betaalmethode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CreditCard className="size-5 text-muted-foreground" />
              <span>{methodLabels[paymentMethod] ?? paymentMethod}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      {isPaid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Receipt className="size-5" />
              Factuurgeschiedenis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : payments.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nog geen betalingen.
              </p>
            ) : (
              <div className="space-y-1">
                {payments.map((payment, index) => {
                  const statusInfo = paymentStatusLabels[payment.status] ?? {
                    label: payment.status,
                    color: "text-muted-foreground",
                  };

                  return (
                    <div key={payment.id}>
                      {index > 0 && <Separator className="my-1" />}
                      <div className="flex items-center justify-between py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {payment.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(payment.createdAt)}
                            {payment.method &&
                              ` · ${methodLabels[payment.method] ?? payment.method}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className="font-medium">{payment.amount}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
