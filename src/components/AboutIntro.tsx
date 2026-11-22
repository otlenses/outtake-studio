import ScrollReveal from "./ScrollReveal";
import Breadcrumb from "@/components/Breadcrumb";
import AnimatedHeading from "./AnimatedHeading";

export default function AboutIntro() {
  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] pt-20 md:pt-28">
      <ScrollReveal className="mx-auto">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "About Us" }]} />
        <AnimatedHeading
          as="h1"
          text="About Us"
          className="page-title font-display text-3xl font-black tracking-tight md:text-4xl"
        />
        <h2 className="mt-6 font-display text-lg font-bold tracking-tight md:text-xl">
          Driven by Creativity. Built on Experience.
        </h2>
        <div className="mt-4 flex max-w-2xl flex-col gap-4 text-sm text-ash md:text-base">
          <p>
            Out Take Studio is a Kuala Lumpur-based cinematography and equipment rental company, bringing together
            creative expertise, professional filmmaking equipment, and technical solutions under one roof.
          </p>
          <p>
            Founded with a passion for visual storytelling, we specialise in cinematography, equipment rental,
            technical support, and robotic motion control systems.
          </p>
          <p>
            With hands-on experience across commercials, music videos, and feature films, we understand the
            creative and technical demands of filmmaking. Our goal is simple: to provide filmmakers and production
            teams with the right tools, expertise, and support to bring their vision to life.
          </p>
          <p>We believe great cinematography is a balance of creativity, technology, and collaboration.</p>
        </div>
      </ScrollReveal>
    </section>
  );
}
