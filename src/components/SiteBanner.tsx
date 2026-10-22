import Image from "next/image";
import type { BannerContent } from "@/lib/server/db";
import BannerFX from "./BannerFX";

export default function SiteBanner({
  content,
  showButton = false,
}: {
  content: BannerContent;
  showButton?: boolean;
}) {
  return (
    <div className="relative h-[82svh] min-h-[560px] w-full overflow-hidden bg-ink pt-[62px] text-white sm:h-[460px] sm:min-h-0 md:h-[600px] lg:h-[780px]">
      {content.image && (
        <Image
          src={content.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
          style={{ objectPosition: `${content.focusX ?? 50}% ${content.focusY ?? 50}%` }}
        />
      )}
      {content.image && (
        <BannerFX src={content.image} focusX={content.focusX ?? 50} focusY={content.focusY ?? 50} />
      )}
      {/* base darkening for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/25" />
      {/* top fade — blends seamlessly into the nav bar sitting above it */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink to-transparent" />

      <div className="relative z-10 flex h-full flex-col items-start justify-end px-6 pb-12 text-left sm:justify-center sm:pb-0 sm:pl-[8vw] lg:pl-[12vw]">
        {content.subtitle && (
          <p className="mb-4 font-mono text-[13px] uppercase tracking-[0.2em] text-white/60">{content.subtitle}</p>
        )}
        {content.title && (
          <h2 className="banner-title max-w-xl font-display text-[46px] font-black uppercase leading-[0.97] tracking-normal sm:text-[45px] md:text-[56px] lg:max-w-3xl lg:text-[67px]">
            <TitleText text={content.title} />
          </h2>
        )}
        {content.description && (
          <p className="mt-5 max-w-md font-mono text-sm text-white/70 sm:text-base">{content.description}</p>
        )}
        {showButton && (
          <a
            href="/rental"
            className="group mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-signal px-7 font-mono text-base font-semibold text-ink transition-transform hover:scale-[1.02]"
          >
            Explore Collections
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

/** The last three words go on their own yellow line (e.g. "THE RIGHT GEAR"). */
function TitleText({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length <= 3) return <>{text}</>;
  return (
    <>
      {words.slice(0, -3).join(" ")}
      <span className="block text-signal"> {words.slice(-3).join(" ")}</span>
    </>
  );
}
