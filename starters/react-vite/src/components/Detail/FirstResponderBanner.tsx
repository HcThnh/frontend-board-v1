import { useMemo } from "react";
import type { RequestEvent } from "../../types";
import { formatInZone } from "../../lib/timezone";

interface Props {
  events: RequestEvent[];
  staffMap: Map<number, string>;
  timezone: string;
}

export function FirstResponderBanner({ events, staffMap, timezone }: Props) {
  const firstResponse = useMemo(() => {
    const sorted = [...events].sort((a, b) => a.at - b.at);
    return sorted.find((e) => e.status === "processing" && e.actor_id !== null);
  }, [events]);

  if (!firstResponse || !firstResponse.actor_id) return null;

  const responderName = staffMap.get(firstResponse.actor_id) ?? `Staff #${firstResponse.actor_id}`;
  const formattedTime = formatInZone(firstResponse.at, timezone);

  return (
    <div className="first-responder-banner" role="status">
      <div>
        <strong>First response</strong> by <strong>{responderName}</strong> at {formattedTime}
      </div>
    </div>
  );
}