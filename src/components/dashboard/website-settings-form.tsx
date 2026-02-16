"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "@/components/ui/dialog";
import { nl } from "@/lib/i18n/nl";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

interface WebsiteSettingsFormProps {
  website: {
    id: string;
    name: string;
    url: string;
    schedule: {
      id: string;
      frequency: string;
      isActive: boolean;
    } | null;
  };
  canDelete: boolean;
}

export function WebsiteSettingsForm({
  website,
  canDelete,
}: WebsiteSettingsFormProps) {
  const router = useRouter();
  const [name, setName] = useState(website.name);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/websites/${website.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Opslaan mislukt.");
      } else {
        toast.success("Website bijgewerkt!");
        router.refresh();
      }
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/websites/${website.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Verwijderen mislukt.");
        setDeleting(false);
      } else {
        toast.success("Website verwijderd.");
        router.push("/dashboard/websites");
      }
    } catch {
      toast.error("Er ging iets mis.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/dashboard/websites/${website.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Terug naar {website.name}
        </Link>
        <h1 className="text-2xl font-bold">Website instellingen</h1>
        <p className="text-sm text-muted-foreground">{website.url}</p>
      </div>

      {/* General settings */}
      <Card>
        <CardHeader>
          <CardTitle>Algemeen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-name">{nl.dashboard.websiteName}</Label>
              <Input
                id="website-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={website.url} disabled />
              <p className="text-xs text-muted-foreground">
                De URL kan niet worden gewijzigd. Verwijder de website en voeg een nieuwe toe.
              </p>
            </div>
            <Button type="submit" disabled={saving || name === website.name}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {nl.common.loading}
                </>
              ) : (
                nl.common.save
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger zone */}
      {canDelete && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-destructive">Gevarenzone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {nl.dashboard.deleteWebsiteConfirm}
            </p>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              {nl.dashboard.deleteWebsite}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{nl.dashboard.deleteWebsite}</DialogTitle>
            <DialogDescription>
              {nl.dashboard.deleteWebsiteConfirm}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              {nl.common.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Verwijderen...
                </>
              ) : (
                nl.common.delete
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
