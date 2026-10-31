import { useEffect } from "react";
import type { Site, StatusInfo } from "../../types";
import { useRequestDetail } from "../../hooks/useRequestDetail";
import { RequestMetadata } from "./RequestMetaData";
import { FirstResponderBanner } from "./FirstResponderBanner";
import { EventTimeline } from "./EventTimeLine";

interface Props {
  requestId: number | null;
  onClose: () => void;
  siteMap: Map<number, Site>;
  staffMap: Map<number, string>;
  statuses: StatusInfo[];
}

export function DetailModal({ requestId, onClose, siteMap, staffMap, statuses }: Props) {
  const { request, events, loading, error } = useRequestDetail(requestId);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (requestId !== null) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requestId, onClose]);

  if (requestId === null) return null;

  const site = request ? siteMap.get(request.site_id) : undefined;
  const tz = site?.timezone ?? "UTC";

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 id="modal-title">{request ? request.title : "Request Details"}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close dialog">✕</button>
        </header>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading details…</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : request ? (
            <>
              <FirstResponderBanner events={events} staffMap={staffMap} timezone={tz} />
              <RequestMetadata request={request} site={site} staffMap={staffMap} statuses={statuses} />
              <hr className="divider" />
              <EventTimeline events={events} staffMap={staffMap} site={site} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}