import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import ProductDetail from "@/components/ProductDetail";
import { getGearProduct } from "@/lib/server/db";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getGearProduct(id);

  if (!item) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <ProductDetail item={item} />
      </main>
      <Footer />
    </div>
  );
}
