import { useState, useCallback } from "react";
import { useAppData } from "../../hooks/useAppData";
import { useRequests } from "../../hooks/useRequests";
import { useUrlState } from "../../hooks/useUrlState";
import { useLiveSync } from "../../hooks/useLiveSync";
import { FilterBar } from "./FilterBar";
import { RequestTable } from "./RequestTable";
import { DetailModal } from "../Detail/DetailModal";
import { SyncIndicator } from "../ui/SyncIndicator";
import type { Change } from "../../types";

export function BoardPage() {
  const { sites, siteMap, staffMap, statuses, loading: metaLoading, error: metaError } = useAppData();
  const [filters, setFilters] = useUrlState();
  const { data, loading, error, applyLiveChanges } = useRequests(filters, siteMap);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  const handleLiveChanges = useCallback(
    (changes: Change[]) => {
      applyLiveChanges(changes);

      for (const ch of changes) {
        if (ch.type === "staff.updated" && ch.staff) {
          staffMap.set(ch.staff.id, ch.staff.name);
        }
      }
    },
    [applyLiveChanges, staffMap]
  );

  const { lastSyncedAt, isSyncing, forceSync } = useLiveSync({
    onChanges: handleLiveChanges,
  });

  if (metaError) return <div className="error-state">Failed to load app data: {metaError}</div>;

  return (
    <main className="board-page">
      <header className="board-header">
        <h1>Bluebay Helpdesk Board</h1>
        <SyncIndicator
          lastSyncedAt={lastSyncedAt}
          isSyncing={isSyncing}
          onManualSync={forceSync}
        />
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
          onSelect={(id) => setSelectedRequestId(id)}
        />
      )}

      <DetailModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
        siteMap={siteMap}
        staffMap={staffMap}
        statuses={statuses}
      />
    </main>
  );
}