import AnimatedHeading from "./AnimatedHeading";
import Link from "next/link";

const FOOTER_LINKS_COL_1 = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Our Work", href: "/our-work" },
];

const FOOTER_LINKS_COL_2 = [
  { label: "Rental", href: "/rental" },
  { label: "Packages", href: "/packages" },
  { label: "Motion Control", href: "/motion-control" },
];

const FOOTER_LINKS_COL_3 = [
  { label: "Merchandise", href: "/merchandise" },
  { label: "Contact", href: "/contact" },
  { label: "Admin Login", href: "/admin/login" },
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
            <h2 className="font-display text-2xl font-black leading-tight tracking-tight md:text-3xl">
              The work should speak.
              <br />
              We make sure it does.
            </h2>
            <a
              href="mailto:ot.studio26@gmail.com"
              className="mt-6 flex items-center gap-2.5 font-body text-sm italic font-medium text-white/50 transition-colors hover:text-signal"
            >
              <MailIcon />
              ot.studio26@gmail.com
            </a>
            <a
              href="https://maps.google.com/?q=Wisma+Academy,+Jalan+19/1,+Seksyen+19,+46300+Petaling+Jaya,+Selangor"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex max-w-xs items-start gap-2.5 font-body text-sm italic font-medium text-white/50 transition-colors hover:text-signal"
            >
              <PinIcon />
              <span>Wisma Academy, Jalan 19/1, Seksyen 19, 46300 Petaling Jaya, Selangor</span>
            </a>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-12">
            <div>
              <p className="mb-6 font-body text-[13px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Sitemap
              </p>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-1 sm:hidden">
                {[...FOOTER_LINKS_COL_1, ...FOOTER_LINKS_COL_2, ...FOOTER_LINKS_COL_3].map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-10 items-center font-body text-base text-white/55 transition-colors hover:text-signal"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="hidden gap-8 sm:flex sm:gap-16">
                <ul className="flex flex-col gap-4">
                  {FOOTER_LINKS_COL_1.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="font-body text-base text-white/55 transition-colors hover:text-signal"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-col gap-4">
                  {FOOTER_LINKS_COL_2.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="font-body text-base text-white/55 transition-colors hover:text-signal"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="flex flex-col gap-4">
                  {FOOTER_LINKS_COL_3.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="font-body text-base text-white/55 transition-colors hover:text-signal"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="sm:border-l sm:border-white/15 sm:pl-12">
              <p className="mb-6 font-body text-[13px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Legal
              </p>
              <ul className="flex flex-col gap-4">
                {LEGAL_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-10 items-center font-body text-base sm:min-h-0 text-white/55 transition-colors hover:text-signal"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <a
                href="https://instagram.com/outtakestudio"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Out Take Studio on Instagram"
                className="mt-5 inline-flex text-white/45 transition-colors hover:text-signal"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 pt-8 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-white/40">
            © {new Date().getFullYear()} Out Take Studio. All Rights Reserved.
          </p>
          <p className="font-mono text-[11px] text-white/40">Petaling Jaya, Selangor</p>
        </div>
      </div>

      <div className="overflow-hidden">
        <AnimatedHeading
          as="p"
          text="OUT TAKE"
          stagger={60}
          className="select-none whitespace-nowrap px-4 pb-2 text-center font-display text-[19vw] font-black uppercase leading-none tracking-tight text-white/25 sm:text-[17vw]"
          style={{
            maskImage: "linear-gradient(to bottom, black, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
          }}
        />
      </div>
    </footer>
  );
}

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="shrink-0"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="mt-0.5 shrink-0"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
