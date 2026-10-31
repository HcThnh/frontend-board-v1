import type { HelpdeskRequest, Site } from "../../types";
import { isOverdue } from "../../lib/timezone";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "../ui/StatusBadge";
import { OverdueBadge } from "../ui/OverdueBadge";

interface Props {
  request: HelpdeskRequest;
  site: Site | undefined;
  assigneeName: string;
  statusLabel: string;
  onSelect: (id: number) => void;
}

export function RequestRow({ request, site, assigneeName, statusLabel, onSelect }: Props) {
  const overdue = isOverdue(request.status, request.due_on, site?.timezone ?? "UTC");
  const tz = site
    ? new Intl.DateTimeFormat("en", { timeZone: site.timezone, timeZoneName: "short" })
        .formatToParts(new Date())
        .find((p) => p.type === "timeZoneName")?.value ?? ""
    : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(request.id);
    }
  };

  return (
    <tr
      className="table-row"
      tabIndex={0}
      role="button"
      aria-label={`Ticket ${request.ref}: ${request.title}. Status: ${statusLabel}`}
      onClick={() => onSelect(request.id)}
      onKeyDown={handleKeyDown}
    >
      <td className="col-site">{site?.name ?? `Site ${request.site_id}`}</td>
      <td className="font-mono">{request.ref}</td>
      <td className="col-title">{request.title}</td>
      <td><PriorityBadge priority={request.priority} /></td>
      <td><StatusBadge label={statusLabel} /></td>
      <td>{assigneeName || "Unassigned"}</td>
      <td className="font-mono">{request.due_on ? `${request.due_on} (${tz})` : "—"}</td>
      <td><OverdueBadge overdue={overdue} /></td>
    </tr>
  );
}