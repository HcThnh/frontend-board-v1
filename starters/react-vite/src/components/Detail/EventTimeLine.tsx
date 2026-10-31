import { useState, useMemo } from "react";
import type { RequestEvent, Site } from "../../types";
import { formatInZone } from "../../lib/timezone";

interface Props {
  events: RequestEvent[];
  staffMap: Map<number, string>;
  site: Site | undefined;
}

export function EventTimeline({ events, staffMap, site }: Props) {
  const [showReverted, setShowReverted] = useState(false);
  const tz = site?.timezone ?? "UTC";

  const revertedIds = useMemo(() => {
    const ids = new Set<number>();
    for (const e of events) {
      if (e.reverts_id !== null) {
        ids.add(e.reverts_id);
        ids.add(e.id);
      }
    }
    return ids;
  }, [events]);

  const displayEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => b.at - a.at);
    if (showReverted) return sorted;
    return sorted.filter((e) => !revertedIds.has(e.id));
  }, [events, revertedIds, showReverted]);

  const hasRevertedEvents = revertedIds.size > 0;

  return (
    <section className="timeline-section" aria-label="Audit log events">
      <div className="timeline-header">
        <h3>Audit Log ({displayEvents.length})</h3>
        {hasRevertedEvents && (
          <label className="toggle-reverted">
            <input
              type="checkbox"
              checked={showReverted}
              onChange={(e) => setShowReverted(e.target.checked)}
            />
            Show reverted events ({revertedIds.size / 2} pairs)
          </label>
        )}
      </div>

      {displayEvents.length === 0 ? (
        <div className="text-muted">No events recorded.</div>
      ) : (
        <ul className="timeline-list">
          {displayEvents.map((evt) => {
            const isReverted = revertedIds.has(evt.id);
            const actorName = evt.actor_id ? (staffMap.get(evt.actor_id) ?? `Staff #${evt.actor_id}`) : "System";
            const timeStr = formatInZone(evt.at, tz);

            return (
              <li key={evt.id} className={`timeline-item ${isReverted ? "timeline-item--reverted" : ""}`}>
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <div className="timeline-meta">
                    <span className="timeline-actor font-semibold">{actorName}</span>
                    <time className="timeline-time">{timeStr}</time>
                    {isReverted && <span className="badge badge--grey">Reverted</span>}
                  </div>

                  <div className="timeline-body">
                    {evt.status && <div>Changed status to: <strong>{evt.status}</strong></div>}
                    {evt.priority && <div>Set priority to: <strong>{evt.priority}</strong></div>}
                    {evt.assignee_id && (
                      <div>Assigned to: <strong>{staffMap.get(evt.assignee_id) ?? `Staff #${evt.assignee_id}`}</strong></div>
                    )}
                    {evt.due_at && <div>Updated deadline to: <strong>{evt.due_at}</strong></div>}
                    {evt.note && <blockquote className="timeline-note">{evt.note}</blockquote>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}