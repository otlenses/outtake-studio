import Image from "next/image";
import { verifyAdminSession } from "@/lib/server/dal";
import { listGearProducts, listOrders, listPackageProducts } from "@/lib/server/db";
import ProductPicker from "@/components/admin/ProductPicker";
import { formatRange } from "@/lib/format-date";
import ClickableListItem from "@/components/admin/ClickableListItem";

function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  if (!aStart || !aEnd || !bStart || !bEnd) return false;
  return aStart <= bEnd && bStart <= aEnd;
}

export default async function AdminAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  await verifyAdminSession();
  const { product = "" } = await searchParams;

  const [orders, gearProducts, packageProducts] = await Promise.all([
    listOrders(),
    listGearProducts(),
    listPackageProducts(),
  ]);
  const PRODUCT_OPTIONS = [
    ...gearProducts.map((g) => ({ id: g.id, name: g.name, image: g.image })),
    ...packageProducts.map((p) => ({ id: p.id, name: p.name, image: p.image })),
  ];

  const bookings = product
    ? orders
        .filter((o) => o.status === "CONFIRMED")
        .flatMap((o) =>
          o.items
            .filter((item) => item.productId === product)
            .map((item) => ({
              orderId: o.id,
              orderNumber: o.orderNumber,
              customerName: o.customerName,
              startDate: o.rentalStartDate,
              endDate: o.rentalEndDate,
              quantity: item.quantity,
            }))
        )
        .sort((a, b) => (a.startDate > b.startDate ? 1 : -1))
    : [];

  const overlapIds = new Set<string>();
  for (let i = 0; i < bookings.length; i++) {
    for (let j = i + 1; j < bookings.length; j++) {
      if (rangesOverlap(bookings[i].startDate, bookings[i].endDate, bookings[j].startDate, bookings[j].endDate)) {
        overlapIds.add(bookings[i].orderId);
        overlapIds.add(bookings[j].orderId);
      }
    }
  }

  const selectedProduct = PRODUCT_OPTIONS.find((p) => p.id === product);

  return (
    <div>
      <h1 className="mb-6 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Availability</h1>
      <div className="mb-6">
        <ProductPicker options={PRODUCT_OPTIONS.map((p) => ({ id: p.id, name: p.name }))} value={product} />
      </div>

      {!product ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm shadow-ink/5">
          <p className="font-mono text-xs text-ash">Select a product above to see its booked dates.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white p-6 shadow-sm shadow-ink/5">
          <div className="mb-5 flex items-center gap-3">
            {selectedProduct?.image && (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-smoke">
                <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
              </div>
            )}
            <h2 className="text-[15px] font-semibold leading-tight text-ink">{selectedProduct?.name}</h2>
          </div>

          {bookings.length === 0 ? (
            <p className="font-mono text-xs text-ash">
              No booked dates yet for this product — it&apos;s fully open.
            </p>
          ) : (
            <>
              {overlapIds.size > 0 && (
                <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 font-mono text-xs text-red-700">
                  ⚠ Overlapping bookings found below — double-check before confirming any new request for
                  this product on those dates.
                </p>
              )}
              <ul className="flex flex-col divide-y divide-ash/15 border-t border-b border-ash/15">
                {bookings.map((b) => (
                  <ClickableListItem
                    key={`${b.orderId}-${b.startDate}`}
                    href={`/admin/orders/${b.orderId}`}
                    className={`flex items-center justify-between gap-3 py-3 hover:bg-paper ${
                      overlapIds.has(b.orderId) ? "bg-red-50" : ""
                    }`}
                  >
                    <div>
                      <div className="font-mono text-xs font-semibold">
                        {formatRange(b.startDate, b.endDate)}
                        {overlapIds.has(b.orderId) && <span className="ml-2 text-red-600">⚠</span>}
                      </div>
                      <div className="font-mono text-[11px] text-ash">
                        {b.customerName} · Qty {b.quantity}
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-ink underline underline-offset-2">
                      {b.orderNumber}
                    </span>
                  </ClickableListItem>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
