import Link from "next/link";

/** "Home > Page > Item" trail shown above page titles. `dark` is for pages on the black background. */
export default function Breadcrumb({
  items,
  dark = false,
  className = "mb-4",
}: {
  items: { label: string; href?: string }[];
  dark?: boolean;
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${dark ? "text-white/60" : "text-ash"} ${className}`}>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {i > 0 && " > "}
          {item.href ? (
            <Link href={item.href} className={`transition-colors ${dark ? "hover:text-white" : "hover:text-ink"}`}>
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
