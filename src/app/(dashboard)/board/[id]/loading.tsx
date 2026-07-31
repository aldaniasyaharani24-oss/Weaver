import { LoadingSpinner } from "@/components/common/loading-spinner";

export default function BoardDetailLoading() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
              <div className="min-h-[200px] p-2 rounded-lg bg-muted/50">
                <LoadingSpinner />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
