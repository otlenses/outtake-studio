"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { saveBannerAction } from "@/lib/server/actions";
import type { BannerContent } from "@/lib/server/db";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import SaveButton from "@/components/admin/SaveButton";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";

function BannerEditor({
  page,
  title,
  content,
}: {
  page: "home" | "rental";
  title: string;
  content: BannerContent;
}) {
  const [saved, flashSaved] = useSavedFlash();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(content.image);
  const [focus, setFocus] = useState({ x: content.focusX ?? 50, y: content.focusY ?? 50 });
  const dragging = useRef(false);
  const [removeImage, setRemoveImage] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { dirty, markClean } = useFormDirty(formRef, content);

  const moveFocus = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setFocus({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    if (removeImage) formData.set("removeImage", "1");
    startTransition(async () => {
      const result = await saveBannerAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setRemoveImage(false);
      flashSaved();
      markClean();
    });
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-sm shadow-ink/5"
    >
      <h2 className="mb-5 text-lg font-bold text-ink">{title}</h2>
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="existingImage" value={preview ?? ""} />
      <input type="hidden" name="focusX" value={Math.round(focus.x)} />
      <input type="hidden" name="focusY" value={Math.round(focus.y)} />

      <div className="flex flex-col gap-6">
        <div>
          <span className="mb-2 block text-sm text-ink/70">Banner image</span>
          <div className="flex flex-col gap-3">
            {preview && !removeImage ? (
              <>
                <div
                  className="relative w-full max-w-xl cursor-crosshair touch-none select-none overflow-hidden rounded-xl border border-ash/20 bg-smoke"
                  style={{ aspectRatio: "1920 / 780" }}
                  onPointerDown={(e) => {
                    dragging.current = true;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    moveFocus(e);
                  }}
                  onPointerMove={(e) => dragging.current && moveFocus(e)}
                  onPointerUp={() => (dragging.current = false)}
                >
                  <Image
                    src={preview}
                    alt="Banner preview"
                    fill
                    draggable={false}
                    className="pointer-events-none object-cover"
                    style={{ objectPosition: `${focus.x}% ${focus.y}%` }}
                  />
                  <span
                    className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-signal/80 shadow-[0_0_0_2px_rgba(0,0,0,0.4)]"
                    style={{ left: `${focus.x}%`, top: `${focus.y}%` }}
                  />
                  <button
                    type="button"
                    aria-label="Remove image"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      if (fileRef.current) fileRef.current.value = "";
                      setPreview(null);
                      setRemoveImage(true);
                    }}
                    className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-sm text-ink shadow"
                  >
                    ×
                  </button>
                </div>
              </>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ash/40 px-1 text-center text-[#e8553a] transition-colors hover:border-[#e8553a] hover:bg-[#e8553a]/5"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
                  <path d="m3 16 5-5 4 4" />
                  <path d="M18 3v6M15 6h6" />
                </svg>
                <span className="text-xs font-medium leading-tight">
                  Add image
                  <br />(0/1)
                </span>
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPreview(URL.createObjectURL(file));
                  setRemoveImage(false);
                  setFocus({ x: 50, y: 50 });
                }
              }}
            />
            <span className="text-xs text-ash">Recommended: 1920×780px · Max 8MB · JPG or PNG</span>
          </div>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink/70">Subtitle</span>
          <input
            type="text"
            name="subtitle"
            defaultValue={content.subtitle}
            placeholder="e.g. Precision in every frame."
            className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink/70">Title</span>
          <input
            type="text"
            name="title"
            defaultValue={content.title}
            placeholder="e.g. Every Frame Starts With The Right Gear"
            className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink/70">Description</span>
          <textarea
            name="description"
            rows={2}
            defaultValue={content.description}
            className="resize-none rounded border border-ash/40 px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </label>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <div className="border-t border-ash/20 pt-5">
          <SaveButton isPending={isPending} canSave={dirty} />
          <SavedOverlay show={saved} />
        </div>
      </div>
    <UnsavedGuard dirty={dirty} />
    </form>
  );
}

export default function BannerSettings({
  home,
  rental,
}: {
  home: BannerContent;
  rental: BannerContent;
}) {
  return (
    <div className="flex flex-col gap-6">
      <BannerEditor page="home" title="Home page banner" content={home} />
      <BannerEditor page="rental" title="Rental page banner" content={rental} />
    </div>
  );
}
