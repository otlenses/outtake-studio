import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import AboutIntro from "@/components/AboutIntro";
import Services from "@/components/Services";
import AboutFounder from "@/components/AboutFounder";
import AboutCta from "@/components/AboutCta";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <AboutIntro />
        <Services />
        <AboutFounder />
        <AboutCta />
      </main>
      <Footer />
    </div>
  );
}
