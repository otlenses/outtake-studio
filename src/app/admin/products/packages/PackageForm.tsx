"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePackageProductAction } from "@/lib/server/actions";
import type { PackageProduct } from "@/lib/server/db";
import ImageManager, { getImageCount } from "@/components/admin/ImageManager";
import VideoManager from "@/components/admin/VideoManager";
import SpecSectionsEditor from "@/components/admin/SpecSectionsEditor";
import RowListEditor from "@/components/admin/RowListEditor";
import FormToggle from "@/components/admin/FormToggle";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import { Field, Section, StickyActionBar, inputClass } from "@/components/admin/FormParts";
import SavedOverlay from "@/components/admin/SavedOverlay";

const MAX_HIGHLIGHTS = 5;

const PERIOD_OPTIONS = [
  { value: "/day", label: "Per day" },
  { value: "/week", label: "Per week" },
  { value: "/month", label: "Per month" },
];

function parsePriceNumber(price?: string): string {
  if (!price) return "";
  return price.replace(/[^0-9.]/g, "");
}

export default function PackageForm({ initial }: { initial?: PackageProduct }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { dirty, markClean } = useFormDirty(formRef, initial);

  const initialPeriod = initial?.period ?? "/day";
  const isPreset = PERIOD_OPTIONS.some((o) => o.value === initialPeriod);
  const [periodChoice, setPeriodChoice] = useState(isPreset ? initialPeriod : "__custom__");
  const [customPeriod, setCustomPeriod] = useState(isPreset ? "" : initialPeriod);
  const period = periodChoice === "__custom__" ? customPeriod : periodChoice;

  const [visible, setVisible] = useState(initial?.isEnabled ?? true);
  const [carousel, setCarousel] = useState(initial?.featuredOnHome ?? false);
  const [popular, setPopular] = useState(initial?.featured ?? false);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    if (getImageCount(formData, "images") === 0) {
      setError("Please upload at least one package image.");
      return;
    }
    startTransition(async () => {
      const result = await savePackageProductAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1700);
      markClean();
      if (result.id) router.replace(`/admin/products/packages/${result.id}/edit`);
    });
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-2xl bg-white px-6 pt-6 shadow-sm shadow-ink/5 sm:px-8 sm:pt-8"
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <input type="hidden" name="period" value={period} />

      <div className="flex flex-col gap-8">
        <Section title="Basic information" first>
          <Field label="Package name" required>
            <input type="text" name="name" required defaultValue={initial?.name} className={inputClass} />
          </Field>
          <Field label="Tagline" help="A short line shown under the package name.">
            <input type="text" name="tagline" defaultValue={initial?.tagline} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Price (RM)" required>
              <div className="flex items-center rounded-lg border border-ash/30 focus-within:border-ink">
                <span className="pl-3 text-sm text-ash">RM</span>
                <input
                  type="number"
                  name="price"
                  step="1"
                  min="0"
                  required
                  defaultValue={parsePriceNumber(initial?.price)}
                  className="w-full rounded-lg bg-transparent px-2 py-2.5 text-sm outline-none"
                />
              </div>
            </Field>
            <Field label="Rental period" required>
              <select
                value={periodChoice}
                onChange={(e) => setPeriodChoice(e.target.value)}
                className={inputClass}
              >
                {PERIOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
                <option value="__custom__">Custom…</option>
              </select>
              {periodChoice === "__custom__" && (
                <input
                  type="text"
                  required
                  value={customPeriod}
                  onChange={(e) => setCustomPeriod(e.target.value)}
                  placeholder="e.g. /event"
                  className={`${inputClass} mt-2`}
                />
              )}
            </Field>
          </div>
          <Field label="Description" help="Shown on the package detail page.">
            <textarea
              name="description"
              rows={7}
              defaultValue={initial?.description}
              className={`${inputClass} resize-y`}
            />
          </Field>
        </Section>

        <Section title="Media">
          <ImageManager
            name="images"
            label="Package images"
            initialImages={initial?.images ?? (initial?.image ? [initial.image] : [])}
          />
          <VideoManager name="video" initialVideoUrl={initial?.videoUrl ?? null} />
        </Section>

        <Section
          title="Highlights"
          help={`Short highlights shown on the package card. Up to ${MAX_HIGHLIGHTS}.`}
        >
          <RowListEditor
            name="features"
            initial={initial?.features}
            max={MAX_HIGHLIGHTS}
            addLabel="Add highlight"
            placeholder="e.g. 14 stops dynamic range"
          />
        </Section>

        <Section title="Package specifications">
          <SpecSectionsEditor name="specSections" initial={initial?.specSections} />
        </Section>

        <Section title="Visibility">
          <FormToggle
            name="isEnabled"
            label="Visible on website"
            help="Turn off to hide this package from customers."
            checked={visible}
            onChange={setVisible}
          />
          <FormToggle
            name="featuredOnHome"
            label="Show in homepage carousel"
            help={visible ? "Feature this package on the home page." : "Turn on “Visible on website” first."}
            checked={carousel}
            onChange={setCarousel}
            disabled={!visible}
          />
          <FormToggle
            name="featured"
            label="Mark as popular"
            help="Adds a Popular label to the package."
            checked={popular}
            onChange={setPopular}
          />
        </Section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      <StickyActionBar cancelHref="/admin/products?type=packages" saveLabel="Save package" isPending={isPending} canSave={dirty} />

      <SavedOverlay show={saved} />
    <UnsavedGuard dirty={dirty} />
    </form>
  );
}
