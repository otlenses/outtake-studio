import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import PackageDetail from "@/components/PackageDetail";
import { getPackageProduct } from "@/lib/server/db";

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await getPackageProduct(id);

  if (!pkg) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <PackageDetail pkg={pkg} />
      </main>
      <Footer />
    </div>
  );
}
