"use client";

import { useEffect, useRef, useState } from "react";

const MAX_VIDEO_SIZE = 30 * 1024 * 1024;
const MIN_DURATION = 5;
const MAX_DURATION = 120;

export default function VideoManager({ name, initialVideoUrl }: { name: string; initialVideoUrl: string | null }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pickerRef = useRef<HTMLInputElement>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = hiddenFileInputRef.current?.form;
    if (!form) return;
    const handler = () => {
      const dt = new DataTransfer();
      if (file) dt.items.add(file);
      if (hiddenFileInputRef.current) hiddenFileInputRef.current.files = dt.files;
    };
    form.addEventListener("submit", handler);
    return () => form.removeEventListener("submit", handler);
  }, [file]);

  const validateAndSet = (selected: File) => {
    setError(null);
    if (selected.type !== "video/mp4") {
      setError("Video must be an MP4 file.");
      return;
    }
    if (selected.size > MAX_VIDEO_SIZE) {
      setError("Video must be smaller than 30MB.");
      return;
    }
    const objectUrl = URL.createObjectURL(selected);
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = objectUrl;
    probe.onloadedmetadata = () => {
      if (probe.duration < MIN_DURATION || probe.duration > MAX_DURATION) {
        setError(`Video must be between ${MIN_DURATION}-${MAX_DURATION} seconds long.`);
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setFile(selected);
      setPreviewUrl(objectUrl);
      setRemoved(false);
    };
  };

  const currentSrc = previewUrl ?? (!removed ? videoUrl : null);

  return (
    <div>
      <span className="mb-3 block text-sm font-bold text-ink">Product video</span>
      <input ref={hiddenFileInputRef} type="file" name={name} accept="video/mp4" className="hidden" />
      <input type="hidden" name="existingVideoUrl" value={videoUrl ?? ""} readOnly />
      <input type="hidden" name="removeVideo" value={removed ? "1" : ""} readOnly />

      {currentSrc ? (
        <div className="flex items-start gap-4">
          <video src={currentSrc} controls className="h-28 w-40 rounded-lg bg-smoke object-cover" />
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => pickerRef.current?.click()}
              className="rounded-full border border-ash/40 px-4 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                setRemoved(true);
              }}
              className="rounded-full border border-ash/40 px-4 py-1.5 font-mono text-[11px] text-ink transition-colors hover:border-ink"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => pickerRef.current?.click()}
            className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-ash/40 text-[#e8553a] transition-colors hover:border-[#e8553a] hover:bg-[#e8553a]/5"
          >
            <VideoPlusIcon />
            <span className="text-xs font-medium">Add video</span>
          </button>
          <ul className="list-disc pl-5 text-xs text-ash">
            <li>Size: Max 30MB</li>
            <li>Duration: 5–120s</li>
            <li>Format: MP4</li>
          </ul>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <input
        ref={pickerRef}
        type="file"
        accept="video/mp4"
        className="hidden"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) validateAndSet(selected);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function VideoPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="14" height="12" rx="2" />
      <path d="m16 10 6-3v10l-6-3" />
      <path d="M9 9v6M6 12h6" />
    </svg>
  );
}
