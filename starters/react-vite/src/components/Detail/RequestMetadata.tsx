import type { HelpdeskRequest, Site, StatusInfo } from "../../types";
import { formatInZone } from "../../lib/timezone";
import { PriorityBadge } from "../Board/PriorityBadge";
import { StatusBadge } from "../ui/StatusBadge";

interface Props {
  request: HelpdeskRequest;
  site: Site | undefined;
  staffMap: Map<number, string>;
  statuses: StatusInfo[];
}

export function RequestMetadata({ request, site, staffMap, statuses }: Props) {
  const tz = site?.timezone ?? "UTC";
  const statusObj = statuses.find((s) => s.value === request.status);
  const statusLabel = statusObj?.label ?? request.status;
  const assigneeName = request.assignee ? staffMap.get(request.assignee.id) ?? "Unknown Staff" : "Unassigned";

  return (
    <div className="metadata-grid">
      <div className="meta-item">
        <span className="meta-label">Reference</span>
        <span className="meta-value font-mono">{request.ref}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Site</span>
        <span className="meta-value">{site?.name ?? `Site ${request.site_id}`}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Status</span>
        <span className="meta-value"><StatusBadge label={statusLabel} /></span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Priority</span>
        <span className="meta-value"><PriorityBadge priority={request.priority} /></span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Assignee</span>
        <span className="meta-value">{assigneeName}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Due Date</span>
        <span className="meta-value">{request.due_on ? `${request.due_on} (${tz})` : "—"}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Created At</span>
        <span className="meta-value">{formatInZone(request.created_at, tz)}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Updated At</span>
        <span className="meta-value">{formatInZone(request.updated_at, tz)}</span>
      </div>
    </div>
  );
}