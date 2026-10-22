import Image from "next/image";
import Link from "next/link";
import { formatName } from "@/lib/data";
import { listMerchProducts, type MerchProduct } from "@/lib/server/db";
import ScrollReveal from "./ScrollReveal";

export default async function MerchandiseGrid() {
  const merchItems = (await listMerchProducts()).filter((item) => item.isEnabled);

  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] py-14 md:py-20">
      <ScrollReveal className="mx-auto">
        <div className="mb-10">
          <nav className="mb-4 text-sm text-ash">
            <Link href="/">Home</Link> &gt; <span>Merchandise</span>
          </nav>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash hidden">
            Studio Goods
          </p>
          <h1 className="page-title font-display text-[32px] font-black tracking-tight md:text-4xl">
            Exclusive Collections
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {merchItems.map((item) => (
            <MerchCard key={item.id} item={item} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}

function MerchCard({ item }: { item: MerchProduct }) {
  const href = `/merchandise/${item.id}`;

  return (
    <div className="group flex flex-col">
      <Link
        href={href}
        className="relative aspect-square w-full overflow-hidden border border-smoke bg-smoke transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-ink/10"
      >
        {item.image ? (
          <div className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-105">
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ash">
            <TagIcon />
          </div>
        )}
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="line-clamp-2 font-display text-base font-extrabold leading-tight md:text-lg tracking-tight">
          <Link href={href} className="transition-colors group-hover:text-signal">
            {formatName(item.name)}
          </Link>
        </h3>
        <p className="mt-auto pt-1.5 font-display text-xl font-black tracking-tight text-ink md:text-2xl">
          RM {Number.isInteger(item.price) ? item.price.toLocaleString("en-MY") : item.price.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function TagIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.24H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.58a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.82Z" />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
