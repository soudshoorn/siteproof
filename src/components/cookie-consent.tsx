"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import { Cookie, ChevronDown, ChevronUp } from "lucide-react";

const CONSENT_KEY = "siteproof-cookie-consent";

interface CookiePreferences {
  necessary: boolean; // always true
  analytical: boolean;
  marketing: boolean;
  timestamp: number;
}

function getStoredConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CookiePreferences;
  } catch {
    return null;
  }
}

function storeConsent(prefs: CookiePreferences) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(prefs));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytical, setAnalytical] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getStoredConsent();
    if (!existing) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    storeConsent({
      necessary: true,
      analytical: true,
      marketing: true,
      timestamp: Date.now(),
    });
    setVisible(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    storeConsent({
      necessary: true,
      analytical: false,
      marketing: false,
      timestamp: Date.now(),
    });
    setVisible(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    storeConsent({
      necessary: true,
      analytical,
      marketing,
      timestamp: Date.now(),
    });
    setVisible(false);
  }, [analytical, marketing]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={nl.cookieConsent.title}
      aria-modal="false"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-sm",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}
    >
      <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-sm font-semibold">{nl.cookieConsent.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {nl.cookieConsent.message}{" "}
                <Link
                  href="/cookies"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Meer informatie
                </Link>
              </p>
            </div>

            {/* Expandable preferences */}
            {expanded && (
              <div className="space-y-3 rounded-lg border border-border/40 p-4">
                {/* Necessary — always on */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      {nl.cookieConsent.necessary}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {nl.cookieConsent.necessaryDesc}
                    </p>
                  </div>
                  <Switch checked disabled aria-label={nl.cookieConsent.necessary} />
                </div>

                {/* Analytical */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cookie-analytical" className="text-sm font-medium">
                      {nl.cookieConsent.analytical}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {nl.cookieConsent.analyticalDesc}
                    </p>
                  </div>
                  <Switch
                    id="cookie-analytical"
                    checked={analytical}
                    onCheckedChange={setAnalytical}
                    aria-label={nl.cookieConsent.analytical}
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cookie-marketing" className="text-sm font-medium">
                      {nl.cookieConsent.marketing}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {nl.cookieConsent.marketingDesc}
                    </p>
                  </div>
                  <Switch
                    id="cookie-marketing"
                    checked={marketing}
                    onCheckedChange={setMarketing}
                    aria-label={nl.cookieConsent.marketing}
                  />
                </div>

                <Button
                  size="sm"
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto"
                >
                  {nl.cookieConsent.savePreferences}
                </Button>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleAcceptAll}>
                {nl.cookieConsent.acceptAll}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectAll}>
                {nl.cookieConsent.rejectAll}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-muted-foreground"
              >
                {nl.cookieConsent.customize}
                {expanded ? (
                  <ChevronUp className="ml-1 size-3" />
                ) : (
                  <ChevronDown className="ml-1 size-3" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility to check current cookie consent status from anywhere in the app.
 * Use this before loading analytics scripts or marketing pixels.
 */
export function getCookieConsent(): CookiePreferences | null {
  return getStoredConsent();
}

export function hasAnalyticalConsent(): boolean {
  return getStoredConsent()?.analytical ?? false;
}

export function hasMarketingConsent(): boolean {
  return getStoredConsent()?.marketing ?? false;
}
