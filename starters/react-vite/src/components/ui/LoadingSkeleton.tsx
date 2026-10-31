export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="skeleton-container" aria-busy="true" aria-label="Loading content">
      <div className="skeleton-table">
        <div className="skeleton-row skeleton-header-row" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton-row" />
        ))}
      </div>
    </div>
  );
}