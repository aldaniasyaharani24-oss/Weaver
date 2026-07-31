export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}
