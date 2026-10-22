"use client";

import { useRef, useState, useTransition } from "react";
import { updateNotificationSettingsAction } from "@/lib/server/actions";
import type { NotificationSettings } from "@/lib/server/db";
import useFormDirty from "@/components/admin/useFormDirty";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import SaveButton from "@/components/admin/SaveButton";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";

export default function NotificationSettingsForm({ settings }: { settings: NotificationSettings }) {
  const [saved, flashSaved] = useSavedFlash();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [emailEnabled, setEmailEnabled] = useState(settings.emailEnabled);
  const [pushEnabled, setPushEnabled] = useState(settings.pushEnabled);
  const formRef = useRef<HTMLFormElement>(null);
  const { dirty, markClean } = useFormDirty(formRef, settings);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await updateNotificationSettingsAction(formData);
      if (!result.ok) setError(result.error ?? "Something went wrong.");
      else {
        flashSaved();
        markClean();
      }
    });
  };

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="max-w-xl rounded-2xl bg-white p-6 shadow-sm shadow-ink/5"
    >
      <h2 className="mb-5 text-lg font-bold text-ink">Notification settings</h2>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ink">Email notifications</p>
            <p className="text-sm text-ink/60">Get an email when a new order, merch order, or enquiry comes in</p>
          </div>
          <Switch
            name="emailEnabled"
            checked={emailEnabled}
            onChange={setEmailEnabled}
          />
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-ink/70">Email address</span>
          <input
            type="email"
            name="notifyEmail"
            defaultValue={settings.notifyEmail}
            placeholder="admin@outtakestudio.com"
            className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink disabled:opacity-50"
          />
        </label>

        <div className="flex items-center justify-between gap-4 border-t border-ash/20 pt-6">
          <div>
            <p className="text-sm font-semibold text-ink">Push notifications</p>
            <p className="text-sm text-ink/60">Receive browser alerts (coming soon — this saves your preference for later)</p>
          </div>
          <Switch name="pushEnabled" checked={pushEnabled} onChange={setPushEnabled} />
        </div>

        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <div className="border-t border-ash/20 pt-5">
          <SaveButton isPending={isPending} canSave={dirty} />
          <SavedOverlay show={saved} />
        </div>
      </div>
    <UnsavedGuard dirty={dirty} />
    </form>
  );
}

function Switch({
  name,
  checked,
  onChange,
}: {
  name: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const [touched, setTouched] = useState(false);
  return (
    <label
      data-on={checked}
      className={`t-toggle relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center ${touched ? "is-init" : ""}`}
    >
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(e) => {
          setTouched(true);
          onChange(e.target.checked);
        }}
        className="peer sr-only"
      />
      <span className="absolute inset-0 rounded-full bg-ash/30 transition-colors peer-checked:bg-emerald-500" />
      <span className="t-toggle-thumb absolute left-[3px] h-[18px] w-[18px] rounded-full bg-white shadow" />
    </label>
  );
}
