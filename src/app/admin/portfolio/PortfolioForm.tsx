"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { savePortfolioProjectAction } from "@/lib/server/actions";
import type { PortfolioProject } from "@/lib/server/db";
import FormToggle from "@/components/admin/FormToggle";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import { Field, Section, StickyActionBar, inputClass } from "@/components/admin/FormParts";

const TAG_OPTIONS = [
  { value: "MV", label: "MV" },
  { value: "FEATURE_FILMS", label: "Feature films" },
  { value: "TV_COMMERCIAL", label: "TV commercial" },
  { value: "OTHERS", label: "Others" },
];

const RECOMMENDED_PIXELS: Record<"landscape" | "portrait", string> = {
  landscape: "1600×900px",
  portrait: "900×1600px",
};

export default function PortfolioForm({ initial }: { initial?: PortfolioProject }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial?.image ?? null);
  const [orientation, setOrientation] = useState<"landscape" | "portrait">(
    initial?.orientation ?? "landscape"
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const formRef = useRef<HTMLFormElement>(null);
  const { dirty, markClean } = useFormDirty(formRef, initial);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [saved, flashSaved] = useSavedFlash();
  const [visible, setVisible] = useState(initial?.isEnabled ?? true);

  const toggleTag = (value: string) => {
    setTags((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await savePortfolioProjectAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      flashSaved();
      markClean();
      if (result.id) router.replace(`/admin/portfolio/${result.id}/edit`);
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
          <Field label="Project title" required>
            <input type="text" name="title" required defaultValue={initial?.title} className={inputClass} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Client">
              <input type="text" name="client" defaultValue={initial?.client} className={inputClass} />
            </Field>
            <Field label="Year">
              <input type="text" name="year" defaultValue={initial?.year} className={inputClass} />
            </Field>
          </div>
          <div>
            <span className="mb-2 block text-[13px] font-medium text-ink">Tags</span>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((opt) => {
                const checked = tags.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                      checked ? "border-ink bg-ink text-white" : "border-ash/30 text-ink hover:border-ink"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="tags"
                      value={opt.value}
                      checked={checked}
                      onChange={() => toggleTag(opt.value)}
                      className="hidden"
                    />
                    {opt.label}
                  </label>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-ash">Select any that apply.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Orientation">
              <select
                name="orientation"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as "landscape" | "portrait")}
                className={inputClass}
              >
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </Field>
            <Field label="Video embed URL">
              <input
                type="text"
                name="embedUrl"
                defaultValue={initial?.embedUrl}
                placeholder="https://www.youtube.com/embed/…"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Media">
          <div>
            <span className="mb-2 block text-sm font-bold text-ink">
              Cover image<span className="ml-0.5 text-[#e8553a]">*</span>
            </span>
            <label
              htmlFor="portfolioImage"
              className="relative flex h-40 w-full max-w-xs cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed border-ash/40 bg-smoke/60 text-center transition-colors hover:border-ink hover:bg-smoke"
            >
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              ) : (
                <>
                  <UploadIcon className="h-6 w-6 text-ink/60" />
                  <span className="text-sm font-semibold text-ink">Click to upload</span>
                </>
              )}
              <input
                id="portfolioImage"
                type="file"
                name="image"
                accept="image/*"
                ref={imageInputRef}
                required={!previewUrl}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreviewUrl(URL.createObjectURL(file));
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
                className="mt-2 text-sm font-medium text-red-600 underline underline-offset-2 hover:text-red-700"
              >
                Delete image
              </button>
            )}
            <p className="mt-2 text-xs text-ash">
              Max 8MB · JPG or PNG · Recommended {RECOMMENDED_PIXELS[orientation]} for {orientation}
            </p>
          </div>
        </Section>

        <Section title="Visibility">
          <FormToggle
            name="isEnabled"
            label="Visible on website"
            help="Turn off to hide this project from customers."
            checked={visible}
            onChange={setVisible}
          />
        </Section>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </div>

      <StickyActionBar cancelHref="/admin/portfolio" saveLabel="Save project" isPending={isPending} canSave={dirty} />
      <SavedOverlay show={saved} />
    <UnsavedGuard dirty={dirty} />
    </form>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 15V4M12 4 8 8M12 4l4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
