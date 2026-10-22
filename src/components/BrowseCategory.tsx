import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";
import ScrollReveal from "./ScrollReveal";

export default function BrowseCategory() {
  return (
    <section className="bg-smoke px-[max(1.5rem,4vw)] py-20 md:py-28">
      <ScrollReveal className="mx-auto">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
              The Full Floor
            </p>
            <h2 className="font-display text-3xl font-black tracking-tight md:text-4xl">
              Browse by Category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/rental?category=${cat.id}`}
              className="group relative aspect-[4/3] overflow-hidden bg-ink"
            >
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 font-display text-lg font-bold tracking-tight text-white">
                {cat.title}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-6 border-t border-ash/25 pt-8 sm:flex-row sm:items-center">
          <p className="max-w-md text-sm text-ash">
            The grid above is a fraction of what we carry — cameras, lenses, lighting,
            grip, and support gear. Get the full rate sheet as a PDF.
          </p>
          <a
            href="/Gear-List.pdf"
            download
            className="shrink-0 rounded-full bg-signal px-6 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-105"
          >
            Download Full Gear List (PDF)
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}
