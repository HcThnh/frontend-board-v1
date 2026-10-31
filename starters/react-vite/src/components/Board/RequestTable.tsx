import type { HelpdeskRequest, Site, StatusInfo } from "../../types";
import { RequestRow } from "./RequestRow";

interface Props {
  requests: HelpdeskRequest[];
  siteMap: Map<number, Site>;
  staffMap: Map<number, string>;
  statuses: StatusInfo[];
  onSelect: (id: number) => void;
  sortField?: string;
  sortDir?: "asc" | "desc";
  onSortChange?: (field: "created_at" | "due_on") => void;
}

export function RequestTable({
  requests,
  siteMap,
  staffMap,
  statuses,
  onSelect,
  sortField,
  sortDir,
  onSortChange,
}: Props) {
  const getSortAria = (field: string) => {
    if (sortField !== field) return "none";
    return sortDir === "asc" ? "ascending" : "descending";
  };

  return (
    <div className="table-responsive-wrapper">
      <table className="request-table" role="table" aria-label="Helpdesk Requests">
        <thead>
          <tr>
            <th scope="col" className="col-site">Site</th>
            <th scope="col">Ref</th>
            <th scope="col">Title</th>
            <th scope="col">Priority</th>
            <th scope="col">Status</th>
            <th scope="col">Assignee</th>
            <th
              scope="col"
              aria-sort={getSortAria("due_on")}
              className="col-sortable"
              onClick={() => onSortChange?.("due_on")}
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSortChange?.("due_on")}
            >
              Due Date {sortField === "due_on" ? (sortDir === "asc" ? "↑" : "↓") : ""}
            </th>
            <th scope="col">Overdue</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, idx) => {
            const statusObj = statuses.find((s) => s.value === r.status);
            return (
              <RequestRow
                key={idx}
                request={r}
                site={siteMap.get(r.site_id)}
                assigneeName={r.assignee ? staffMap.get(r.assignee.id) ?? "" : ""}
                statusLabel={statusObj?.label ?? r.status}
                onSelect={onSelect}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}