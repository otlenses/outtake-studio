import Image from "next/image";
import Link from "next/link";
import { type packages, formatName } from "@/lib/data";

export default function PackageCard({
  pkg,
  variant = "default",
}: {
  pkg: (typeof packages)[number];
  /** "home": wider 4:3 image area (packages show several items per photo) and a larger price */
  variant?: "default" | "home" | "row";
}) {
  const home = variant === "home";
  const href = `/packages/${pkg.id}`;

  if (variant === "row") {
    return (
      <div className="relative flex w-full flex-col overflow-hidden border border-smoke bg-white text-ink">
        <div className="relative aspect-[6/5] w-full bg-smoke">
          <Image src={pkg.image} alt={pkg.name} fill sizes="100vw" className="object-cover" />
        </div>
        <div className="flex flex-col p-4">
          <p className="truncate font-mono text-[11.5px] font-medium uppercase tracking-[0.02em] text-[#0a72d6]">{pkg.tagline}</p>
          <h3 className="mt-2 line-clamp-2 font-display text-[21px] font-extrabold leading-tight tracking-tight">{formatName(pkg.name)}</h3>
          <p className="mt-4 flex items-baseline gap-1.5">
            <span className="font-display text-[26px] font-extrabold tracking-tight">{pkg.price}</span>
            <span className="text-xs text-[#9d9d9d]">{pkg.period.startsWith("/") ? pkg.period : `/ ${pkg.period}`}</span>
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {pkg.features.slice(0, 3).map((feat) => (
              <li key={feat} className="flex items-center gap-2.5 text-sm text-[#707070]">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="shrink-0">
                  <circle cx="12" cy="12" r="11" fill="currentColor" />
                  <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {feat}
              </li>
            ))}
          </ul>
        </div>
        <Link href={href} className="absolute inset-0 z-10" aria-label={pkg.name} />
      </div>
    );
  }

  return (
    <div
      data-card
      className="group relative flex w-full flex-col overflow-hidden bg-white text-ink shadow-md shadow-ink/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/20"
    >
      <div className={`relative w-full aspect-[6/5] ${home ? "" : "bg-smoke"}`}>
        <Image
          src={pkg.image}
          alt={pkg.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col border-x border-b border-smoke p-5">
        <p className="line-clamp-1 font-mono text-[11px] font-medium uppercase tracking-[0.02em] text-[#0a72d6]">
          {pkg.tagline}
        </p>
        <h3 className={`mt-2 line-clamp-2 min-h-[3rem] font-display leading-tight tracking-tight transition-colors group-hover:underline text-[21px] font-extrabold md:text-lg`}>
          {formatName(pkg.name)}
        </h3>

        <ul className="mt-4 flex flex-col gap-2">
          {pkg.features.slice(0, 5).map((feat) => (
            <li key={feat} className="flex items-start gap-2 text-xs text-[#707070]">
              <svg className="mt-px shrink-0" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="11" fill="currentColor" />
                <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {feat}
            </li>
          ))}
        </ul>

        <p className="mt-auto flex items-baseline gap-1.5 pt-6">
          <span className={`font-display tracking-tight text-ink text-[26px] font-extrabold md:text-2xl`}>{pkg.price}</span>
          <span className="text-xs text-[#9d9d9d]">{`/ ${pkg.period.replace(/^\//, "").trim()}`}</span>
        </p>
      </div>

      <Link href={href} className="absolute inset-0 z-10" aria-label={pkg.name} />
    </div>
  );
}
