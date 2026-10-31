export function OverdueBadge({ overdue }: { overdue: boolean }) {
    if (!overdue) return null;
    return <span style={{ color: "red" }}>Overdue</span>;
}