import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import CartDrawer from "@/components/CartDrawer";
import { MERCH_SIZES } from "@/lib/data";
import { getMerchProduct, getPaymentSettings } from "@/lib/server/db";
import MerchCheckoutForm from "@/components/MerchCheckoutForm";

export default async function MerchCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; size?: string; qty?: string }>;
}) {
  const { id, size, qty } = await searchParams;
  const item = id ? await getMerchProduct(id) : null;
  if (!item) notFound();

  const paymentSettings = await getPaymentSettings();
  const quantity = Math.max(1, Number(qty) || 1);
  const selectedSize =
    size && (MERCH_SIZES as readonly string[]).includes(size) ? size : MERCH_SIZES[0];

  return (
    <div className="flex flex-1 flex-col">
      <Nav />
      <CartDrawer />
      <main className="flex flex-1 flex-col pt-[62px]">
        <MerchCheckoutForm
          item={item}
          size={selectedSize}
          quantity={quantity}
          paymentSettings={paymentSettings}
        />
      </main>
    </div>
  );
}
