import type { OrderHistoryEntry } from "@/lib/server/db";
import { formatDateTime } from "@/lib/format-date";

const ICONS: Record<string, React.ReactNode> = {
  "New order placed": <DocumentIcon />,
  "Moved back to To process": <DocumentIcon />,
  "Booking confirmed": <ShieldIcon />,
  "Awaiting pickup": <ShieldIcon />,
  "Order completed": <CheckCircleIcon />,
  "Completed": <CheckCircleIcon />,
  "Order cancelled": <XCircleIcon />,
  "Cancelled": <XCircleIcon />,
};

export default function OrderHistory({ history }: { history: OrderHistoryEntry[] }) {
  const sorted = [...history].sort((a, b) => (a.at > b.at ? -1 : 1));

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm shadow-ink/5">
      <h2 className="mb-5 font-mono text-xs font-semibold tracking-[0.1em] text-ink">Order history</h2>
      <ul className="flex flex-col">
        {sorted.map((event, i) => {
          const isLatest = i === 0;
          return (
            <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
              {i < sorted.length - 1 && (
                <span className="absolute left-[13px] top-7 h-full w-px bg-ash/20" aria-hidden />
              )}
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  isLatest ? "bg-emerald-100 text-emerald-700" : "bg-smoke text-ash"
                }`}
              >
                {ICONS[event.title] ?? <DocumentIcon />}
              </span>
              <div>
                <p className={`text-sm font-bold ${isLatest ? "text-emerald-700" : "text-ink"}`}>
                  {event.title}
                </p>
                <p className="mt-0.5 text-sm text-ink/60">{event.description}</p>
                <p className="mt-1 font-mono text-[11px] text-ash">
                  {formatDateTime(event.at)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 3h7l5 5v13H7z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function XCircleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
