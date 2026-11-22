import Image from "next/image";
import Link from "next/link";
import AnimatedHeading from "./AnimatedHeading";
import ScrollReveal from "./ScrollReveal";

type Service = {
  code: string;
  title: string;
  paragraphs: React.ReactNode[];
  image: { src: string; width: number; height: number; alt: string };
  link: { label: string; href: string; external?: boolean };
};

const SERVICES: Service[] = [
  {
    code: "01",
    title: "Technical Support",
    paragraphs: [
      "More than just equipment, we provide the technical knowledge and hands-on support needed to keep productions running smoothly.",
      "From camera configurations and specialised rigging to workflow planning and on-set troubleshooting, our team works closely with filmmakers and production crews to develop practical solutions for their creative and technical needs.",
      "Our focus is on making technology work for the production, allowing filmmakers to concentrate on what matters most - crafting images that serve the story.",
    ],
    image: { src: "/about/technical-support.jpg", width: 1600, height: 1200, alt: "Camera rig inside a vehicle with monitors and wireless focus controls" },
    link: { label: "Talk to our team", href: "/contact" },
  },
  {
    code: "02",
    title: "Equipment Rental",
    paragraphs: [
      <>
        Through <strong className="font-bold text-ink">Out Take Lenses</strong>, we specialise in professional cinema
        camera equipment, with a particular focus on our extensive collection of cinema lenses.
      </>,
      "From modern cinema primes and zooms to anamorphic, vintage, and specialty optics, our diverse lens collection offers filmmakers a wide range of creative possibilities, each with its own unique visual characteristics.",
      "Alongside our lenses, we provide professional cinema cameras, camera support systems, and essential accessories to meet the demands of different productions.",
      "Every piece of equipment is carefully selected from a cinematographer's perspective, with an emphasis on image quality, versatility, and reliability on set.",
    ],
    image: { src: "/about/equipment-rental.jpg", width: 1600, height: 1200, alt: "ARRI cinema camera with a Fujinon zoom lens on a tripod" },
    link: { label: "@ot.lenses on Instagram", href: "https://www.instagram.com/ot.lenses", external: true },
  },
  {
    code: "03",
    title: "Motion Control",
    paragraphs: [
      "Through Black Illusion, we provide robotic motion control solutions for productions that demand precision, consistency, and creative freedom.",
      "Our motion control systems enable highly accurate and repeatable camera movements, opening up possibilities for complex camera choreography, high-speed cinematography, product commercials, and visual effects.",
      "From creative planning to technical execution, we work closely with directors, cinematographers, and production teams to achieve camera movements that go beyond conventional filmmaking techniques.",
    ],
    image: { src: "/about/motion-control.jpg", width: 1080, height: 809, alt: "Robotic motion control arm filming a car in a studio" },
    link: { label: "@blackillusion on Instagram", href: "https://www.instagram.com/blackillusion", external: true },
  },
  {
    code: "04",
    title: "Cinematography",
    paragraphs: [
      "Led by cinematographer Oscar Tong, we provide freelance Director of Photography services for commercials, music videos, short films, and feature films.",
      "We approach every project with an emphasis on visual storytelling, combining lighting, composition, colour, and camera movement to create imagery that supports the director's vision.",
      "From early creative discussions and visual development to principal photography, we bring together artistic sensibility and technical expertise to translate ideas into compelling images.",
    ],
    image: { src: "/about/cinematography.jpg", width: 1600, height: 1600, alt: "Music video frame with the matching lighting diagram" },
    link: { label: "@oscartongdp on Instagram", href: "https://www.instagram.com/oscartongdp", external: true },
  },
];

export default function Services() {
  return (
    <section id="services" className="bg-paper px-[max(1.5rem,4vw)] pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="mx-auto">
        <AnimatedHeading
          as="h2"
          text="Our Services"
          className="mb-12 page-title font-display text-3xl font-black tracking-tight md:text-4xl"
        />

        <div className="divide-y divide-ash/25 border-t border-ash/25">
          {SERVICES.map((service, i) => (
            <ScrollReveal key={service.code} className="py-10 md:py-14">
              <div className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
                <div className={`md:col-span-5 ${i % 2 === 1 ? "md:order-2" : ""}`}>
                  <Image
                    src={service.image.src}
                    width={service.image.width}
                    height={service.image.height}
                    alt={service.image.alt}
                    sizes="(min-width: 768px) 40vw, 100vw"
                    className="h-auto w-full"
                  />
                </div>
                <div className={`md:col-span-7 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                  <p className="font-mono text-xs text-ash">{service.code}</p>
                  <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">{service.title}</h3>
                  <div className="mt-5 flex max-w-xl flex-col gap-4 text-sm text-ash md:text-base">
                    {service.paragraphs.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                  <ServiceLink {...service.link} />
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceLink({ label, href, external }: Service["link"]) {
  const className =
    "mt-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-ink px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.06em] text-ink transition-colors hover:bg-ink hover:text-white";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label} <span aria-hidden>→</span>
    </a>
  ) : (
    <Link href={href} className={className}>
      {label} <span aria-hidden>→</span>
    </Link>
  );
}
