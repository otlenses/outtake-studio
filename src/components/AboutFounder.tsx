import Image from "next/image";
import AnimatedHeading from "./AnimatedHeading";
import ScrollReveal from "./ScrollReveal";

export default function AboutFounder() {
  return (
    <section className="bg-smoke px-[max(1.5rem,4vw)] py-20 md:py-28">
      <div className="mx-auto">
        <AnimatedHeading
          as="h2"
          text="Meet the Founder"
          className="mb-12 page-title font-display text-3xl font-black tracking-tight md:text-4xl"
        />
        <ScrollReveal>
          <div className="grid items-start gap-8 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-4">
              <Image
                src="/about/oscar-tong.jpg"
                width={719}
                height={1080}
                alt="Oscar Tong operating a stabilised ARRI camera on set"
                sizes="(min-width: 768px) 30vw, 100vw"
                className="h-auto w-full max-w-sm"
              />
            </div>
            <div className="md:col-span-8">
              <h3 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Oscar Tong</h3>
              <p className="mt-2 text-sm italic text-ash md:text-base">Director of Photography | Founder, Out Take Studio</p>
              <div className="mt-6 flex max-w-xl flex-col gap-4 text-sm text-ash md:text-base">
                <p>
                  Oscar Tong is a Kuala Lumpur-based freelance Director of Photography with a Master of Fine Arts in
                  Cinematography from the New York Film Academy.
                </p>
                <p>
                  With experience spanning more than 200 commercials, music videos, and two feature films,
                  his work reflects a passion for visual storytelling and an ongoing exploration of filmmaking
                  technology.
                </p>
                <p>
                  Beyond his cinematography work, Oscar established Out Take Studio as a platform to share his
                  technical knowledge, equipment, and experience with fellow filmmakers.
                </p>
                <p>
                  Through Out Take Lenses and Black Illusion, he continues to explore the intersection of creativity
                  and technology, providing tools and solutions that help bring ambitious visual ideas to life.
                </p>
              </div>
              <a
                href="https://www.instagram.com/oscartongdp"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-ink px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-colors hover:bg-ink hover:text-white"
              >
                Explore Instagram <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
