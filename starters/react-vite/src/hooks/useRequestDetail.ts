import { useEffect, useState, useCallback } from "react";
import { getRequestDetail, listRequestEvents } from "../api";
import type { HelpdeskRequest, RequestEvent } from "../types";

export function useRequestDetail(requestId: number | null) {
  const [request, setRequest] = useState<HelpdeskRequest | null>(null);
  const [events, setEvents] = useState<RequestEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!requestId) {
      setRequest(null);
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reqPromise = getRequestDetail(requestId);

      async function fetchAllEvents() {
        let page = 1;
        let all: RequestEvent[] = [];
        while (true) {
          const res = await listRequestEvents(requestId!, page, 100);
          all = all.concat(res.data);
          if (page >= (res.total_pages ?? 1)) break;
          page++;
        }
        return all;
      }

      const [reqRes, allEvents] = await Promise.all([reqPromise, fetchAllEvents()]);
      setRequest(reqRes.data);
      setEvents(allEvents);
    } catch (err: any) {
      setError(err?.message || "Failed to load request details");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { request, events, loading, error, refetch: fetchData };
}