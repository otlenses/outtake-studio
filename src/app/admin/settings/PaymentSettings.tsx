"use client";

import { useRef, useState, useTransition } from "react";
import { updatePaymentSettingsAction } from "@/lib/server/actions";
import type { PaymentSettings } from "@/lib/server/db";
import { SELF_PICKUP_ADDRESS } from "@/lib/constants";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import SingleImageField from "@/components/admin/SingleImageField";
import SaveButton from "@/components/admin/SaveButton";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";
import OtpDialog from "@/components/admin/OtpDialog";

export default function PaymentSettingsForm({ settings }: { settings: PaymentSettings }) {
  const [saved, flashSaved] = useSavedFlash();
  const [otpOpen, setOtpOpen] = useState(false);
  const pendingData = useRef<FormData | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [removeQr, setRemoveQr] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { dirty, markClean } = useFormDirty(formRef, settings);

  const runSave = (formData: FormData) => {
    startTransition(async () => {
      const result = await updatePaymentSettingsAction(formData);
      if (!result.ok) {
        if (result.error === "OTP_REQUIRED") {
          pendingData.current = formData;
          setOtpOpen(true);
          return;
        }
        setError(result.error ?? "Something went wrong.");
        return;
      }
      pendingData.current = null;
      setRemoveQr(false);
      flashSaved();
      markClean();
    });
  };

  const handleSubmit = (formData: FormData) => {
    setError(null);
    if (removeQr) formData.set("removeQr", "1");
    runSave(formData);
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="max-w-xl rounded-2xl bg-white p-6 shadow-sm shadow-ink/5"
    >
      <h2 className="mb-5 text-lg font-bold text-ink">Payment settings</h2>

      <div className="flex flex-col gap-6">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink/70">Bank name</span>
          <input
            type="text"
            name="bankName"
            defaultValue={settings.bankName}
            className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink/70">Account name</span>
          <input
            type="text"
            name="accountName"
            defaultValue={settings.accountName}
            className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink/70">Account number</span>
          <input
            type="text"
            name="accountNumber"
            defaultValue={settings.accountNumber}
            className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </label>

        <SingleImageField
          name="qrImage"
          label="QR payment code (e.g. DuitNow QR)"
          initialUrl={settings.qrImage}
          fit="contain"
          compress={{ maxSide: 1200, format: "png" }}
          onChange={({ empty }) => setRemoveQr(empty)}
        />

        <div className="border-t border-ash/20 pt-6">
          <span className="text-sm text-ink/70">Pickup address</span>
          <p className="mt-1.5 rounded border border-ash/20 bg-paper p-3 text-sm text-ink">
            {SELF_PICKUP_ADDRESS}
          </p>
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="border-t border-ash/20 pt-5">
          <SaveButton isPending={isPending} canSave={dirty} />
          <p className="mt-2 text-xs text-ash">
            For security, saving payment details needs a verification code sent to the owner.
          </p>
          <SavedOverlay show={saved} />
          {otpOpen && (
            <OtpDialog
              onCancel={() => setOtpOpen(false)}
              onVerified={() => {
                setOtpOpen(false);
                if (pendingData.current) runSave(pendingData.current);
              }}
            />
          )}
        </div>
      </div>
    <UnsavedGuard dirty={dirty} />
    </form>
  );
}
