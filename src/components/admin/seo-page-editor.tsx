"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, ExternalLink } from "lucide-react";

interface SeoPage {
  id: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  content: string;
}

export function SeoPageEditor({ page }: { page: SeoPage }) {
  const router = useRouter();
  const [title, setTitle] = useState(page.title);
  const [metaDescription, setMetaDescription] = useState(page.metaDescription ?? "");
  const [content, setContent] = useState(page.content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) {
      toast.error("Titel is verplicht.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          metaDescription: metaDescription.trim() || null,
          content,
        }),
      });

      if (!res.ok) {
        toast.error("Opslaan mislukt.");
        return;
      }

      toast.success("Pagina opgeslagen.");
      router.refresh();
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/pages">
              <ArrowLeft className="size-4" />
              Terug
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">/{page.slug}</h1>
            <p className="text-sm text-muted-foreground">SEO pagina bewerken</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Bekijk
            </a>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Opslaan
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pagina titel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown/HTML)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Pagina content..."
              className="min-h-[400px] font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta description (SEO)</Label>
            <Textarea
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Beschrijving voor zoekmachines"
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              {metaDescription.length}/160 tekens
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
