import { useEffect, useState } from "react";
import { listSites, listStaff, listStatuses } from "../api";
import type { Site, StatusInfo } from "../types";


export interface AppData {
  sites: Site[];
  staffMap: Map<number, string>;
  siteMap: Map<number, Site>;
  statuses: StatusInfo[];
  loading: boolean;
  error: string | null;
}

export function useAppData(): AppData {
  const [sites, setSites] = useState<Site[]>([]);
  const [staffMap, setStaffMap] = useState<Map<number, string>>(new Map());
  const [siteMap, setSiteMap] = useState<Map<number, Site>>(new Map());
  const [statuses, setStatuses] = useState<StatusInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listSites(), listStaff(), listStatuses()])
      .then(([sitesRes, staffRes, statusRes]) => {
        setSites(sitesRes.data);
        setSiteMap(new Map(sitesRes.data.map((s) => [s.id, s])));
        setStaffMap(new Map(staffRes.data.map((s) => [s.id, s.name])));
        setStatuses(statusRes.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { sites, staffMap, siteMap, statuses, loading, error };
}