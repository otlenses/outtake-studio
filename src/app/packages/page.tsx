import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import PackagesGrid from "@/components/PackagesGrid";
import Footer from "@/components/Footer";
import { listPackageProducts } from "@/lib/server/db";

export default async function PackagesPage() {
  const packageProducts = await listPackageProducts();
  const packages = packageProducts.filter((p) => p.isEnabled);

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <PackagesGrid packages={packages} />
      </main>
      <Footer />
    </div>
  );
}
