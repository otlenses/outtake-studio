import { verifyAdminSession } from "@/lib/server/dal";
import { listMerchProducts } from "@/lib/server/db";
import MerchOrderManualForm from "./MerchOrderManualForm";

export default async function NewMerchOrderPage() {
  await verifyAdminSession();
  const products = (await listMerchProducts()).filter((p) => p.isEnabled);

  return (
    <div>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold md:mb-8">Add merch order</h1>
      {products.length === 0 ? (
        <div className="max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm shadow-ink/5">
          <p className="text-sm text-ash">No enabled merchandise products yet — add one first.</p>
        </div>
      ) : (
        <MerchOrderManualForm products={products} />
      )}
    </div>
  );
}
