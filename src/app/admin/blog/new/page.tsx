import { nl } from "@/lib/i18n/nl";
import { BlogEditor } from "@/components/admin/blog-editor";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{nl.admin.newPost}</h1>
        <p className="text-sm text-muted-foreground">
          Schrijf een nieuwe blogpost.
        </p>
      </div>
      <BlogEditor />
    </div>
  );
}
