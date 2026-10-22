"use client";

import { useRef, useState, useTransition } from "react";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import { StickyActionBar } from "@/components/admin/FormParts";
import SingleImageField from "@/components/admin/SingleImageField";
import { useRouter } from "next/navigation";
import { createMerchOrderManualAction } from "@/lib/server/actions";
import type { MerchProduct } from "@/lib/server/db";
import { MERCH_SIZES } from "@/lib/data";

export default function MerchOrderManualForm({ products }: { products: MerchProduct[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [size, setSize] = useState<string>(MERCH_SIZES[0]);
  const [quantity, setQuantity] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);
  const { dirty } = useFormDirty(formRef);

  const selected = products.find((p) => p.id === productId);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    if (!selected) {
      setError("Please choose a product.");
      return;
    }
    formData.set("productId", selected.id);
    formData.set("productName", selected.name);
    formData.set("productImage", selected.image);
    formData.set("unitPrice", String(selected.price));
    formData.set("size", size);
    formData.set("quantity", String(quantity));

    startTransition(async () => {
      const result = await createMerchOrderManualAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/merch-orders");
    });
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="max-w-2xl rounded-2xl bg-white p-6 shadow-sm shadow-ink/5"
    >
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="mb-4 text-lg font-bold text-ink">Customer info</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Full name<span className="ml-0.5 text-[#e8553a]">*</span></span>
              <input
                type="text"
                name="customerName"
                required
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">WhatsApp phone<span className="ml-0.5 text-[#e8553a]">*</span></span>
              <input
                type="tel"
                name="customerPhone"
                required
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Email<span className="ml-0.5 text-[#e8553a]">*</span></span>
              <input
                type="email"
                name="customerEmail"
                required
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Company (optional)</span>
              <input
                type="text"
                name="companyName"
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
          </div>
        </section>

        <section className="border-t border-ash/20 pt-7">
          <h2 className="mb-4 text-lg font-bold text-ink">Item</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 sm:col-span-1">
              <span className="text-sm text-ink/70">Product</span>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — RM {p.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Size</span>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              >
                {MERCH_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Quantity</span>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
          </div>
        </section>

        <section className="border-t border-ash/20 pt-7">
          <h2 className="mb-4 text-lg font-bold text-ink">Payment slip</h2>
          <SingleImageField
            name="paymentSlip"
            label="Upload slip"
            hint="Max 8MB · JPG or PNG. You can also add it later from the order page."
          />
        </section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      <StickyActionBar cancelHref="/admin/merch-orders" saveLabel="Create order" isPending={isPending} canSave={dirty && products.length > 0} />
      <UnsavedGuard dirty={dirty && !isPending} />
    </form>
  );
}
