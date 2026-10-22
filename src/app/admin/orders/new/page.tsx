import { verifyAdminSession } from "@/lib/server/dal";
import { listGearProducts } from "@/lib/server/db";
import OrderManualForm from "./OrderManualForm";

export default async function NewOrderPage() {
  await verifyAdminSession();
  const gearProducts = (await listGearProducts()).filter((g) => g.isEnabled);

  return (
    <div>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold md:mb-8">Add order request</h1>
      {gearProducts.length === 0 ? (
        <div className="max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm shadow-ink/5">
          <p className="text-sm text-ash">No enabled rental products yet — add one first.</p>
        </div>
      ) : (
        <OrderManualForm gearProducts={gearProducts} />
      )}
    </div>
  );
}
