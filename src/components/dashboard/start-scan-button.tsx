"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { nl } from "@/lib/i18n/nl";
import { toast } from "sonner";
import { Loader2, Play } from "lucide-react";

interface StartScanButtonProps {
  websiteId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function StartScanButton({
  websiteId,
  variant = "default",
  size = "default",
  className,
}: StartScanButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);

    try {
      const res = await fetch("/api/scan/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ websiteId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || nl.scan.scanFailed);
        setLoading(false);
        return;
      }

      toast.success("Scan voltooid!");
      router.push(`/dashboard/scans/${data.data.id}`);
    } catch {
      toast.error(nl.scan.scanFailed);
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleStart}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Scan wordt uitgevoerd...
        </>
      ) : (
        <>
          <Play className="size-4" />
          {nl.dashboard.startScan}
        </>
      )}
    </Button>
  );
}
