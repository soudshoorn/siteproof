import { Skeleton } from "@/components/ui/skeleton";

export default function ScanPageLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <Skeleton className="mx-auto h-10 w-72" />
      <Skeleton className="mx-auto mt-4 h-5 w-96" />
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-14 flex-1 rounded-xl" />
        <Skeleton className="h-14 w-40 rounded-xl" />
      </div>
    </div>
  );
}
