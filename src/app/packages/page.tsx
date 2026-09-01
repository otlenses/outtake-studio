import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import PackagesGrid from "@/components/PackagesGrid";
import Footer from "@/components/Footer";

export default function PackagesPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <PackagesGrid />
      </main>
      <Footer />
    </div>
  );
}
