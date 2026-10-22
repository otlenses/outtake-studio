"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { requestPaymentOtpAction, verifyPaymentOtpAction } from "@/lib/server/actions";

/** Asks the owner for the 6-digit code emailed to them before payment details can be saved. */
export default function OtpDialog({
  onVerified,
  onCancel,
}: {
  onVerified: () => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [isPending, startTransition] = useTransition();
  const requested = useRef(false);

  const sendCode = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestPaymentOtpAction();
      if (!result.ok) {
        setError(result.error ?? "Could not send the code.");
        return;
      }
      setSentTo(result.sentTo ?? null);
      setDevMode(Boolean(result.devMode));
    });
  };

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = () => {
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await verifyPaymentOtpAction(code);
      if (!result.ok) {
        setError(result.error ?? "Incorrect code.");
        return;
      }
      onVerified();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-ink">Verify it&apos;s you</h2>
        <p className="mt-2 text-sm text-ink/70">
          {sentTo
            ? `Enter the 6-digit code we sent to ${sentTo}. Payment details can only be changed with this code.`
            : "Sending a verification code to the owner…"}
        </p>
        {devMode && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Dev mode: email isn&apos;t configured, so the code is printed in the server terminal.
          </p>
        )}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              verify();
            }
          }}
          placeholder="000000"
          className="mt-4 w-full rounded-lg border border-ash/40 px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-ink"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={sendCode}
            disabled={isPending}
            className="text-sm text-ash underline underline-offset-2 hover:text-ink disabled:opacity-50"
          >
            Resend code
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full px-4 py-2 text-sm font-medium text-ash hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={verify}
              disabled={isPending}
              className="rounded-full bg-signal px-6 py-2 text-sm font-semibold text-ink disabled:opacity-60"
            >
              Verify &amp; save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
