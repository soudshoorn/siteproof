"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { nl } from "@/lib/i18n/nl";
import {
  Palette,
  Globe,
  ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

interface WhiteLabelData {
  customLogoUrl: string | null;
  customPrimaryColor: string | null;
  customDomain: string | null;
}

export function WhiteLabelSettings() {
  const [data, setData] = useState<WhiteLabelData>({
    customLogoUrl: null,
    customPrimaryColor: "#0D9488",
    customDomain: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/white-label");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error);
      }
    } catch {
      setError("Kon white-label instellingen niet laden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/white-label", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customLogoUrl: data.customLogoUrl || null,
          customPrimaryColor: data.customPrimaryColor || null,
          customDomain: data.customDomain || null,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(json.error);
      }
    } catch {
      setError("Kon instellingen niet opslaan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-score-good/30 bg-score-good/5 p-3 text-sm text-score-good">
          <CheckCircle2 className="size-4 shrink-0" />
          White-label instellingen opgeslagen.
        </div>
      )}

      {/* Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="size-4" />
            Custom logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upload je logo naar Supabase Storage en plak de URL hier. Het logo wordt gebruikt in het dashboard en op PDF-rapporten.
          </p>
          <Input
            placeholder="https://... (URL naar je logo)"
            value={data.customLogoUrl ?? ""}
            onChange={(e) =>
              setData((d) => ({ ...d, customLogoUrl: e.target.value }))
            }
          />
          {data.customLogoUrl && (
            <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
              <p className="mb-2 text-xs text-muted-foreground">Voorbeeld:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.customLogoUrl}
                alt="Custom logo voorbeeld"
                className="max-h-16 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Primary color */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="size-4" />
            Primaire kleur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Kies een primaire kleur voor je dashboard en PDF-rapporten.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={data.customPrimaryColor ?? "#0D9488"}
              onChange={(e) =>
                setData((d) => ({ ...d, customPrimaryColor: e.target.value }))
              }
              className="size-10 cursor-pointer rounded border border-border bg-transparent"
              aria-label="Primaire kleur kiezen"
            />
            <Input
              value={data.customPrimaryColor ?? "#0D9488"}
              onChange={(e) =>
                setData((d) => ({ ...d, customPrimaryColor: e.target.value }))
              }
              placeholder="#0D9488"
              className="max-w-[150px] font-mono"
            />
            <div
              className="size-10 rounded-lg border border-border"
              style={{ backgroundColor: data.customPrimaryColor ?? "#0D9488" }}
              aria-hidden="true"
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="size-4" />
            Custom domein
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Gebruik je eigen domein voor het dashboard (bijv. accessibility.jouwbureau.nl).
            Je klanten zien dan jouw merk in plaats van SiteProof.
          </p>
          <Input
            placeholder="accessibility.jouwbureau.nl"
            value={data.customDomain ?? ""}
            onChange={(e) =>
              setData((d) => ({ ...d, customDomain: e.target.value }))
            }
          />
          {data.customDomain && (
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Info className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-medium">DNS instellen</p>
                <p className="mt-1 text-muted-foreground">
                  Maak een CNAME record aan voor{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    {data.customDomain}
                  </code>{" "}
                  dat verwijst naar{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                    cname.siteproof.nl
                  </code>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          {nl.common.save}
        </Button>
      </div>
    </div>
  );
}
