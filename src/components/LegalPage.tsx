import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";

export type LegalSection = { title: string; body: string[] };

export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <section className="bg-paper px-[max(1.5rem,4vw)] pb-20 pt-20 md:pb-28 md:pt-28">
          <div className="mx-auto">
            <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
            <h1 className="page-title font-display text-3xl font-black tracking-tight md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-xs text-ash">Last updated: {updated}</p>
            <p className="mt-5 max-w-2xl text-sm text-ash md:text-base">{intro}</p>
            <div className="mt-12 max-w-2xl space-y-10">
              {sections.map((s, i) => (
                <section key={s.title}>
                  <h2 className="font-display text-lg font-black tracking-tight md:text-xl">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-ash md:text-base">
                    {s.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
