import { useState, useCallback, useEffect } from "react";

export interface BoardFilters {
  from: string;
  to: string;
  site: string;
  statuses: string[];
  sort: "created_at" | "due_on";
  dir: "asc" | "desc";
}

function getDefaultFilters(): BoardFilters {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 30);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  return {
    from: fmt(from),
    to: fmt(today),
    site: "",
    statuses: ["pending", "processing", "complete"],
    sort: "created_at",
    dir: "desc",
  };
}

function parseUrlFilters(): BoardFilters {
  const params = new URLSearchParams(window.location.search);
  const def = getDefaultFilters();
  return {
    from: params.get("from") ?? def.from,
    to: params.get("to") ?? def.to,
    site: params.get("site") ?? def.site,
    statuses: params.get("statuses") ? params.get("statuses")!.split(",") : def.statuses,
    sort: (params.get("sort") as BoardFilters["sort"]) || def.sort,
    dir: (params.get("dir") as BoardFilters["dir"]) || def.dir,
  };
}

export function useUrlState(): [BoardFilters, (f: Partial<BoardFilters>) => void] {
  const [filters, setFiltersState] = useState<BoardFilters>(parseUrlFilters);

  useEffect(() => {
    const onPopState = () => {
      setFiltersState(parseUrlFilters());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setFilters = useCallback((next: Partial<BoardFilters>) => {
    setFiltersState((prev) => {
      const merged = { ...prev, ...next };

      const p = new URLSearchParams();
      p.set("from", merged.from);
      p.set("to", merged.to);
      if (merged.site) p.set("site", merged.site);
      if (merged.statuses.length > 0) p.set("statuses", merged.statuses.join(","));
      p.set("sort", merged.sort);
      p.set("dir", merged.dir);

      const nextUrl = `?${p.toString()}`;
      if (window.location.search !== nextUrl) {
        window.history.replaceState(null, "", nextUrl);
      }
      return merged;
    });
  }, []);

  return [filters, setFilters];
}