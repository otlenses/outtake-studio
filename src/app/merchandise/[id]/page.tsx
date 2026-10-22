import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import MerchandiseDetail from "@/components/MerchandiseDetail";
import { getMerchProduct } from "@/lib/server/db";

export default async function MerchandiseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getMerchProduct(id);

  if (!item) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <MerchandiseDetail item={item} />
      </main>
      <Footer />
    </div>
  );
}
