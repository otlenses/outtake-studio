import AnimatedHeading from "./AnimatedHeading";
import ScrollReveal from "./ScrollReveal";

const LINKS = [
  { label: "Cinematography", handle: "@oscartongdp", href: "https://www.instagram.com/oscartongdp" },
  { label: "Equipment Rental", handle: "@ot.lenses", href: "https://www.instagram.com/ot.lenses" },
  { label: "Motion Control", handle: "@blackillusion", href: "https://www.instagram.com/blackillusion" },
];

export default function AboutCta() {
  return (
    <section className="bg-charcoal px-[max(1.5rem,4vw)] py-20 text-white md:py-28">
      <ScrollReveal className="mx-auto">
        <AnimatedHeading
          as="h2"
          text="Let's Create Something Together"
          className="page-title max-w-3xl font-display text-3xl font-black tracking-tight md:text-4xl"
        />
        <p className="mt-5 max-w-2xl text-sm text-white/70 md:text-base">
          Whether you&apos;re looking for a cinematographer, professional camera equipment, technical support, or
          specialised motion control solutions, we&apos;d love to hear about your next project.
        </p>

        <h3 className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-white/60">Explore Our Work</h3>
        <ul className="mt-4 max-w-md divide-y divide-white/15 border-y border-white/15">
          {LINKS.map((l) => (
            <li key={l.handle}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-4 py-4 transition-colors hover:text-signal"
              >
                <span className="text-sm md:text-base">
                  {l.label} <span className="text-white/50 group-hover:text-signal">— {l.handle}</span>
                </span>
                <span aria-hidden>→</span>
              </a>
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </section>
  );
}
