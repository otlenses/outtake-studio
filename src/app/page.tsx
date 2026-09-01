import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import Rental from "@/components/Rental";
import Packages from "@/components/Packages";
import BrowseCategory from "@/components/BrowseCategory";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col">
        <Rental />
        <Packages />
        <BrowseCategory />
      </main>
      <Footer />
    </div>
  );
}
