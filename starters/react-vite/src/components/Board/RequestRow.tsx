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

  return (
    <tr
      style={{ cursor: "pointer" }}
      tabIndex={0}
      role="button"
      aria-label={`Open request ${request.ref}: ${request.title}`}
      onClick={() => onSelect(request.id)}
      onKeyDown={(e) => e.key === "Enter" && onSelect(request.id)}
    >
      <td>{site?.name ?? `Site ${request.site_id}`}</td>
      <td>{request.ref}</td>
      <td>{request.title}</td>
      <td><PriorityBadge priority={request.priority} /></td>
      <td><StatusBadge label={statusLabel} /></td>
      <td>{assigneeName || "Unassigned"}</td>
      <td>{request.due_on ? `${request.due_on} (${tz})` : "—"}</td>
      <td><OverdueBadge overdue={overdue} /></td>
    </tr>
  );
}