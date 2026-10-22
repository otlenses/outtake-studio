import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import MotionControlGrid from "@/components/MotionControlGrid";
import Footer from "@/components/Footer";
import { motionControlProducts } from "@/lib/motion-control";

export default function MotionControlPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <MotionControlGrid products={motionControlProducts} />
      </main>
      <Footer />
    </div>
  );
}
