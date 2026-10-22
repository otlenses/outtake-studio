"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const MAX_IMAGES = 9;

type ImageEntry =
  | { key: string; kind: "existing"; url: string }
  | { key: string; kind: "new"; file: File; previewUrl: string };

export default function ImageManager({
  name,
  initialImages,
  label = "Product images",
}: {
  name: string;
  initialImages: string[];
  label?: string;
}) {
  const [items, setItems] = useState<ImageEntry[]>(() =>
    initialImages.map((url, i) => ({ key: `existing-${i}-${url}`, kind: "existing", url }))
  );
  const pickerRef = useRef<HTMLInputElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - items.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newEntries: ImageEntry[] = toAdd.map((file) => ({
      key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: "new",
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setItems((prev) => [...prev, ...newEntries]);
  };

  const removeAt = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const moveTo = (from: number, to: number) => {
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  // Sync the ordered "new" files into the hidden multi-file input right
  // before the form submits, using DataTransfer to build a real FileList.
  useEffect(() => {
    const form = hiddenFileInputRef.current?.form;
    if (!form) return;
    const handler = () => {
      const dt = new DataTransfer();
      items.forEach((item) => {
        if (item.kind === "new") dt.items.add(item.file);
      });
      if (hiddenFileInputRef.current) hiddenFileInputRef.current.files = dt.files;
    };
    form.addEventListener("submit", handler);
    return () => form.removeEventListener("submit", handler);
  }, [items]);

  const orderTokens = items.map((item) => (item.kind === "existing" ? `existing:${item.url}` : "new"));

  return (
    <div>
      <span className="mb-3 block text-sm font-bold text-ink">
        {label}<span className="ml-0.5 text-[#e8553a]">*</span>
      </span>
      <input type="hidden" name={`${name}Order`} value={JSON.stringify(orderTokens)} readOnly />
      <input ref={hiddenFileInputRef} type="file" name={name} multiple accept="image/*" className="hidden" />

      <div className="flex flex-wrap gap-3">
        {items.map((item, index) => (
          <div
            key={item.key}
            draggable
            onDragStart={() => {
              dragIndex.current = index;
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex.current === null || dragIndex.current === index) return;
              moveTo(dragIndex.current, index);
              dragIndex.current = null;
            }}
            className="relative h-24 w-24 shrink-0 cursor-move overflow-hidden rounded-xl border border-ash/30 bg-smoke"
          >
            <Image
              src={item.kind === "existing" ? item.url : item.previewUrl}
              alt=""
              fill
              className="pointer-events-none object-cover"
            />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-ink/80 px-1.5 py-0.5 font-mono text-[9px] text-white">
                Main
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Remove image"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-xs text-ink shadow"
            >
              ×
            </button>
          </div>
        ))}

        {items.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => pickerRef.current?.click()}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ash/40 px-1 text-center text-[#e8553a] transition-colors hover:border-[#e8553a] hover:bg-[#e8553a]/5"
          >
            <ImagePlusIcon />
            <span className="text-xs font-medium leading-tight">
              Add image
              <br />({items.length}/{MAX_IMAGES})
            </span>
          </button>
        )}
      </div>
      <ul className="mt-3 list-disc pl-5 text-xs text-ash">
        <li>Size: Max 8MB per image</li>
        <li>Format: JPG, PNG</li>
        <li>First image is the main photo — drag to reorder</li>
      </ul>
      <input
        ref={pickerRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
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

export function getImageCount(formData: FormData, name: string): number {
  try {
    const order = JSON.parse(String(formData.get(`${name}Order`) || "[]"));
    return Array.isArray(order) ? order.length : 0;
  } catch {
    return 0;
  }
}
