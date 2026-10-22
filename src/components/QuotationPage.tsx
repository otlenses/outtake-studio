"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart-context";
import { submitOrderRequest } from "@/lib/server/actions";
import { RemoveIcon } from "./CartDrawer";
import SuccessCheck from "./SuccessCheck";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  startDate: string;
  endDate: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  companyName: "",
  startDate: "",
  endDate: "",
  notes: "",
};

export default function QuotationPage() {
  const { items, updateQuantity, removeItem, clearItems } = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [emailError, setEmailError] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const endDateRef = useRef<HTMLInputElement>(null);

  const total = items.reduce((sum, i) => sum + i.dailyRate * i.quantity, 0);

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleStartDateChange = (value: string) => {
    setForm((prev) => ({ ...prev, startDate: value }));
    if (value) {
      requestAnimationFrame(() => {
        try {
          endDateRef.current?.showPicker?.();
        } catch {
          endDateRef.current?.focus();
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.email.trim() && !EMAIL_PATTERN.test(form.email.trim())) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    setConfirming(true);
  };

  const submitOrder = async () => {
    setStatus("submitting");
    try {
      const result = await submitOrderRequest({
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerEmail: form.email.trim(),
        companyName: form.companyName.trim(),
        rentalStartDate: form.startDate,
        rentalEndDate: form.endDate,
        customerNotes: form.notes.trim(),
        items: items.map((i) => ({
          productId: i.id,
          productName: i.name,
          productImage: i.image || null,
          unitPrice: i.dailyRate,
          quantity: i.quantity,
          subtotal: i.dailyRate * i.quantity,
        })),
      });
      if (!result.ok) {
        setConfirming(false);
        setStatus("error");
        return;
      }
      setOrderNumber(result.orderNumber ?? null);
      clearItems();
    } catch (err) {
      console.error("Failed to submit order request", err);
      setConfirming(false);
      setStatus("error");
    }
  };

  if (orderNumber) {
    return (
      <div className="mx-auto w-full max-w-xl px-[max(1.5rem,4vw)] py-20 text-center">
        <QuoteSteps complete />
        <SuccessCheck />
        <h1 className="mt-6 font-display text-3xl font-black tracking-tight">
          Request Sent
        </h1>
        <p className="mt-4 text-sm text-ash">
          Your order request <span className="font-semibold text-ink">{orderNumber}</span>{" "}
          has been received. We&apos;ll confirm availability &amp; pricing with you directly.
        </p>
        <Link
          href="/rental"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-signal px-8 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
        >
          Browse Rental Catalogue
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl px-[max(1.5rem,4vw)] py-20 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-ash">Order Request</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-tight">
          Your Order Is Empty
        </h1>
        <p className="mt-4 text-sm text-ash">
          Add gear or packages first, then come back here to review and submit your order.
        </p>
        <Link
          href="/rental"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-signal px-8 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
        >
          Browse Rental Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-[max(1.5rem,4vw)] py-10 md:py-14">
      <QuoteSteps />
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash">Quote Request</p>
      <h1 className="page-title font-display text-3xl font-black tracking-tight md:text-4xl">
        Request a Quote
      </h1>
      <p className="mb-10 mt-4 max-w-xl text-sm text-ash md:text-base">
        Fill in your rental details and we&apos;ll get back to you with availability and a quotation.
      </p>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Left: Order Form */}
        <div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* Contact */}
            <section>
              <h2 className="mb-4 text-lg font-bold text-ink">Contact details</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Full name" value={form.name} onChange={update("name")} required />
                <Field
                  label="Phone number"
                  type="tel"
                  value={form.phone}
                  onChange={update("phone")}
                  required
                />
                <div>
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setEmailError(false);
                      update("email")(e);
                    }}
                    required
                  />
                  {emailError && (
                    <p className="mt-1.5 font-mono text-[11px] text-red-600">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>
                <Field
                  label="Company (optional)"
                  value={form.companyName}
                  onChange={update("companyName")}
                  required={false}
                />
              </div>
            </section>

            {/* Rental dates */}
            <section className="border-t border-ash/20 pt-8">
              <h2 className="mb-4 text-lg font-bold text-ink">Rental dates</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-ink/70">Rental start date <span className="text-signal">*</span></span>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full rounded border border-ash/40 bg-transparent px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-ink/70">Rental end date <span className="text-signal">*</span></span>
                  <input
                    ref={endDateRef}
                    type="date"
                    required
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={update("endDate")}
                    className="w-full rounded border border-ash/40 bg-transparent px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink"
                  />
                </label>
              </div>
            </section>

            {/* Notes */}
            <section className="border-t border-ash/20 pt-8">
              <h2 className="mb-4 text-lg font-bold text-ink">Notes</h2>
              <textarea
                rows={3}
                value={form.notes}
                onChange={update("notes")}
                placeholder="Anything else we should know? (optional)"
                className="w-full resize-none rounded border border-ash/40 bg-transparent px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink"
              />
            </section>

            {status === "error" && (
              <p className="rounded-lg bg-red-50 px-4 py-3 font-mono text-xs text-red-700">
                Something went wrong submitting your order. Please try again.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-signal py-4 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting..." : "Submit Quote Request"}
            </button>
            <p className="-mt-6 font-mono text-[10px] tracking-[0.08em] text-ash">
              No payment now — we confirm availability &amp; pricing with you directly.
            </p>
          </form>
        </div>

        {/* Right: Order summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="mb-4 text-lg font-bold text-ink">Quote summary</h2>

          <div className="rounded-lg border border-ash/20 p-4">
            <ul className="flex flex-col divide-y divide-ash/15">
              {items.map((item) => (
                <QuoteLineItem
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
                />
              ))}
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-ash/25 pt-6">
            <span className="text-base font-bold text-ink">Estimated Daily Rate</span>
            <span className="font-display text-2xl font-black text-ink">
              RM {total.toFixed(2)}
              <span className="ml-1 font-body text-sm font-normal text-ash">/ day</span>
            </span>
          </div>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-paper p-6 text-center shadow-xl">
            <h2 className="text-lg font-bold text-ink">Submit quote request?</h2>
            <p className="mt-2 text-sm text-ink/70">Please check your details before submitting.</p>
            <dl className="mt-4 flex flex-col gap-1.5 rounded-lg bg-smoke px-4 py-3 text-left text-sm">
              <div className="flex justify-between gap-3"><dt className="text-ash">Name</dt><dd className="text-right font-medium text-ink">{form.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ash">Phone</dt><dd className="text-right font-medium text-ink">{form.phone}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ash">Email</dt><dd className="break-all text-right font-medium text-ink">{form.email}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-ash">Dates</dt><dd className="text-right font-medium text-ink">{form.startDate} to {form.endDate}</dd></div>
            </dl>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={submitOrder}
                disabled={status === "submitting"}
                className="flex-1 rounded-full bg-signal py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {status === "submitting" ? "Submitting..." : "Yes"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={status === "submitting"}
                className="flex-1 rounded-full border border-ash/40 py-3 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-colors hover:border-ink disabled:opacity-60"
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

function QuoteLineItem({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}) {
  const [showIncluded, setShowIncluded] = useState(false);
  const included = item.included ?? [];

  return (
    <li className="flex flex-col gap-4 py-5">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-smoke">
          <Image src={item.image} alt={item.name} fill className="object-cover" />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-sm font-bold tracking-tight">
              {item.name}
            </span>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${item.name}`}
              className="flex h-6 w-6 shrink-0 items-center justify-center text-ash transition-colors hover:text-ink"
            >
              <RemoveIcon />
            </button>
          </div>
          <span className="mt-1 font-mono text-xs text-ash">
            RM {item.dailyRate.toFixed(2)} / day
          </span>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center rounded-full border border-ash/40">
              <button
                type="button"
                aria-label={`Decrease ${item.name} quantity`}
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                className="flex h-7 w-7 items-center justify-center font-mono text-xs text-ink transition-colors hover:text-signal"
              >
                −
              </button>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => onUpdateQuantity(Math.max(1, Number(e.target.value) || 1))}
                className="w-10 bg-transparent text-center font-mono text-xs text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <button
                type="button"
                aria-label={`Increase ${item.name} quantity`}
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                className="flex h-7 w-7 items-center justify-center font-mono text-xs text-ink transition-colors hover:text-signal"
              >
                +
              </button>
            </div>
            <span className="font-mono text-sm font-semibold text-ink">
              RM {(item.dailyRate * item.quantity).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {included.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowIncluded((v) => !v)}
            aria-expanded={showIncluded}
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ash transition-colors hover:text-ink"
          >
            What&apos;s Included
            <span className={`transition-transform duration-200 ${showIncluded ? "rotate-180" : ""}`}>
              ⌄
            </span>
          </button>
          {showIncluded && (
            <ul className="mt-3 flex flex-col gap-2 pl-1">
              {included.map((line) => (
                <li key={line} className="flex items-start gap-2 text-xs text-ash">
                  <span className="mt-0.5 text-ink">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        required={required}
        value={value}
        onChange={onChange}
        className="w-full rounded border border-ash/40 bg-transparent px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink"
      />
    </label>
  );
}

/** 3-step quote flow: step 1 done, step 2 (enquiry details) current; on the success page all three are done. */
function QuoteSteps({ complete = false }: { complete?: boolean }) {
  const steps = [
    { n: "01", label: "Review Order", state: "done" },
    { n: "02", label: "Enquiry Details", state: complete ? "done" : "current" },
    { n: "03", label: "Submit Request", state: complete ? "done" : "upcoming" },
  ] as const;

  return (
    <ol className="mb-10 flex" aria-label="Quote progress">
      {steps.map((step, i) => (
        <li
          key={step.n}
          aria-current={step.state === "current" ? "step" : undefined}
          className="relative flex flex-1 flex-col items-center text-center"
        >
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={`absolute left-1/2 top-5 h-px w-full md:top-[22px] ${
                step.state === "done" ? "bg-ink" : "bg-ash/30"
              }`}
            />
          )}
          <span
            className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full md:h-11 md:w-11 ${
              step.state === "current"
                ? "bg-signal text-ink"
                : step.state === "done"
                  ? "bg-ink text-white"
                  : "bg-smoke text-ink/60"
            }`}
          >
            {step.state === "done" ? <StepCheckIcon /> : i === 1 ? <StepCalendarIcon /> : <StepSendIcon />}
          </span>
          <span className="mt-2 font-mono text-sm text-ink/70">{step.n}</span>
          <span
            className={`mt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] md:text-xs ${
              step.state === "upcoming" ? "text-ash" : "font-semibold text-ink"
            }`}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function StepCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function StepCalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

function StepSendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 3L10 14" />
      <path d="M21 3l-7 18-4-7-7-4 18-7z" />
    </svg>
  );
}
