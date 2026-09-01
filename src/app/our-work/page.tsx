import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import OurWork from "@/components/OurWork";
import Footer from "@/components/Footer";

export default function OurWorkPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <OurWork />
      </main>
      <Footer />
    </div>
  );
}
