import Image from "next/image";
import Link from "next/link";
import type { packages } from "@/lib/data";

export default function PackageCard({ pkg }: { pkg: (typeof packages)[number] }) {
  const href = `/packages/${pkg.id}`;

  return (
    <div
      data-card
      className={`flex w-full flex-col overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-1 ${
        pkg.featured
          ? "bg-ink text-white shadow-ink/25 hover:shadow-xl hover:shadow-ink/40"
          : "bg-white text-ink shadow-ink/10 hover:shadow-xl hover:shadow-ink/20"
      }`}
    >
      <Link href={href} className="relative aspect-square w-full bg-smoke">
        <Image
          src={pkg.image}
          alt={pkg.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </Link>

      <div
        className={`flex flex-1 flex-col border-x border-b p-6 ${
          pkg.featured ? "border-ink" : "border-smoke"
        }`}
      >
        <p
          className={`line-clamp-2 min-h-[2rem] font-mono text-[10px] uppercase tracking-[0.2em] ${
            pkg.featured ? "text-signal" : "text-ash"
          }`}
        >
          {pkg.tagline}
        </p>
        <h3 className="mt-2 line-clamp-2 min-h-[3.5rem] font-display text-xl font-black uppercase leading-tight tracking-tight">
          <Link href={href} className="hover:underline">
            {pkg.name}
          </Link>
        </h3>
        <p className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-3xl font-black">{pkg.price}</span>
          <span className={`font-mono text-xs ${pkg.featured ? "text-white/60" : "text-ash"}`}>
            {pkg.period}
          </span>
        </p>

        <Link
          href={href}
          className={`mt-5 flex items-center justify-center rounded-full py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] transition-transform hover:scale-[1.02] ${
            pkg.featured ? "bg-signal text-ink" : "bg-ink text-white"
          }`}
        >
          View Details
        </Link>

        <ul className="mt-6 flex flex-col gap-2.5">
          {pkg.features.slice(0, 5).map((feat) => (
            <li
              key={feat}
              className={`flex items-start gap-2 text-xs ${
                pkg.featured ? "text-white/80" : "text-ash"
              }`}
            >
              <span className={pkg.featured ? "text-signal" : "text-ink"}>✓</span>
              {feat}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
