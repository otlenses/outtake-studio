"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMotionControlProductAction } from "@/lib/server/actions";
import type { MotionControlProduct } from "@/lib/motion-control";
import FormToggle from "@/components/admin/FormToggle";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";
import SingleImageField from "@/components/admin/SingleImageField";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import { Field, Section, StickyActionBar, inputClass } from "@/components/admin/FormParts";

// Vercel rejects uploads over 4.5 MB, so the PDF is limited to 4 MB (the server checks too).
const MAX_PDF_BYTES = 4 * 1024 * 1024;

export default function MotionControlForm({ initial }: { initial?: MotionControlProduct }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const { dirty, markClean } = useFormDirty(formRef, initial);
  const [saved, flashSaved] = useSavedFlash();
  const [visible, setVisible] = useState(initial?.isEnabled ?? true);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await saveMotionControlProductAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      flashSaved();
      markClean();
      if (result.id) router.replace(`/admin/motion-control/${result.id}/edit`);
      else router.refresh();
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
          <Field label="Product name" required>
            <input type="text" name="name" required defaultValue={initial?.name} className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} defaultValue={initial?.description} className={inputClass} />
          </Field>
        </Section>

        <Section title="Media">
          <SingleImageField
            name="image"
            label="Product image"
            required
            initialUrl={initial?.image ?? null}
            hint="JPG or PNG · square works best · resized automatically"
          />
        </Section>

        <Section title="Rate card" help="The PDF customers see when they open this product.">
          <div>
            {initial?.rateCardUrl && (
              <p className="mb-3 text-sm text-ink">
                Current file:{" "}
                <a
                  href={initial.rateCardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-2 hover:text-signal"
                >
                  View PDF
                </a>
              </p>
            )}
            <input
              ref={pdfInputRef}
              type="file"
              name="rateCard"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.currentTarget.files?.[0];
                if (file && file.size > MAX_PDF_BYTES) {
                  setPdfError(`This PDF is ${(file.size / 1024 / 1024).toFixed(1)}MB. Please compress it to under 4MB and try again.`);
                  e.currentTarget.value = "";
                } else {
                  setPdfError(null);
                }
              }}
              className="block w-full text-sm text-ink file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-signal file:px-4 file:py-2 file:text-xs file:font-semibold file:text-ink hover:file:brightness-95"
            />
            <p className="mt-2 text-xs text-ash">
              {initial?.rateCardUrl ? "Choose a new PDF to replace the current one. " : ""}PDF only · max 4MB
            </p>
            {pdfError && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{pdfError}</p>}
            {initial?.rateCardUrl && (
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="removeRateCard" value="1" className="h-4 w-4" />
                Remove the current PDF (the product will have no rate card)
              </label>
            )}
          </div>
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

      <StickyActionBar cancelHref="/admin/motion-control" saveLabel="Save product" isPending={isPending} canSave={dirty} />
      <SavedOverlay show={saved} />
      <UnsavedGuard dirty={dirty} />
    </form>
  );
}
