import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import MerchandiseGrid from "@/components/MerchandiseGrid";
import Footer from "@/components/Footer";

export default function MerchandisePage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <MerchandiseGrid />
      </main>
      <Footer />
    </div>
  );
}
