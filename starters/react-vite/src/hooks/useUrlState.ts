import { useCallback, useMemo } from "react";

export interface BoardFilters {
  from: string;
  to: string;
  site: string;
  statuses: string[];
  sort: "created_at" | "due_on";
  dir: "asc" | "desc";
}

function defaultFilters(): BoardFilters {
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

export function useUrlState(): [BoardFilters, (f: Partial<BoardFilters>) => void] {
  const params = new URLSearchParams(window.location.search);

  const filters: BoardFilters = useMemo(() => {
    const def = defaultFilters();
    return {
      from: params.get("from") ?? def.from,
      to: params.get("to") ?? def.to,
      site: params.get("site") ?? def.site,
      statuses: params.get("statuses")?.split(",") ?? def.statuses,
      sort: (params.get("sort") as BoardFilters["sort"]) ?? def.sort,
      dir: (params.get("dir") as BoardFilters["dir"]) ?? def.dir,
    };
  }, [window.location.search]);

  const setFilters = useCallback((next: Partial<BoardFilters>) => {
    const merged = { ...filters, ...next };
    const p = new URLSearchParams({
      from: merged.from,
      to: merged.to,
      ...(merged.site && { site: merged.site }),
      statuses: merged.statuses.join(","),
      sort: merged.sort,
      dir: merged.dir,
    });
    window.history.replaceState(null, "", `?${p.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, [filters]);

  return [filters, setFilters];
}