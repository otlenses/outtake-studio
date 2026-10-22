import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import OurWork from "@/components/OurWork";
import Footer from "@/components/Footer";
import { listPortfolioProjects } from "@/lib/server/db";

export default async function OurWorkPage() {
  const allItems = await listPortfolioProjects();
  const items = allItems.filter((p) => p.isEnabled);

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <OurWork items={items} />
      </main>
      <Footer />
    </div>
  );
}
