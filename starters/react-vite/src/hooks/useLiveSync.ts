import { useEffect, useRef, useState, useCallback } from "react";
import { getChanges } from "../api";
import type { Change } from "../types";

interface LiveSyncHandlers {
  onChanges: (changes: Change[]) => void;
}

export function useLiveSync({ onChanges }: LiveSyncHandlers) {
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const cursorRef = useRef<string | undefined>(undefined);
  const isPollingRef = useRef(false);

  const pollChanges = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    setIsSyncing(true);

    try {
      const res = await getChanges(cursorRef.current, 500);
      
      if (res.data && res.data.length > 0) {
        onChanges(res.data);
      }

      cursorRef.current = res.next_cursor;
      setLastSyncedAt(new Date());
      setSyncError(null);
    } catch (err: any) {
      if (err?.status === 410) {
        cursorRef.current = undefined;
      }
      setSyncError(err?.message || "Sync failed");
    } finally {
      setIsSyncing(false);
      isPollingRef.current = false;
    }
  }, [onChanges]);

  useEffect(() => {
    pollChanges();

    const interval = setInterval(() => {
      pollChanges();
    }, 30000);

    return () => clearInterval(interval);
  }, [pollChanges]);

  return { lastSyncedAt, isSyncing, syncError, forceSync: pollChanges };
}