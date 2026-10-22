import Link from "next/link";

/** Phone-only replacement for wide admin tables: one card per row. */
export function MobileCardList({ children }: { children: React.ReactNode }) {
  return <ul className="flex flex-col gap-3 md:hidden">{children}</ul>;
}

export function MobileEmpty({ children }: { children: React.ReactNode }) {
  return (
    <li className="rounded-2xl bg-white p-8 text-center font-mono text-xs text-ash shadow-sm shadow-ink/5">
      {children}
    </li>
  );
}

/**
 * The body is a link to `href`; optional `footer` holds actions (switch, edit, delete) that must not
 * trigger the link. `off` dims the body, same as a switched-off table row.
 */
export function MobileCard({
  href,
  off = false,
  footer,
  children,
}: {
  href: string;
  off?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li data-off={off} className="group/card rounded-2xl bg-white shadow-sm shadow-ink/5">
      <Link href={href} className="block p-4 transition-opacity group-data-[off=true]/card:opacity-60">
        {children}
      </Link>
      {footer && (
        <div className="flex items-center justify-between gap-3 border-t border-ash/15 px-4 py-2.5">{footer}</div>
      )}
    </li>
  );
}
