import { services } from "@/lib/data";
import ScrollReveal from "./ScrollReveal";

export default function Services() {
  return (
    <section id="services" className="bg-paper px-[max(1.5rem,4vw)] pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="mx-auto">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
            Our Services
          </h2>
          <p className="hidden max-w-xs text-right font-mono text-xs uppercase tracking-[0.12em] text-ash md:block">
            From concept to colour — production, imaging, and gear.
          </p>
        </div>

        <div className="divide-y divide-ash/25 border-t border-b border-ash/25">
          {services.map((service, i) => (
            <ScrollReveal key={service.code} delay={i * 80}>
              <div className="group flex flex-col gap-2 py-6 transition-colors sm:flex-row sm:items-center sm:gap-8 sm:py-7">
                <span className="font-mono text-xs text-ash">{service.code}</span>
                <h3 className="font-display text-xl font-bold uppercase tracking-tight sm:w-[340px] sm:shrink-0 md:text-2xl">
                  {service.title}
                </h3>
                <p className="text-sm text-ash sm:max-w-md">{service.blurb}</p>
                <span className="ml-auto hidden font-mono text-xs uppercase tracking-[0.14em] text-ink opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                  Learn more →
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
