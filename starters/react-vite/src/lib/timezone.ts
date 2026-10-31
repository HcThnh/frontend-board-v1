export function toSiteLocalDateStr(isoUtc: string, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(
    new Date(isoUtc)
  );
}

export function isOverdue(
  status: string,
  due_on: string | null,
  timezone: string
): boolean {
  if (due_on === null) return false;
  if (status !== "pending" && status !== "processing") return false;
  const todayStr = toSiteLocalDateStr(new Date().toISOString(), timezone);
  return due_on < todayStr;
}

export function formatInZone(isoUtcOrUnix: string | number, timezone: string): string {
  const date =
    typeof isoUtcOrUnix === "number"
      ? new Date(isoUtcOrUnix * 1000)
      : new Date(isoUtcOrUnix);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}