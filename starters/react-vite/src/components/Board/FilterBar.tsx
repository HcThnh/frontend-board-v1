import type { BoardFilters } from "../../hooks/useUrlState";
import type { Site, StatusInfo } from "../../types";

interface Props {
  filters: BoardFilters;
  onChange: (f: Partial<BoardFilters>) => void;
  sites: Site[];
  statuses: StatusInfo[];
}

export function FilterBar({ filters, onChange, sites, statuses }: Props) {
  return (
    <div className="filter-bar" role="search" aria-label="Filter requests">
      {/* Date range */}
      <label className="filter-label">
        From
        <input type="date" value={ddmmToInput(filters.from)}
          onChange={e => onChange({ from: inputToDDMM(e.target.value) })} />
      </label>
      <label className="filter-label">
        To
        <input type="date" value={ddmmToInput(filters.to)}
          onChange={e => onChange({ to: inputToDDMM(e.target.value) })} />
      </label>

      {/* Site */}
      <label className="filter-label">
        Site
        <select value={filters.site} onChange={e => onChange({ site: e.target.value })}>
          <option value="">All Sites</option>
          {sites.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
        </select>
      </label>

      {/* Status chips */}
      <div className="filter-label" role="group" aria-label="Status filter">
        <span>Status</span>
        <div className="chip-group">
          {statuses.filter(s => s.value !== "canceled").map(s => {
            const active = filters.statuses.includes(s.value);
            return (
              <button key={s.value}
                className={`chip ${active ? "chip--active" : ""}`}
                aria-pressed={active}
                onClick={() => onChange({
                  statuses: active
                    ? filters.statuses.filter(x => x !== s.value)
                    : [...filters.statuses, s.value]
                })}>
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort */}
      <label className="filter-label">
        Sort by
        <select value={`${filters.sort}_${filters.dir}`}
          onChange={e => {
            const [sort, dir] = e.target.value.split("_") as [BoardFilters["sort"], BoardFilters["dir"]];
            onChange({ sort, dir });
          }}>
          <option value="created_at_desc">Created (newest)</option>
          <option value="created_at_asc">Created (oldest)</option>
          <option value="due_on_asc">Due Date ↑</option>
          <option value="due_on_desc">Due Date ↓</option>
        </select>
      </label>
    </div>
  );
}

function ddmmToInput(s: string) {
  const [d, m, y] = s.split("/");
  return `${y}-${m}-${d}`;
}
function inputToDDMM(s: string) {
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}