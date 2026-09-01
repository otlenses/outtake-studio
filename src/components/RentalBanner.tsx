import Image from "next/image";

export default function RentalBanner() {
  return (
    <div className="relative h-[322px] w-full overflow-hidden bg-ink pt-[62px] text-white sm:h-[382px] md:h-[440px] lg:h-[500px]">
      <Image
        src="/gear/ref-banner-crew.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-70"
      />
      {/* base darkening for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/25" />
      {/* top fade — blends seamlessly into the nav bar sitting above it */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 font-mono text-[10px] italic uppercase tracking-[0.3em] text-white/60 sm:text-[11px]">
          Precision in every frame.
        </p>
        <h2 className="max-w-xl font-display text-lg font-black leading-snug tracking-tight sm:text-xl md:text-2xl">
          Every Frame Starts With The{" "}
          <span className="font-mono italic font-normal text-signal">
            Right Gear
          </span>
        </h2>
        <a
          href="/rental"
          className="group mt-5 inline-flex items-center gap-1.5 border-b border-white/30 pb-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-signal hover:text-signal"
        >
          Explore Collection
          <span aria-hidden className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>
      </div>
    </div>
  );
}
