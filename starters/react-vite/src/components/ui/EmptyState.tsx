interface Props {
  message?: string;
  onResetFilters?: () => void;
}

export function EmptyState({
  message = "No requests matched your filter criteria.",
  onResetFilters,
}: Props) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon" aria-hidden="true">∅</div>
      <h3>No Records Found</h3>
      <p>{message}</p>
      {onResetFilters && (
        <button className="reset-btn" onClick={onResetFilters}>
          Reset Filter to Last 30 Days
        </button>
      )}
    </div>
  );
}