"use client";

import { useRef, useState } from "react";
import { compressImage, setInputFile, type CompressOptions } from "@/lib/compress-image";

/**
 * One-image uploader in the same style as the product "Add image" tiles.
 * The real file input (named `name`) lives inside, so it also works in plain <form>s.
 */
export default function SingleImageField({
  name,
  initialUrl = null,
  label,
  required,
  hint = "JPG or PNG · resized automatically",
  fit = "cover",
  compress,
  onChange,
}: {
  name: string;
  initialUrl?: string | null;
  label?: string;
  required?: boolean;
  hint?: string;
  /** "contain" keeps the whole picture visible (e.g. QR codes). */
  fit?: "cover" | "contain";
  /** How to shrink the picture before upload (default: 2000 px, WebP). */
  compress?: CompressOptions;
  /** `empty` is true when the tile shows no image (nothing saved and nothing picked). */
  onChange?: (state: { file: File | null; empty: boolean }) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl);
  const isLocal = preview?.startsWith("blob:");

  return (
    <div>
      {label && (
        <span className="mb-3 block text-sm text-ink/70">
          {label}{required && <span className="ml-0.5 text-[#e8553a]">*</span>}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        required={required && !preview}
        className="hidden"
        onChange={async (e) => {
          const input = e.currentTarget;
          const original = input.files?.[0] ?? null;
          if (!original) return;
          const file = await compressImage(original, compress);
          if (file !== original) setInputFile(input, file);
          setPreview(URL.createObjectURL(file));
          onChange?.({ file, empty: false });
        }}
      />

      {preview ? (
        <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-ash/30 bg-smoke">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className={`h-full w-full ${fit === "contain" ? "object-contain p-1" : "object-cover"}`} />
          {!isLocal && (
            <a href={preview} target="_blank" rel="noopener noreferrer" aria-label="Open full size" className="absolute inset-0" />
          )}
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              setPreview(null);
              onChange?.({ file: null, empty: true });
            }}
            aria-label="Remove image"
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-xs text-ink shadow"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ash/40 px-1 text-center text-[#e8553a] transition-colors hover:border-[#e8553a] hover:bg-[#e8553a]/5"
        >
          <ImagePlusIcon />
          <span className="text-xs font-medium leading-tight">
            Add image
            <br />({preview ? 1 : 0}/1)
          </span>
        </button>
      )}
      {hint && <p className="mt-2 text-xs text-ash">{hint}</p>}
    </div>
  );
}

function ImagePlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
      <path d="m3 16 5-5 4 4" />
      <path d="M18 3v6M15 6h6" />
    </svg>
  );
}
