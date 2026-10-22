"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMerchProductAction } from "@/lib/server/actions";
import type { MerchProduct } from "@/lib/server/db";
import ImageManager, { getImageCount } from "@/components/admin/ImageManager";
import FormToggle from "@/components/admin/FormToggle";
import SavedOverlay from "@/components/admin/SavedOverlay";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import { Field, Section, StickyActionBar, inputClass } from "@/components/admin/FormParts";

export default function MerchProductForm({ initial }: { initial?: MerchProduct }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { dirty, markClean } = useFormDirty(formRef, initial);
  const [visible, setVisible] = useState(initial?.isEnabled ?? true);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    if (getImageCount(formData, "images") === 0) {
      setError("Please upload at least one product image.");
      return;
    }
    startTransition(async () => {
      const result = await saveMerchProductAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1700);
      markClean();
      if (result.id) router.replace(`/admin/merchandise/${result.id}/edit`);
    });
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-2xl bg-white px-6 pt-6 shadow-sm shadow-ink/5 sm:px-8 sm:pt-8"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="flex flex-col gap-8">
        <Section title="Basic information" first>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Product name" required>
              <input type="text" name="name" required defaultValue={initial?.name} className={inputClass} />
            </Field>
            <Field label="Price (RM)" required>
              <div className="flex items-center rounded-lg border border-ash/30 focus-within:border-ink">
                <span className="pl-3 text-sm text-ash">RM</span>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={initial?.price}
                  className="w-full rounded-lg bg-transparent px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </Field>
          </div>
          <Field label="Description" required>
            <textarea
              name="description"
              rows={6}
              required
              defaultValue={initial?.description}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </Section>

        <Section title="Media">
          <ImageManager
            name="images"
            initialImages={initial?.images ?? (initial?.image ? [initial.image] : [])}
          />
        </Section>

        <Section title="Shipping, Returns & Exchanges">
          <Field label="Details">
            <textarea
              name="shippingInfo"
              rows={4}
              defaultValue={initial?.shippingInfo}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </Section>

        <Section title="Visibility">
          <FormToggle
            name="isEnabled"
            label="Visible on website"
            help="Turn off to hide this product from customers."
            checked={visible}
            onChange={setVisible}
          />
        </Section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      <StickyActionBar cancelHref="/admin/merchandise" saveLabel="Save product" isPending={isPending} canSave={dirty} />
      <SavedOverlay show={saved} />
    <UnsavedGuard dirty={dirty} />
    </form>
  );
}
