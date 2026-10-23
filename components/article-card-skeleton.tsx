import { cn } from "@/lib/utils";

export function ArticleCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border bg-card p-4 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 pt-2">
        <div className="h-5 w-24 bg-muted rounded-md" />
      </div>

      {/* Title */}
      <div className="space-y-2 mb-3">
        <div className="h-5 bg-muted rounded w-full" />
        <div className="h-5 bg-muted rounded w-3/4" />
      </div>

      {/* Summary */}
      <div className="space-y-2 mb-4 flex-1">
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-4 bg-muted rounded w-2/3" />
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-14 bg-muted rounded-md" />
        <div className="h-5 w-16 bg-muted rounded-md" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="h-4 w-16 bg-muted rounded" />
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}
