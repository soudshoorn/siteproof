import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ScanDetailLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-56" />
      </div>

      {/* Score summary */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6">
            <Skeleton className="size-24 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </CardContent>
        </Card>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 pt-6">
              <Skeleton className="size-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-3 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issues list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="mt-0.5 size-4 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
