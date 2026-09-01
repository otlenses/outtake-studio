import ScrollReveal from "./ScrollReveal";

export default function AboutIntro() {
  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] pt-20 md:pt-28">
      <ScrollReveal className="mx-auto">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          About Us
        </h1>
        <p className="mt-5 max-w-2xl text-sm text-ash md:text-base">
          Out Take Studio is a Kuala Lumpur-based production house and camera
          rental house. We partner with brands, agencies, and fellow
          filmmakers to bring commercial, corporate, and narrative work to
          life — backed by a professionally maintained fleet of cinema
          cameras, glass, and lighting.
        </p>
      </ScrollReveal>
    </section>
  );
}
