"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveGearProductAction } from "@/lib/server/actions";
import type { GearProduct } from "@/lib/server/db";
import ImageManager, { getImageCount } from "@/components/admin/ImageManager";
import VideoManager from "@/components/admin/VideoManager";
import SpecSectionsEditor from "@/components/admin/SpecSectionsEditor";
import FormToggle from "@/components/admin/FormToggle";
import SavedOverlay from "@/components/admin/SavedOverlay";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import { Field, Section, StickyActionBar, inputClass } from "@/components/admin/FormParts";

export default function GearForm({
  initial,
  categories,
}: {
  initial?: GearProduct;
  categories: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { dirty, markClean } = useFormDirty(formRef, initial);
  const [category, setCategory] = useState(initial?.category ?? categories[0] ?? "CAMERA");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [visible, setVisible] = useState(initial?.isEnabled ?? true);
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [carousel, setCarousel] = useState(initial?.featuredOnHome ?? false);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    if (getImageCount(formData, "images") === 0) {
      setError("Please upload at least one product image.");
      return;
    }
    startTransition(async () => {
      const result = await saveGearProductAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1700);
      markClean();
      if (result.id) router.replace(`/admin/products/gear/${result.id}/edit`);
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
            <Field label="Brand">
              <input type="text" name="brand" defaultValue={initial?.brand} className={inputClass} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" required>
              <select
                name="category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setShowNewCategory(e.target.value === "__new__");
                }}
                className={inputClass}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </option>
                ))}
                <option value="__new__">+ Add new category…</option>
              </select>
              {showNewCategory && (
                <input
                  type="text"
                  name="newCategory"
                  placeholder="New category name"
                  required
                  className={`${inputClass} mt-2`}
                />
              )}
            </Field>
            <Field label="Daily rate (RM)" required>
              <div className="flex items-center rounded-lg border border-ash/30 focus-within:border-ink">
                <span className="pl-3 text-sm text-ash">RM</span>
                <input
                  type="number"
                  name="dailyRate"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={initial?.dailyRate}
                  className="w-full rounded-lg bg-transparent px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </Field>
          </div>
          <Field label="Description" help="Leave blank to use an auto-generated description.">
            <textarea
              name="description"
              rows={6}
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
          <VideoManager name="video" initialVideoUrl={initial?.videoUrl ?? null} />
        </Section>

        <Section title="Specifications" help="Brand, Category and Daily rate are shown automatically.">
          <SpecSectionsEditor name="specSections" initial={initial?.specSections} suggestions={["Specifications"]} />
        </Section>

        <Section title="Visibility">
          <FormToggle
            name="isEnabled"
            label="Visible on website"
            help="Turn off to hide this product from customers."
            checked={visible}
            onChange={setVisible}
          />
          <FormToggle
            name="featuredOnHome"
            label="Show in homepage carousel"
            help={visible ? "Feature this product in the home page rental carousel." : "Turn on “Visible on website” first."}
            checked={carousel}
            onChange={setCarousel}
            disabled={!visible}
          />
          <FormToggle
            name="isNew"
            label="Mark as new arrival"
            help="Adds a New label to the product."
            checked={isNew}
            onChange={setIsNew}
          />
        </Section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      <StickyActionBar cancelHref="/admin/products?type=gear" saveLabel="Save product" isPending={isPending} canSave={dirty} />
      <SavedOverlay show={saved} />
    <UnsavedGuard dirty={dirty} />
    </form>
  );
}
