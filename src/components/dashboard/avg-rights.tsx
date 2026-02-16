"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Trash2, Loader2, AlertTriangle } from "lucide-react";

interface AvgRightsProps {
  userEmail: string;
}

export function AvgRights({ userEmail }: AvgRightsProps) {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        toast.error("Data exporteren mislukt.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `siteproof-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Data succesvol geëxporteerd.");
    } catch {
      toast.error("Er ging iets mis bij het exporteren.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (confirmEmail !== userEmail) {
      toast.error("Het e-mailadres komt niet overeen.");
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Account verwijderen mislukt.");
        return;
      }

      toast.success("Account verwijderd. Je wordt uitgelogd.");
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Privacy & AVG-rechten</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Op grond van de AVG heb je recht op inzage, rectificatie, vergetelheid en dataportabiliteit.
        </p>

        {/* Data export */}
        <div className="flex items-center justify-between rounded-lg border border-border/40 p-4">
          <div>
            <p className="text-sm font-medium">Data exporteren</p>
            <p className="text-xs text-muted-foreground">
              Download al je gegevens als JSON-bestand (recht op dataportabiliteit).
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Exporteren
          </Button>
        </div>

        {/* Account deletion */}
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
          <div>
            <p className="text-sm font-medium text-destructive">Account verwijderen</p>
            <p className="text-xs text-muted-foreground">
              Verwijder je account en alle bijbehorende gegevens permanent (recht op vergetelheid).
            </p>
          </div>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="size-4" />
                Verwijderen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-destructive" />
                  Account definitief verwijderen
                </DialogTitle>
                <DialogDescription>
                  Dit kan niet ongedaan worden gemaakt. Alle gegevens worden permanent verwijderd:
                  je profiel, organisaties waar je de enige eigenaar bent, websites, scans en rapporten.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm-email">
                    Typ je e-mailadres ter bevestiging: <span className="font-mono text-xs">{userEmail}</span>
                  </Label>
                  <Input
                    id="confirm-email"
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder={userEmail}
                    autoComplete="off"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setConfirmEmail("");
                  }}
                >
                  Annuleren
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting || confirmEmail !== userEmail}
                >
                  {deleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Definitief verwijderen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
