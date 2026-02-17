"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ScanWidgetProps {
  variant?: "hero" | "compact" | "full";
  className?: string;
}

export function ScanWidget({ variant = "hero", className }: ScanWidgetProps) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let scanUrl = url.trim();
    if (!scanUrl) return;
    if (!scanUrl.startsWith("http://") && !scanUrl.startsWith("https://")) {
      scanUrl = `https://${scanUrl}`;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/scan/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scanUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg =
          res.status === 429
            ? nl.scan.rateLimit
            : data.error || nl.scan.scanFailed;
        setError(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Redirect to result page — scan runs async, page polls for results
      router.push(`/scan/resultaat/${data.data.id}`);
    } catch {
      setError(nl.scan.scanFailed);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex w-full gap-3",
          variant === "hero" ? "flex-col sm:flex-row" : "flex-row"
        )}
      >
        <div className="relative flex-1">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={nl.landing.ctaPlaceholder}
            disabled={isSubmitting}
            className={cn(
              "border-border/50 bg-card/50 backdrop-blur-sm",
              variant === "hero"
                ? "h-14 px-5 text-base rounded-xl"
                : "h-10"
            )}
            aria-label="Website URL"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !url.trim()}
          size={variant === "hero" ? "lg" : "default"}
          className={cn(
            variant === "hero" &&
              "h-14 px-8 text-base rounded-xl font-semibold"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {nl.scan.scanning}
            </>
          ) : (
            <>
              {nl.landing.ctaButton}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {error && (
        <div
          className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
