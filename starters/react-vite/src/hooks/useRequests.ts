import { useEffect, useState, useCallback } from "react";
import { listRequests } from "../api";
import type { HelpdeskRequest, Site, Change } from "../types";
import { toSiteLocalDateStr } from "../lib/timezone";
import type { BoardFilters } from "./useUrlState";

export function useRequests(filters: BoardFilters, siteMap: Map<number, Site>) {
  const [data, setData] = useState<HelpdeskRequest[]>([]);
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
    [filters, siteMap]
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
      .then((raw) => {
        const filtered = raw.filter(isEligible);
        sortData(filtered);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters, siteMap, isEligible]);

  const sortData = (items: HelpdeskRequest[]) => {
    const sorted = [...items].sort((a, b) => {
      const av = filters.sort === "due_on" ? (a.due_on ?? "") : a.created_at;
      const bv = filters.sort === "due_on" ? (b.due_on ?? "") : b.created_at;
      return filters.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    setData(sorted);
  };

  const applyLiveChanges = useCallback(
    (changes: Change[]) => {
      setData((prev) => {
        let currentMap = new Map<number, HelpdeskRequest>(prev.map((r) => [r.id, r]));

        for (const ch of changes) {
          if ((ch.type === "request.created" || ch.type === "request.updated") && ch.request) {
            const req = ch.request;
            if (isEligible(req)) {
              currentMap.set(req.id, req);
            } else {
              currentMap.delete(req.id);
            }
          }
        }

        const nextList = Array.from(currentMap.values());
        return nextList.sort((a, b) => {
          const av = filters.sort === "due_on" ? (a.due_on ?? "") : a.created_at;
          const bv = filters.sort === "due_on" ? (b.due_on ?? "") : b.created_at;
          return filters.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });
      });
    },
    [filters, isEligible]
  );

  return { data, loading, error, applyLiveChanges };
}