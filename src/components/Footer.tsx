import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Our Work", href: "/our-work" },
  { label: "Rental", href: "/rental" },
  { label: "Packages", href: "/packages" },
  { label: "Contact", href: "/contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto px-[max(1.5rem,4vw)] pb-10 pt-20 md:pt-28">
        <div className="flex flex-col justify-between gap-12 border-b border-white/12 pb-14 md:flex-row">
          <div className="max-w-md">
            <h2 className="font-display text-2xl font-black uppercase leading-tight tracking-tight md:text-3xl">
              The work should speak.
              <br />
              We make sure it does.
            </h2>
            <a
              href="mailto:hello@outtakestudio.com"
              className="mt-6 inline-block font-mono text-sm text-white/70 transition-colors hover:text-signal"
            >
              hello@outtakestudio.com
            </a>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                Sitemap
              </p>
              <ul className="flex flex-col gap-2.5">
                {FOOTER_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-mono text-xs uppercase tracking-[0.1em] text-white/70 transition-colors hover:text-signal"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                Legal
              </p>
              <ul className="flex flex-col gap-2.5">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="font-mono text-xs uppercase tracking-[0.1em] text-white/70 transition-colors hover:text-signal"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-white/40">
            © {new Date().getFullYear()} Out Take Studio. All Rights Reserved.
          </p>
          <p className="font-mono text-[11px] text-white/40">Kuala Lumpur, Malaysia</p>
        </div>
      </div>

      <div className="overflow-hidden">
        <p
          className="select-none whitespace-nowrap px-4 pb-2 text-center font-display text-[19vw] font-black uppercase leading-none tracking-tight text-white/25 sm:text-[17vw]"
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        >
          OUT TAKE
        </p>
      </div>
    </footer>
  );
}
