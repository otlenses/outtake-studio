"use client";

import { useState, useTransition } from "react";
import { compressImage, setInputFile } from "@/lib/compress-image";
import Image from "next/image";
import Link from "next/link";
import { type MerchItem, formatName } from "@/lib/data";
import { SELF_PICKUP_ADDRESS } from "@/lib/constants";
import type { PaymentMethod, PaymentSettings } from "@/lib/server/db";
import { submitMerchOrder } from "@/lib/server/actions";
import SuccessCheck from "./SuccessCheck";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MerchCheckoutForm({
  item,
  size,
  quantity,
  paymentSettings,
}: {
  item: MerchItem;
  size: string;
  quantity: number;
  paymentSettings: PaymentSettings;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    paymentSettings.qrImage ? "QR_PAYMENT" : "BANK_TRANSFER"
  );
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  const subtotal = item.price * quantity;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("customerEmail") ?? "").trim();
    if (!EMAIL_PATTERN.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setPendingFormData(formData);
  };

  const confirmSubmit = () => {
    const formData = pendingFormData;
    setPendingFormData(null);
    if (!formData) return;

    startTransition(async () => {
      const result = await submitMerchOrder(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        return;
      }
      setOrderNumber(result.orderNumber ?? null);
    });
  };

  if (orderNumber) {
    return (
      <div className="mx-auto w-full max-w-xl px-[max(1.5rem,4vw)] py-20 text-center">
        <SuccessCheck />
        <h1 className="mt-6 font-display text-3xl font-black tracking-tight">
          Order Received
        </h1>
        <p className="mt-4 text-base text-ink/80">
          Your order <span className="font-semibold text-ink">{orderNumber}</span>{" "}
          has been received. We&apos;ll verify your payment and let you know once it&apos;s ready
          for pickup.
        </p>
        <Link
          href="/merchandise"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-signal px-8 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
        >
          Back to Merchandise
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-[max(1.5rem,4vw)] py-10 md:py-14">
      <nav className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
        <Link href="/merchandise" className="transition-colors hover:text-ink">
          Merchandise
        </Link>
        <span>/</span>
        <span className="text-ink">Checkout</span>
      </nav>

      <h1 className="page-title mb-10 font-display text-3xl font-black tracking-tight md:text-4xl">
        Checkout
      </h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: form */}
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            <input type="hidden" name="productId" value={item.id} />
            <input type="hidden" name="productName" value={item.name} />
            <input type="hidden" name="productImage" value={item.image} />
            <input type="hidden" name="unitPrice" value={item.price} />
            <input type="hidden" name="size" value={size} />
            <input type="hidden" name="quantity" value={quantity} />

            {/* Contact */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-ink">Contact details</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full name" name="customerName" required />
                <Field label="WhatsApp phone number" name="customerPhone" type="tel" required />
                <Field label="Email" name="customerEmail" type="email" />
                <Field label="Company (optional)" name="companyName" required={false} />
              </div>
            </section>

            {/* Shipping */}
            <section className="border-t border-ash/20 pt-8">
              <h2 className="mb-4 text-lg font-bold text-ink">Shipping</h2>
              <label className="flex flex-col gap-2">
                <span className="text-sm text-ink/70">Shipping option</span>
                <select
                  disabled
                  defaultValue="SELF_PICKUP"
                  className="w-full rounded border border-ash/40 bg-smoke/40 px-3 py-2.5 text-sm text-ink outline-none"
                >
                  <option value="SELF_PICKUP">Pickup in studio</option>
                </select>
              </label>
              <div className="mt-4 rounded-lg bg-smoke px-4 py-3">
                <p className="text-sm font-semibold text-ink">Pickup address</p>
                <p className="mt-1 text-sm text-ink/80">{SELF_PICKUP_ADDRESS}</p>
              </div>
            </section>

            {/* Payment */}
            <section className="border-t border-ash/20 pt-8">
              <h2 className="mb-4 text-lg font-bold text-ink">Payment method</h2>

              <div className="mb-5 flex items-start gap-3 rounded-lg bg-smoke px-4 py-3">
                <CautionIcon className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
                <p className="text-sm text-ink/80">
                  Please upload the payment proof after transferring the order amount.
                </p>
              </div>

              <input type="hidden" name="paymentMethod" value={paymentMethod} />

              <div className="flex flex-col gap-3">
                <PaymentOption
                  label="QR payment"
                  description="Scan the QR code with any Malaysian banking or e-wallet app."
                  selected={paymentMethod === "QR_PAYMENT"}
                  onSelect={() => setPaymentMethod("QR_PAYMENT")}
                >
                  {paymentSettings.qrImage ? (
                    <div className="relative mt-3 h-48 w-48 overflow-hidden rounded-lg border border-ash/20 bg-white">
                      <Image
                        src={paymentSettings.qrImage}
                        alt="Payment QR code"
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-ash">
                      QR code coming soon — please use bank transfer for now.
                    </p>
                  )}
                </PaymentOption>

                <PaymentOption
                  label="Bank transfer"
                  description="Transfer manually to our bank account."
                  selected={paymentMethod === "BANK_TRANSFER"}
                  onSelect={() => setPaymentMethod("BANK_TRANSFER")}
                >
                  <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/60">Bank</dt>
                      <dd className="font-medium text-ink">{paymentSettings.bankName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/60">Account name</dt>
                      <dd className="font-medium text-ink">{paymentSettings.accountName}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-ink/60">Account number</dt>
                      <dd className="font-medium text-ink">{paymentSettings.accountNumber}</dd>
                    </div>
                  </dl>
                </PaymentOption>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <span className="text-sm font-semibold text-ink">
                  Upload payment slip <span className="text-signal">*</span>
                </span>
                <label
                  htmlFor="paymentSlip"
                  className="relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/30 bg-smoke/60 px-4 py-8 text-center transition-colors hover:border-ink hover:bg-smoke"
                >
                  <UploadIcon className="h-7 w-7 text-ink" />
                  <span className="text-sm font-semibold text-ink">
                    {slipPreview ? "Replace payment slip" : "Click to upload payment slip"}
                  </span>
                  <span className="text-xs text-ash">PNG or JPG</span>
                  <input
                    id="paymentSlip"
                    type="file"
                    name="paymentSlip"
                    accept="image/*"
                    required
                    onChange={async (e) => {
                      const input = e.currentTarget;
                      const original = input.files?.[0];
                      if (!original) {
                        setSlipPreview(null);
                        return;
                      }
                      // phone photos are several MB; shrink first so the upload is accepted
                      const file = await compressImage(original, { maxSide: 1800 });
                      if (file !== original) setInputFile(input, file);
                      setSlipPreview(URL.createObjectURL(file));
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
                {slipPreview && (
                  <div className="relative mt-1 h-32 w-32 overflow-hidden rounded-lg border border-ash/20">
                    <Image src={slipPreview} alt="Payment slip preview" fill className="object-cover" />
                  </div>
                )}
              </div>
            </section>

            {/* Notes */}
            <section className="border-t border-ash/20 pt-8">
              <h2 className="mb-4 text-lg font-bold text-ink">Notes</h2>
              <textarea
                name="notes"
                rows={3}
                placeholder="Anything else we should know? (optional)"
                className="w-full resize-none rounded border border-ash/40 px-3 py-2.5 text-sm outline-none focus:border-ink"
              />
            </section>

            {error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 font-mono text-xs text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center rounded-full bg-signal py-4 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {isPending ? "Submitting..." : "Submit Order"}
            </button>
          </form>
        </div>

        {/* Right: order summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 text-lg font-bold text-ink">Order summary</h2>
          <div className="rounded-lg border border-ash/20 p-4">
            <div className="flex gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-smoke">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="font-display text-sm font-bold tracking-tight">
                  {formatName(item.name)}
                </span>
                <span className="mt-1 text-sm text-ink/70">
                  Size {size} · Qty {quantity}
                </span>
                <span className="mt-1 text-sm font-semibold text-ink">
                  RM {item.price.toFixed(2)} each
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-ash/25 pt-6">
            <div className="flex items-center justify-between text-sm text-ink/70">
              <span>Subtotal</span>
              <span>RM {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-ink/70">
              <span>Pickup in studio</span>
              <span>FREE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-ink">Total</span>
              <span className="font-display text-2xl font-black text-ink">
                RM {subtotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {pendingFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-paper p-6 text-center shadow-xl">
            <CautionIcon className="mx-auto h-8 w-8 text-signal" />
            <h2 className="mt-3 text-lg font-bold text-ink">Payment proof uploaded?</h2>
            <p className="mt-2 text-sm text-ink/70">
              Please confirm you&apos;ve uploaded your payment slip before submitting this order.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={isPending}
                className="flex-1 rounded-full bg-signal py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {isPending ? "Submitting..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setPendingFormData(null)}
                disabled={isPending}
                className="flex-1 rounded-full border border-ash/40 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = true,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-ink/70">
        {label}{required &&  <span className="text-[#e8553a]">*</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded border border-ash/40 px-3 py-2.5 text-sm outline-none transition-colors focus:border-ink"
      />
    </label>
  );
}

function PaymentOption({
  label,
  description,
  selected,
  onSelect,
  children,
}: {
  label: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 transition-colors ${
        selected ? "border-ink" : "border-ash/30"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex w-full items-start gap-3 text-left"
      >
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-ink" : "border-ash/50"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-ink" />}
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">{label}</span>
          <span className="block text-sm text-ink/60">{description}</span>
        </span>
      </button>
      {selected && children}
    </div>
  );
}

function CautionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.2" r="1.1" fill="currentColor" />
    </svg>
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
