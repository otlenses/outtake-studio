import { packages } from "@/lib/data";
import PackageCard from "./PackageCard";
import ScrollReveal from "./ScrollReveal";

export default function PackagesGrid() {
  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] py-14 md:py-20">
      <ScrollReveal className="mx-auto">
        <div className="mb-10">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
            Bundled Rates
          </p>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            Equipment Packages
          </h1>
          <p className="mt-4 max-w-xl text-sm text-ash">
            Pre-built kits covering everything from one-day shoots to
            multi-day broadcast productions. Compare rates below or contact
            us for a custom build.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
