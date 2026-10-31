import type { HelpdeskRequest, Site, StatusInfo } from "../../types";
import { RequestRow } from "./RequestRow";

interface Props {
  requests: HelpdeskRequest[];
  siteMap: Map<number, Site>;
  staffMap: Map<number, string>;
  statuses: StatusInfo[];
  onSelect: (id: number) => void;
}

export function RequestTable({ requests, siteMap, staffMap, statuses, onSelect }: Props) {
  const statusLabel = (value: string) =>
    statuses.find((s) => s.value === value)?.label ?? value;

  return (
    <table className="request-table">
      <thead>
        <tr>
          <th scope="col">Site</th>
          <th scope="col">Reference</th>
          <th scope="col">Title</th>
          <th scope="col">Priority</th>
          <th scope="col">Status</th>
          <th scope="col">Assignee</th>
          <th scope="col">Due Date</th>
          <th scope="col">Overdue</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r, index) => (
          <RequestRow
            key={index}
            request={r}
            site={siteMap.get(r.site_id)}
            assigneeName={r.assignee ? (staffMap.get(r.assignee.id) ?? r.assignee.id.toString()) : ""}
            statusLabel={statusLabel(r.status)}
            onSelect={onSelect}
          />
        ))}
      </tbody>
    </table>
  );
}
