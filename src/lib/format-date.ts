const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number) => String(n).padStart(2, "0");

type Parts = { y: number; m: number; d: number };

function parseDay(value: string): Parts | null {
  const [y, m, d] = (value || "").slice(0, 10).split("-").map(Number);
  return y && m && d ? { y, m, d } : null;
}

/** "2026-10-09" -> "09 Oct 2026" */
export function formatDate(value: string): string {
  const p = parseDay(value);
  return p ? `${pad(p.d)} ${MONTHS[p.m - 1]} ${p.y}` : "—";
}

/** ISO timestamp -> "09 Oct 2026" (in the viewer's local time) */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** ISO timestamp -> "09 Oct 2026, 3:42 PM" (in the viewer's local time) */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const h = d.getHours();
  return `${formatTimestamp(iso)}, ${h % 12 || 12}:${pad(d.getMinutes())} ${h < 12 ? "AM" : "PM"}`;
}

/** "05–07 Oct 2026", "28 Oct – 02 Nov 2026", or "—" */
export function formatRange(start: string, end: string): string {
  const a = parseDay(start);
  const b = parseDay(end);
  if (!a && !b) return "—";
  if (a && b && a.y === b.y && a.m === b.m) {
    return a.d === b.d
      ? `${pad(a.d)} ${MONTHS[a.m - 1]} ${a.y}`
      : `${pad(a.d)}–${pad(b.d)} ${MONTHS[a.m - 1]} ${a.y}`;
  }
  const one = (x: Parts | null, withYear: boolean) =>
    x ? `${pad(x.d)} ${MONTHS[x.m - 1]}${withYear ? ` ${x.y}` : ""}` : "—";
  if (a && b && a.y === b.y) return `${one(a, false)} – ${one(b, true)}`;
  return `${one(a, true)} – ${one(b, true)}`;
}
