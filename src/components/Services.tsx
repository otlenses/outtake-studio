"use client";

import AnimatedHeading from "./AnimatedHeading";
import { useState } from "react";
import { services } from "@/lib/data";
import ScrollReveal from "./ScrollReveal";

export default function Services() {
  const [openCode, setOpenCode] = useState<string | null>(null);

  return (
    <section id="services" className="bg-paper px-[max(1.5rem,4vw)] pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="mx-auto">
        <div className="mb-12 flex items-end justify-between gap-6">
          <AnimatedHeading
            as="h2"
            text="Our Services"
            className="page-title font-display text-3xl font-black tracking-tight md:text-4xl"
          />
          <p className="hidden max-w-xs text-right font-mono text-xs tracking-[0.04em] text-ash md:block">
            From concept to colour — production, imaging, and gear.
          </p>
        </div>

        <div className="divide-y divide-ash/25 border-t border-b border-ash/25">
          {services.map((service, i) => {
            const isOpen = openCode === service.code;
            return (
              <ScrollReveal key={service.code} delay={i * 80}>
                <button
                  type="button"
                  onClick={() => setOpenCode(isOpen ? null : service.code)}
                  aria-expanded={isOpen}
                  className="group block w-full py-6 text-left sm:py-7"
                >
                  <span className="flex w-full items-center gap-4 sm:gap-8">
                    <span className="font-mono text-xs text-ash transition-colors group-hover:text-signal">
                      {service.code}
                    </span>
                    <h3 className="font-display text-xl font-bold tracking-tight transition-colors group-hover:text-signal md:text-2xl">
                      {service.title}
                    </h3>
                    <span
                      aria-hidden
                      className={`ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ash/40 text-ink transition-all duration-300 group-hover:border-signal group-hover:text-signal ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      <PlusIcon />
                    </span>
                  </span>
                  <span className="mt-2 block text-sm text-ash transition-colors group-hover:text-ink sm:ml-12 sm:max-w-md">
                    <span className={isOpen ? "hidden" : "line-clamp-1"}>
                      {service.details}
                    </span>
                    <span
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <span className="overflow-hidden">{service.details}</span>
                    </span>
                  </span>
                </button>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
