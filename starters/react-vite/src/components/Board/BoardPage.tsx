import { useState, useCallback } from "react";
import { useAppData } from "../../hooks/useAppData";
import { useRequests } from "../../hooks/useRequests";
import { useUrlState } from "../../hooks/useUrlState";
import { useLiveSync } from "../../hooks/useLiveSync";
import { FilterBar } from "./FilterBar";
import { RequestTable } from "./RequestTable";
import { DetailModal } from "../Detail/DetailModal";
import { SyncIndicator } from "../ui/SyncIndicator";
import { ErrorAlert } from "../ui/ErrorAlert";
import { TableSkeleton } from "../ui/LoadingSkeleton";
import { EmptyState } from "../ui/EmptyState";
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

  const handleResetFilters = () => {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 30);
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    setFilters({
      from: fmt(from),
      to: fmt(today),
      site: "",
      statuses: ["pending", "processing", "complete"],
    });
  };

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

      {(metaError || error) && (
        <ErrorAlert
          error={metaError || error || "Failed to communicate with service"}
          onRetry={forceSync}
        />
      )}

      <FilterBar filters={filters} onChange={setFilters} sites={sites} statuses={statuses} />

      {loading || metaLoading ? (
        <TableSkeleton rows={8} />
      ) : data.length === 0 ? (
        <EmptyState onResetFilters={handleResetFilters} />
      ) : (
        <RequestTable
          requests={data}
          siteMap={siteMap}
          staffMap={staffMap}
          statuses={statuses}
          onSelect={(id) => setSelectedRequestId(id)}
          sortField={filters.sort}
          sortDir={filters.dir}
          onSortChange={(field) =>
            setFilters({
              sort: field,
              dir: filters.sort === field && filters.dir === "asc" ? "desc" : "asc",
            })
          }
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