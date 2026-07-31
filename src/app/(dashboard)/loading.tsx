import { LoadingSpinner } from "@/components/common/loading-spinner";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <LoadingSpinner />
      </div>
    </div>
  );
}
