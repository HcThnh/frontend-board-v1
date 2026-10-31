interface Props {
  lastSyncedAt: Date | null;
  isSyncing: boolean;
  onManualSync: () => void;
  timezone?: string;
}

export function SyncIndicator({ lastSyncedAt, isSyncing, onManualSync, timezone }: Props) {
  const timeFormatted = lastSyncedAt
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short",
      }).format(lastSyncedAt)
    : "Never";

  return (
    <div className="sync-indicator" role="status" aria-live="polite">
      <span className={`sync-dot ${isSyncing ? "sync-dot--syncing" : ""}`} />
      <span className="sync-text">
        Last synced: <strong>{timeFormatted}</strong>
      </span>
      <button
        className="sync-btn"
        onClick={onManualSync}
        disabled={isSyncing}
        title="Refresh now"
        aria-label="Refresh data"
      >
        {isSyncing ? "..." : "↻"}
      </button>
    </div>
  );
}