import { LoadingSpinner } from "@/components/common/loading-spinner";

export default function WorkspaceDetailLoading() {
  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      <div className="h-10 w-64 bg-muted animate-pulse rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
      <LoadingSpinner />
    </div>
  );
}
