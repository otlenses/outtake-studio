import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import RentalBanner from "@/components/RentalBanner";
import RentalCatalogue from "@/components/RentalCatalogue";
import Footer from "@/components/Footer";

export default function RentalPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col">
        <RentalBanner />
        <RentalCatalogue />
      </main>
      <Footer />
    </div>
  );
}
