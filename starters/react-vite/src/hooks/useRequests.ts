import { useEffect, useState } from "react";
import { listRequests } from "../api";
import type { HelpdeskRequest, Site } from "../types";
import { toSiteLocalDateStr } from "../lib/timezone";
import type { BoardFilters } from "./useUrlState";

export function useRequests(filters: BoardFilters, siteMap: Map<number, Site>) {
  const [data, setData] = useState<HelpdeskRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const filtered = raw.filter((r) => {
          if (r.status === "canceled") return false;
          if (r.deleted_at !== null) return false;
          if (r.merged_into_id !== null) return false;

          const site = siteMap.get(r.site_id);
          if (!site) return true;
          const localDate = toSiteLocalDateStr(r.created_at, site.timezone);

          const [fd, fm, fy] = filters.from.split("/");
          const [td, tm, ty] = filters.to.split("/");
          const fromISO = `${fy}-${fm}-${fd}`;
          const toISO = `${ty}-${tm}-${td}`;
          return localDate >= fromISO && localDate <= toISO;
        });

        const bySite = filters.site
          ? filtered.filter((r) => String(r.site_id) === filters.site)
          : filtered;

        const byStatus = filters.statuses.length
          ? bySite.filter((r) => filters.statuses.includes(r.status))
          : bySite;

        const sorted = [...byStatus].sort((a, b) => {
          const av = filters.sort === "due_on" ? (a.due_on ?? "") : a.created_at;
          const bv = filters.sort === "due_on" ? (b.due_on ?? "") : b.created_at;
          return filters.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        });

        setData(sorted);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters, siteMap]);

  return { data, loading, error };
}