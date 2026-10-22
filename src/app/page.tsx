import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import Rental from "@/components/Rental";
import Packages from "@/components/Packages";
import Footer from "@/components/Footer";
import { getSiteSettings, listGearProducts, listPackageProducts } from "@/lib/server/db";

export default async function Home() {
  const [gearProducts, packageProducts, siteSettings] = await Promise.all([
    listGearProducts(),
    listPackageProducts(),
    getSiteSettings(),
  ]);

  const enabledGear = gearProducts.filter((g) => g.isEnabled);
  // Carousel shows the items the admin marked "Show in homepage carousel"; until any are marked it shows all.
  const featuredGear = enabledGear.filter((g) => g.featuredOnHome);
  const gearItems = featuredGear.length > 0 ? featuredGear : enabledGear;
  const packages = packageProducts.filter((p) => p.isEnabled && p.featuredOnHome);

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col">
        <Rental items={gearItems} banner={siteSettings.banners.home} />
        <Packages packages={packages} />
      </main>
      <Footer />
    </div>
  );
}
