"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { nl } from "@/lib/i18n/nl";

interface NotificationPreferences {
  scanCompleted: boolean;
  scoreDropAlert: boolean;
  criticalIssueAlert: boolean;
  weeklyReport: boolean;
}

interface NotificationPreferencesFormProps {
  planSupportsEmail: boolean;
}

export function NotificationPreferencesForm({
  planSupportsEmail,
}: NotificationPreferencesFormProps) {
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      const res = await fetch("/api/notifications/preferences");
      const data = await res.json();
      if (data.success) {
        setPreferences(data.data.preferences);
      }
    } catch {
      setError("Kon notificatie-instellingen niet laden.");
    }
  }

  async function updatePreference(
    key: keyof NotificationPreferences,
    value: boolean
  ) {
    if (!planSupportsEmail) return;

    setSaving(key);
    setError(null);

    // Optimistic update
    setPreferences((prev) => (prev ? { ...prev, [key]: value } : prev));

    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setPreferences((prev) => (prev ? { ...prev, [key]: !value } : prev));
        setError(data.error || "Kon instelling niet opslaan.");
      }
    } catch {
      setPreferences((prev) => (prev ? { ...prev, [key]: !value } : prev));
      setError("Kon instelling niet opslaan.");
    } finally {
      setSaving(null);
    }
  }

  const notificationOptions: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
  }[] = [
    {
      key: "scanCompleted",
      label: "Scan voltooid",
      description:
        "Ontvang een e-mail wanneer een scan is afgerond met de score en gevonden issues.",
    },
    {
      key: "scoreDropAlert",
      label: "Score daling",
      description:
        "Ontvang een waarschuwing wanneer de score van een website met meer dan 10 punten daalt.",
    },
    {
      key: "criticalIssueAlert",
      label: "Kritieke issues",
      description:
        "Ontvang direct een melding bij nieuwe kritieke toegankelijkheidsproblemen.",
    },
    {
      key: "weeklyReport",
      label: "Wekelijks rapport",
      description:
        "Ontvang elke maandag een samenvatting van alle websites met scores en trends.",
    },
  ];

  if (!preferences) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{nl.dashboard.notificationSettings}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-64 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-5 w-8 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{nl.dashboard.notificationSettings}</CardTitle>
          {!planSupportsEmail && (
            <Badge variant="secondary" className="text-xs">
              {nl.common.upgrade} voor e-mail alerts
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="divide-y divide-border/40">
          {notificationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
            >
              <div className="space-y-0.5 pr-4">
                <Label
                  htmlFor={`notification-${option.key}`}
                  className="text-sm font-medium"
                >
                  {option.label}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
              <Switch
                id={`notification-${option.key}`}
                checked={preferences[option.key]}
                onCheckedChange={(checked) =>
                  updatePreference(option.key, checked)
                }
                disabled={!planSupportsEmail || saving === option.key}
                aria-label={option.label}
              />
            </div>
          ))}
        </div>

        {!planSupportsEmail && (
          <p className="mt-4 text-xs text-muted-foreground">
            E-mail notificaties zijn beschikbaar vanaf het Starter plan.{" "}
            <a
              href="/pricing"
              className="text-primary underline underline-offset-2 hover:no-underline"
            >
              Bekijk prijzen
            </a>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
