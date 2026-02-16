import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { nl } from "@/lib/i18n/nl";
import { formatDate } from "@/lib/utils";
import { Plus, FileText, Eye, Pencil } from "lucide-react";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    include: { author: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{nl.admin.blog}</h1>
          <p className="text-sm text-muted-foreground">
            Beheer blogposts en content.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="size-4" />
            {nl.admin.newPost}
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <FileText className="size-10 text-muted-foreground/50" />
            <div>
              <p className="font-medium">Geen blogposts</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Schrijf je eerste blogpost om verkeer aan te trekken.
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/blog/new">
                <Plus className="size-4" />
                {nl.admin.newPost}
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{post.title}</p>
                    <Badge
                      variant={post.status === "PUBLISHED" ? "default" : post.status === "SCHEDULED" ? "secondary" : "outline"}
                      className="text-xs shrink-0"
                    >
                      {post.status === "PUBLISHED" ? nl.admin.published : post.status === "SCHEDULED" ? nl.admin.scheduled : nl.admin.draft}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    {post.publishedAt && (
                      <span>{formatDate(post.publishedAt)}</span>
                    )}
                    {post.category && <span>{post.category}</span>}
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {post.viewCount}
                    </span>
                    {post.author?.fullName && (
                      <span>{post.author.fullName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/blog/${post.id}/edit`}>
                      <Pencil className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
