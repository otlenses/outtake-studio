import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import MotionControlGrid from "@/components/MotionControlGrid";
import Footer from "@/components/Footer";
import { listMotionControlProducts } from "@/lib/server/db";

export default async function MotionControlPage() {
  const products = (await listMotionControlProducts()).filter((p) => p.isEnabled);
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <MotionControlGrid products={products} />
      </main>
      <Footer />
    </div>
  );
}
