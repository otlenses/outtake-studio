"use client";

import { useRef, useState, useTransition } from "react";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import { StickyActionBar } from "@/components/admin/FormParts";
import { useRouter } from "next/navigation";
import { createOrderManualAction } from "@/lib/server/actions";
import type { GearProduct } from "@/lib/server/db";

type LineItem = { productId: string; quantity: number };

export default function OrderManualForm({ gearProducts }: { gearProducts: GearProduct[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<LineItem[]>([
    { productId: gearProducts[0]?.id ?? "", quantity: 1 },
  ]);
  const formRef = useRef<HTMLFormElement>(null);
  const { dirty } = useFormDirty(formRef);
  const endRef = useRef<HTMLInputElement>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStartChange = (value: string) => {
    setStartDate(value);
    if (endDate && value && endDate < value) setEndDate(value);
    if (value) {
      requestAnimationFrame(() => {
        try {
          endRef.current?.showPicker?.();
        } catch {
          endRef.current?.focus();
        }
      });
    }
  };

  const addLine = () => setLines((prev) => [...prev, { productId: gearProducts[0]?.id ?? "", quantity: 1 }]);
  const removeLine = (i: number) => setLines((prev) => prev.filter((_, idx) => idx !== i));
  const updateLine = (i: number, patch: Partial<LineItem>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const handleSubmit = (formData: FormData) => {
    setError(null);
    const items = lines
      .filter((l) => l.productId)
      .map((l) => {
        const product = gearProducts.find((g) => g.id === l.productId);
        if (!product) return null;
        return {
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          unitPrice: product.dailyRate,
          quantity: l.quantity,
          subtotal: product.dailyRate * l.quantity,
        };
      })
      .filter(Boolean);
    formData.set("items", JSON.stringify(items));

    startTransition(async () => {
      const result = await createOrderManualAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push("/admin/orders");
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
              <span className="text-sm text-ink/70">Customer name<span className="ml-0.5 text-[#e8553a]">*</span></span>
              <input
                type="text"
                name="customerName"
                required
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Phone<span className="ml-0.5 text-[#e8553a]">*</span></span>
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
          <h2 className="mb-4 text-lg font-bold text-ink">Rental dates</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Rental start</span>
              <input
                type="date"
                name="rentalStartDate"
                value={startDate}
                onChange={(e) => handleStartChange(e.target.value)}
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Rental end</span>
              <input
                ref={endRef}
                type="date"
                name="rentalEndDate"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
          </div>
        </section>

        <section className="border-t border-ash/20 pt-7">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Items</h2>
            <button
              type="button"
              onClick={addLine}
              className="text-sm text-ink underline underline-offset-2 hover:text-signal"
            >
              + Add item
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-3">
                <select
                  value={line.productId}
                  onChange={(e) => updateLine(i, { productId: e.target.value })}
                  className="min-w-0 flex-1 rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
                >
                  {gearProducts.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} — RM {g.dailyRate.toFixed(2)}/day
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  onChange={(e) => updateLine(i, { quantity: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-20 rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
                />
                {lines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    aria-label="Remove item"
                    className="text-ash hover:text-ink"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      <StickyActionBar cancelHref="/admin/orders" saveLabel="Create order" isPending={isPending} canSave={dirty && gearProducts.length > 0} />
      <UnsavedGuard dirty={dirty && !isPending} />
    </form>
  );
}
