// Shapes of the helpdesk API (docs/api.md). Keep them honest: the data has nulls where the docs say so.

export type Status = "pending" | "processing" | "complete" | "canceled";
export type Priority = "Low" | "Medium" | "High" | null;

export interface Staff {
  id: number;
  name: string;
}

export interface Site {
  id: number;
  name: string;
  timezone: string; // IANA name, e.g. "Australia/Sydney"
  business_hours: Record<string, { open: string; close: string } | null>;
}

export interface HelpdeskRequest {
  id: number;
  ref: string;
  title: string;
  location: string;
  site_id: number;
  status: Status;
  priority: Priority;
  created_at: string; // ISO 8601, UTC
  updated_at: string;
  due_on: string | null; // YYYY-MM-DD, site local
  assignee: Staff | null;
  deleted_at: string | null;
  merged_into_id: number | null;
}

export interface RequestEvent {
  id: number;
  request_id: number;
  at: number;
  actor_id: number | null;
  status: Status | null;
  priority: Priority | null;
  assignee_id: number | null;
  due_at: string | null;
  note: string | null;
  reverts_id: number | null;
}

export interface Page<T> {
  data: T[];
  page: number;
  per_page: number;
  total_pages?: number;
  total?: number;
  has_more?: boolean;
}

export interface StatusInfo {
  value: string;
  label: string;
}

export interface Change {
  seq: number;
  type: "request.created" | "request.updated" | "event.created" | "staff.updated";
  at: string;
  request?: HelpdeskRequest;
  request_id?: number;
  event?: RequestEvent;
  staff?: Staff;
}
