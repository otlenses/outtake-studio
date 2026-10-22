import Link from "next/link";

/**
 * Desktop search box shared by every admin list. Press Enter to search (no button);
 * `hidden` carries the other filters through the GET submit.
 */
export default function DesktopSearch({
  placeholder,
  q,
  hidden = {},
  clearHref,
}: {
  placeholder: string;
  q: string;
  hidden?: Record<string, string | undefined>;
  clearHref: string;
}) {
  return (
    <form className="mb-6 hidden items-center gap-4 md:flex" method="get">
      <input
        type="text"
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="w-80 rounded-full border border-ash/40 bg-white px-4 py-2 font-mono text-xs text-ink outline-none focus:border-ink"
      />
      {Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      {q && (
        <Link href={clearHref} className="font-mono text-xs tracking-[0.06em] text-ash underline underline-offset-2 hover:text-ink">
          Clear search
        </Link>
      )}
    </form>
  );
}
