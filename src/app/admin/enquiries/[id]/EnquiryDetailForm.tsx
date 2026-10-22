"use client";

import { useState, useTransition } from "react";
import { updateEnquiryAction } from "@/lib/server/actions";
import type { Enquiry, EnquiryStatus } from "@/lib/server/db";
import { ENQUIRY_STATUSES, ENQUIRY_STATUS_LABELS } from "@/lib/server/status-labels";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";
import { StickyActionBar } from "@/components/admin/FormParts";
import { formatTimestamp } from "@/lib/format-date";
import UnsavedGuard from "@/components/admin/UnsavedGuard";

export default function EnquiryDetailForm({ enquiry }: { enquiry: Enquiry }) {
  const [saved, flashSaved] = useSavedFlash();
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [internalNotes, setInternalNotes] = useState(enquiry.internalNotes);
  const [isPending, startTransition] = useTransition();
  const [base, setBase] = useState({ status: enquiry.status, internalNotes: enquiry.internalNotes });
  const dirty = status !== base.status || internalNotes !== base.internalNotes;

  const handleSave = () => {
    startTransition(async () => {
      await updateEnquiryAction(enquiry.id, { status, internalNotes });
      setBase({ status, internalNotes });
      flashSaved();
    });
  };

  return (
    <div className="max-w-2xl rounded-2xl bg-white px-6 pt-6 shadow-sm shadow-ink/5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-black tracking-tight">{enquiry.name}</h1>
        <span className="text-sm text-ash">{formatTimestamp(enquiry.submittedAt)}</span>
      </div>

      <section className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Contact info</h2>
        <div className="grid grid-cols-1 gap-4 rounded-xl bg-smoke/50 p-4 sm:grid-cols-2">
          <Info label="Phone" value={enquiry.phone || "—"} />
          <Info label="Email" value={enquiry.email || "—"} />
        </div>
      </section>

      <section className="mt-6 border-t border-ash/20 pt-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Message</h2>
        <p className="whitespace-pre-wrap rounded border border-ash/20 bg-paper p-3 text-sm text-ink">
          {enquiry.message}
        </p>
      </section>

      <section className="mt-6 border-t border-ash/20 pt-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Status & notes</h2>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink/70">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as EnquiryStatus)}
            className="w-48 rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
          >
            {ENQUIRY_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ENQUIRY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-4 flex flex-col gap-2">
          <span className="text-sm text-ink/70">Internal notes</span>
          <textarea
            rows={4}
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            className="resize-none rounded border border-ash/40 px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
        </label>
      </section>

      <StickyActionBar
        cancelHref="/admin/enquiries"
        saveLabel="Save changes"
        isPending={isPending}
        canSave={dirty}
        onSave={handleSave}
      />
      <UnsavedGuard dirty={dirty} />
      <SavedOverlay show={saved} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm text-ink/70">{label}</span>
      <p className="mt-1 text-[15px] font-semibold text-ink">{value}</p>
    </div>
  );
}
