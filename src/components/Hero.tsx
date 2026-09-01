"use client";

import { useEffect, useRef, useState } from "react";

const PIN_FRACTION = 0.6; // extra scroll distance, as a fraction of viewport height

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLElement>(null);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (videoRef.current) videoRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const pinDistance = window.innerHeight * PIN_FRACTION;
      const raw = -rect.top / pinDistance;
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      if (videoRef.current) videoRef.current.muted = next;
      return next;
    });
  };

  return (
    <section
      ref={wrapperRef}
      className="relative w-full"
      style={{ height: `calc(100svh + ${PIN_FRACTION * 100}vh)` }}
    >
      <div className="sticky top-0 h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink text-white">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover opacity-95"
          src="/media/hero-teaser.mp4"
          autoPlay
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55" />

        {/* Viewfinder HUD frame */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 top-24 z-20 sm:top-28 md:inset-x-8 md:bottom-8 md:top-28">
          <Corner className="left-0 top-0 border-l border-t" />
          <Corner className="right-0 top-0 border-r border-t" />
          <Corner className="left-0 bottom-0 border-l border-b" />
          <Corner className="right-0 bottom-0 border-r border-b" />

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute video" : "Mute video"}
            className="pointer-events-auto absolute bottom-0 right-0 flex items-center gap-2 rounded-full border border-white/25 bg-black/30 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm transition-colors hover:border-signal hover:text-signal sm:text-[11px]"
          >
            {muted ? <MutedIcon /> : <UnmutedIcon />}
            {muted ? "Audio Off" : "Audio On"}
          </button>
        </div>

        <div className="relative z-10 h-full w-full px-[max(1.5rem,4vw)]">
          <div className="mx-auto flex h-full items-center">
            <div
              className="max-w-lg"
              style={{
                opacity: progress,
                transform: `translateY(${(1 - progress) * 18}vh)`,
              }}
            >
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.35em] text-signal">
                Production &amp; Camera Rental House
              </p>
              <h1 className="font-display text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
                Visual Storytelling &amp; Precision Production
              </h1>
              <p className="mt-4 max-w-sm text-sm text-white/45 md:text-base">
                We capture high-end commercial, corporate, and narrative visuals,
                backed by professional camera gear rentals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <div
      className={`absolute h-6 w-6 md:h-9 md:w-9 border-signal/80 ${className}`}
    />
  );
}

function UnmutedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}
