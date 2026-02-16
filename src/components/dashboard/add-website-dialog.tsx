"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { nl } from "@/lib/i18n/nl";
import { toast } from "sonner";
import { AlertCircle, Loader2 } from "lucide-react";

interface AddWebsiteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
}

export function AddWebsiteDialog({
  open,
  onOpenChange,
  organizationId,
}: AddWebsiteDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    let url = (formData.get("url") as string).trim();
    const name = (formData.get("name") as string).trim();

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    try {
      const res = await fetch("/api/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, name, organizationId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Er ging iets mis.");
        setLoading(false);
        return;
      }

      toast.success("Website toegevoegd!");
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{nl.dashboard.addWebsite}</DialogTitle>
          <DialogDescription>
            Voeg een website toe om te scannen op toegankelijkheid.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="website-name">{nl.dashboard.websiteName}</Label>
            <Input
              id="website-name"
              name="name"
              required
              placeholder="Mijn Website"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website-url">{nl.dashboard.websiteUrl}</Label>
            <Input
              id="website-url"
              name="url"
              type="text"
              required
              placeholder="mijnwebsite.nl"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {nl.common.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {nl.common.loading}
                </>
              ) : (
                nl.dashboard.addWebsite
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
