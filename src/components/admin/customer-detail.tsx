"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { nl } from "@/lib/i18n/nl";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import {
  ArrowLeft,
  Globe,
  Users,
  CreditCard,
  Save,
  Loader2,
  Plus,
  Trash2,
  StickyNote,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  planType: string;
  maxWebsites: number;
  maxPagesPerScan: number;
  mollieCustomerId: string | null;
  mollieSubscriptionId: string | null;
  mollieCurrentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
  members: Array<{
    id: string;
    role: string;
    user: { id: string; fullName: string | null; email: string; createdAt: string };
  }>;
  websites: Array<{
    id: string;
    name: string;
    url: string;
    scans: Array<{
      id: string;
      score: number | null;
      status: string;
      totalIssues: number;
      createdAt: string;
    }>;
  }>;
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
  }>;
}

export function CustomerDetail({ organization }: { organization: Organization }) {
  const router = useRouter();
  const [planType, setPlanType] = useState(organization.planType);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(organization.notes);
  const [addingNote, setAddingNote] = useState(false);

  async function handlePlanChange() {
    if (planType === organization.planType) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      if (!res.ok) {
        toast.error("Plan wijzigen mislukt.");
        return;
      }
      toast.success("Plan gewijzigd.");
      router.refresh();
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const res = await fetch(`/api/admin/customers/${organization.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteText.trim() }),
      });
      if (!res.ok) {
        toast.error("Notitie toevoegen mislukt.");
        return;
      }
      const data = await res.json();
      setNotes([data.note, ...notes]);
      setNoteText("");
      toast.success("Notitie toegevoegd.");
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setAddingNote(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      const res = await fetch(`/api/admin/customers/${organization.id}/notes?noteId=${noteId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error("Verwijderen mislukt.");
        return;
      }
      setNotes(notes.filter((n) => n.id !== noteId));
      toast.success("Notitie verwijderd.");
    } catch {
      toast.error("Er ging iets mis.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="size-4" />
            Terug
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{organization.name}</h1>
        <Badge variant="secondary">{organization.planType}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Org info + plan management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="size-4" />
              Abonnement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Slug</p>
                <p className="text-sm font-mono">{organization.slug}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aangemeld</p>
                <p className="text-sm">{formatDate(organization.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max websites</p>
                <p className="text-sm">{organization.maxWebsites}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max pagina&apos;s/scan</p>
                <p className="text-sm">{organization.maxPagesPerScan}</p>
              </div>
              {organization.mollieCustomerId && (
                <div>
                  <p className="text-xs text-muted-foreground">Mollie Customer ID</p>
                  <p className="text-sm font-mono">{organization.mollieCustomerId}</p>
                </div>
              )}
              {organization.mollieCurrentPeriodEnd && (
                <div>
                  <p className="text-xs text-muted-foreground">Periode tot</p>
                  <p className="text-sm">{formatDate(organization.mollieCurrentPeriodEnd)}</p>
                </div>
              )}
            </div>

            <div className="border-t border-border/40 pt-4">
              <p className="text-xs text-muted-foreground mb-2">Plan handmatig wijzigen</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">Free</SelectItem>
                    <SelectItem value="STARTER">Starter</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="BUREAU">Bureau</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handlePlanChange}
                  disabled={saving || planType === organization.planType}
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Opslaan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="size-4" />
              Leden ({organization.members.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/40">
            {organization.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium">{member.user.fullName || member.user.email}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
                <Badge variant="outline" className="text-xs">{member.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Websites */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="size-4" />
              Websites ({organization.websites.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border/40">
            {organization.websites.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">Geen websites.</p>
            ) : (
              organization.websites.map((website) => {
                const lastScan = website.scans[0];
                return (
                  <div key={website.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{website.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{website.url}</p>
                    </div>
                    {lastScan && lastScan.score != null ? (
                      <Badge
                        variant={lastScan.score >= 80 ? "default" : lastScan.score >= 50 ? "secondary" : "destructive"}
                      >
                        {Math.round(lastScan.score)}
                      </Badge>
                    ) : lastScan ? (
                      <Badge variant="outline" className="text-xs">{lastScan.status}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Geen scan</span>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <StickyNote className="size-4" />
              Notities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Voeg een notitie toe..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleAddNote}
                disabled={addingNote || !noteText.trim()}
              >
                {addingNote ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              </Button>
            </div>
            <div className="divide-y divide-border/40">
              {notes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">Geen notities.</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="flex items-start justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(note.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
                      aria-label="Notitie verwijderen"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
