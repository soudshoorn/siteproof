"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { nl } from "@/lib/i18n/nl";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { Save, Eye, Trash2, Loader2 } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  metaDescription: string | null;
  category: string | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  publishedAt: string | null;
}

interface BlogEditorProps {
  post?: BlogPost;
}

const CATEGORIES = ["WCAG", "EAA", "Tutorials", "Nieuws"];

export function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter();
  const isEditing = !!post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [category, setCategory] = useState(post?.category ?? "");
  const [tagsInput, setTagsInput] = useState(post?.tags?.join(", ") ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "SCHEDULED">(post?.status ?? "DRAFT");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  const handleTitleChange = useCallback((value: string) => {
    setTitle(value);
    if (!slugManual && !isEditing) {
      setSlug(slugify(value));
    }
  }, [slugManual, isEditing]);

  async function handleSave(publishStatus?: "DRAFT" | "PUBLISHED") {
    const finalStatus = publishStatus ?? status;

    if (!title.trim() || !slug.trim() || !content.trim()) {
      toast.error("Titel, slug en inhoud zijn verplicht.");
      return;
    }

    setSaving(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content,
      metaDescription: metaDescription.trim() || null,
      category: category || null,
      tags,
      status: finalStatus,
    };

    try {
      const url = isEditing
        ? `/api/admin/blog/${post.id}`
        : "/api/admin/blog";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Opslaan mislukt.");
        return;
      }

      toast.success(
        finalStatus === "PUBLISHED" ? "Post gepubliceerd!" : "Post opgeslagen!"
      );

      if (!isEditing) {
        router.push(`/admin/blog/${data.post.id}/edit`);
      } else {
        router.refresh();
      }
    } catch {
      toast.error("Er ging iets mis bij het opslaan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEditing) return;
    if (!confirm("Weet je zeker dat je deze post wilt verwijderen?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Verwijderen mislukt.");
        return;
      }

      toast.success("Post verwijderd.");
      router.push("/admin/blog");
    } catch {
      toast.error("Er ging iets mis.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
      {/* Main editor */}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">{nl.admin.postTitle}</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Titel van je blogpost"
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">{nl.admin.postSlug}</Label>
          <div className="flex gap-2">
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManual(true);
              }}
              placeholder="url-slug"
              className="font-mono text-sm"
            />
            <span className="flex items-center text-xs text-muted-foreground shrink-0">
              /blog/{slug || "..."}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">{nl.admin.postContent} (Markdown)</Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Schrijf je post in Markdown..."
            className="min-h-[400px] font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">{nl.admin.postExcerpt}</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Korte samenvatting voor de blog-overzichtspagina"
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Acties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={status === "PUBLISHED" ? "default" : status === "SCHEDULED" ? "secondary" : "outline"}>
                {status === "PUBLISHED" ? nl.admin.published : status === "SCHEDULED" ? nl.admin.scheduled : nl.admin.draft}
              </Badge>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleSave("PUBLISHED")}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {nl.admin.publishPost}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave("DRAFT")}
                disabled={saving}
                className="w-full"
              >
                {nl.admin.saveDraft}
              </Button>
              {isEditing && (
                <>
                  <Button
                    variant="ghost"
                    asChild
                    className="w-full"
                  >
                    <a href={`/blog/${slug}`} target="_blank" rel="noopener noreferrer">
                      <Eye className="size-4" />
                      {nl.admin.preview}
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full"
                  >
                    {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                    {nl.common.delete}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">{nl.admin.postCategory}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kies een categorie" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">{nl.admin.postTags}</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-muted-foreground">Kommagescheiden.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta description (SEO)</Label>
              <Textarea
                id="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Beschrijving voor zoekmachines"
                className="min-h-[60px]"
              />
              <p className="text-xs text-muted-foreground">
                {metaDescription.length}/160 tekens
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
