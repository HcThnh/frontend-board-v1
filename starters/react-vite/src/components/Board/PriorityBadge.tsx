import type { Priority } from "../../types";

export function PriorityBadge({ priority }: { priority: Priority }) {
    if (!priority) return <span>—</span>;
    return <span>{priority}</span>;
}