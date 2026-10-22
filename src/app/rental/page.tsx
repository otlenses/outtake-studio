import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import RentalCatalogue from "@/components/RentalCatalogue";
import Footer from "@/components/Footer";
import { listGearProducts } from "@/lib/server/db";

export default async function RentalPage() {
  const gearProducts = await listGearProducts();
  const items = gearProducts.filter((g) => g.isEnabled);

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <RentalCatalogue items={items} />
      </main>
      <Footer />
    </div>
  );
}
