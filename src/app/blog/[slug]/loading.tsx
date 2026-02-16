import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Skeleton className="h-5 w-20" />
      <Skeleton className="mt-4 h-10 w-full" />
      <Skeleton className="mt-2 h-10 w-3/4" />
      <div className="mt-4 flex items-center gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="mt-8 aspect-video w-full rounded-xl" />
      <div className="mt-10 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4 w-full"
            style={{ width: `${85 + Math.random() * 15}%` }}
          />
        ))}
        <Skeleton className="mt-6 h-7 w-64" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton
            key={`p2-${i}`}
            className="h-4 w-full"
            style={{ width: `${80 + Math.random() * 20}%` }}
          />
        ))}
      </div>
    </article>
  );
}
