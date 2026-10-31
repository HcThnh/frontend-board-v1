import { useAppData } from "../../hooks/useAppData";
import { useRequests } from "../../hooks/useRequests";
import { useUrlState } from "../../hooks/useUrlState";
import { FilterBar } from "./FilterBar";
import { RequestTable } from "./RequestTable";

export function BoardPage({ onSelectRequest }: { onSelectRequest: (id: number) => void }) {
  const { sites, siteMap, staffMap, statuses, loading: metaLoading, error: metaError } = useAppData();
  const [filters, setFilters] = useUrlState();
  const { data, loading, error } = useRequests(filters, siteMap);

  if (metaError) return <div className="error-state">Failed to load app data: {metaError}</div>;

  return (
    <main className="board-page">
      <header className="board-header">
        <h1>Bluebay Helpdesk Board</h1>
      </header>

      <FilterBar filters={filters} onChange={setFilters} sites={sites} statuses={statuses} />

      {loading || metaLoading ? (
        <div className="loading-state" aria-live="polite">Loading requests…</div>
      ) : error ? (
        <div className="error-state" role="alert">{error}</div>
      ) : data.length === 0 ? (
        <div className="empty-state">No requests found. Try widening the date range.</div>
      ) : (
        <RequestTable
          requests={data}
          siteMap={siteMap}
          staffMap={staffMap}
          statuses={statuses}
          onSelect={onSelectRequest}
        />
      )}
    </main>
  );
}