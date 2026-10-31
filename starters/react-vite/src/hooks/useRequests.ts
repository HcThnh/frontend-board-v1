import { useEffect, useState, useCallback, useMemo } from "react";
import { listRequests } from "../api";
import type { HelpdeskRequest, Site, Change } from "../types";
import { toSiteLocalDateStr } from "../lib/timezone";
import type { BoardFilters } from "./useUrlState";

export function useRequests(filters: BoardFilters, siteMap: Map<number, Site>) {
  const [rawRequests, setRawRequests] = useState<HelpdeskRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEligible = useCallback(
    (r: HelpdeskRequest): boolean => {
      if (r.status === "canceled") return false;
      if (r.deleted_at !== null) return false;
      if (r.merged_into_id !== null) return false;

      if (filters.site && String(r.site_id) !== filters.site) return false;
      if (filters.statuses.length && !filters.statuses.includes(r.status)) return false;

      const site = siteMap.get(r.site_id);
      if (!site) return true;

      const localDate = toSiteLocalDateStr(r.created_at, site.timezone);
      const [fd, fm, fy] = filters.from.split("/");
      const [td, tm, ty] = filters.to.split("/");
      return localDate >= `${fy}-${fm}-${fd}` && localDate <= `${ty}-${tm}-${td}`;
    },
    [filters.site, filters.statuses, filters.from, filters.to, siteMap]
  );

  useEffect(() => {
    if (siteMap.size === 0) return;
    setLoading(true);
    setError(null);

    async function fetchAll() {
      let page = 1;
      let all: HelpdeskRequest[] = [];
      while (true) {
        const res = await listRequests({
          created_from: filters.from,
          created_to: filters.to,
          page,
          per_page: 100,
        });
        all = all.concat(res.data);
        if (page >= (res.total_pages ?? 1)) break;
        page++;
      }
      return all;
    }

    fetchAll()
      .then((items) => {
        setRawRequests(items);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters.from, filters.to, siteMap]);

  const applyLiveChanges = useCallback(
    (changes: Change[]) => {
      setRawRequests((prev) => {
        const map = new Map<number, HelpdeskRequest>(prev.map((r) => [r.id, r]));
        for (const ch of changes) {
          if ((ch.type === "request.created" || ch.type === "request.updated") && ch.request) {
            map.set(ch.request.id, ch.request);
          }
        }
        return Array.from(map.values());
      });
    },
    []
  );

  const data = useMemo(() => {
    const filtered = rawRequests.filter(isEligible);

    return filtered.sort((a, b) => {
      if (filters.sort === "due_on") {
        if (!a.due_on && !b.due_on) return 0;
        if (!a.due_on) return 1;
        if (!b.due_on) return -1;

        return filters.dir === "asc"
          ? a.due_on.localeCompare(b.due_on)
          : b.due_on.localeCompare(a.due_on);
      }

      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return filters.dir === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [rawRequests, isEligible, filters.sort, filters.dir]);

  return { data, loading, error, applyLiveChanges };
}