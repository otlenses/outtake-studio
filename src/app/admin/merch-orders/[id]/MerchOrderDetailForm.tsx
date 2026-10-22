"use client";

import { useState, useTransition } from "react";
import { formatDateTime } from "@/lib/format-date";
import Image from "next/image";
import Link from "next/link";
import { changeMerchOrderStatusAction, updateMerchOrderAction, uploadMerchPaymentSlipAction } from "@/lib/server/actions";
import SingleImageField from "@/components/admin/SingleImageField";
import type { MerchOrder, MerchOrderStatus } from "@/lib/server/db";
import {
  MERCH_ORDER_STATUSES,
  MERCH_ORDER_STATUS_LABELS,
  MERCH_ORDER_STATUS_STYLES,
} from "@/lib/server/status-labels";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";
import { EditDetailsButton, StickyActionBar } from "@/components/admin/FormParts";
import StatusOrderPicker, { StatusChangeDialog } from "@/components/admin/StatusOrderPicker";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import OrderHistory from "@/components/admin/OrderHistory";

const PAYMENT_METHOD_LABELS: Record<MerchOrder["paymentMethod"], string> = {
  BANK_TRANSFER: "Bank transfer",
  QR_PAYMENT: "QR payment",
};

const STATUS_FLOW: MerchOrderStatus[] = ["NEW", "PAYMENT_VERIFIED", "FULFILLED"];

function isBackward(from: MerchOrderStatus, to: MerchOrderStatus): boolean {
  if (to === "CANCELLED") return false;
  const fromIndex = STATUS_FLOW.indexOf(from);
  const toIndex = STATUS_FLOW.indexOf(to);
  return fromIndex !== -1 && toIndex !== -1 && toIndex < fromIndex;
}

export default function MerchOrderDetailForm({ order }: { order: MerchOrder }) {
  const [saved, flashSaved] = useSavedFlash();
  const [slipUrl, setSlipUrl] = useState<string | null>(order.paymentSlipUrl);
  const [slipError, setSlipError] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipEmpty, setSlipEmpty] = useState(!order.paymentSlipUrl);
  const slipRemoved = slipEmpty && !!slipUrl;
  const [status, setStatus] = useState<MerchOrderStatus>(order.status);
  const [history, setHistory] = useState(order.orderHistory);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes);
  const [isPending, startTransition] = useTransition();
  const [pendingStatus, setPendingStatus] = useState<MerchOrderStatus>(order.status);
  const [confirmingStatus, setConfirmingStatus] = useState(false);

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone);
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail);
  const [companyName, setCompanyName] = useState(order.companyName);

  const [base, setBase] = useState({
    internalNotes: order.internalNotes,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    companyName: order.companyName,
  });
  const dirty =
    slipFile !== null ||
    slipRemoved ||
    pendingStatus !== status ||
    internalNotes !== base.internalNotes ||
    customerName !== base.customerName ||
    customerPhone !== base.customerPhone ||
    customerEmail !== base.customerEmail ||
    companyName !== base.companyName;

  // Save button: when the status was changed, ask for confirmation first.
  const onSaveClick = () => {
    if (pendingStatus !== status) setConfirmingStatus(true);
    else doSave();
  };

  const doSave = (statusNote?: string) => {
    startTransition(async () => {
      setSlipError(null);
      if (slipFile) {
        const fd = new FormData();
        fd.set("paymentSlip", slipFile);
        const up = await uploadMerchPaymentSlipAction(order.id, fd);
        if (!up.ok) {
          setSlipError(up.error ?? "Upload failed.");
          setConfirmingStatus(false);
          return;
        }
        setSlipUrl(up.url ?? null);
        setSlipFile(null);
      } else if (slipRemoved) {
        await updateMerchOrderAction(order.id, { paymentSlipUrl: null });
        setSlipUrl(null);
      }
      await updateMerchOrderAction(order.id, {
        internalNotes,
        customerName,
        customerPhone,
        customerEmail,
        companyName,
      });
      if (pendingStatus !== status) {
        const updated = await changeMerchOrderStatusAction(order.id, pendingStatus, statusNote ?? "");
        if (updated) setHistory(updated.orderHistory);
        setStatus(pendingStatus);
      }
      setBase({ internalNotes, customerName, customerPhone, customerEmail, companyName });
      setConfirmingStatus(false);
      setIsEditingCustomer(false);
      flashSaved();
    });
  };

  const cancelCustomerEdit = () => {
    setCustomerName(order.customerName);
    setCustomerPhone(order.customerPhone);
    setCustomerEmail(order.customerEmail);
    setCompanyName(order.companyName);
    setIsEditingCustomer(false);
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
      {/* Left: editable admin fields */}
      <div className="flex flex-col gap-8 rounded-2xl bg-white px-6 pt-6 shadow-sm shadow-ink/5">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-xl font-black tracking-tight">{order.orderNumber}</h1>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] ${MERCH_ORDER_STATUS_STYLES[status]}`}
          >
            {MERCH_ORDER_STATUS_LABELS[status]}
          </span>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Order info</h2>
            {!isEditingCustomer && (
              <EditDetailsButton onClick={() => setIsEditingCustomer(true)} />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl bg-smoke/50 p-4 sm:grid-cols-2">
            {isEditingCustomer ? (
              <>
                <EditableField label="Full name" value={customerName} onChange={setCustomerName} />
                <EditableField label="WhatsApp phone" value={customerPhone} onChange={setCustomerPhone} />
                <EditableField label="Email" value={customerEmail} onChange={setCustomerEmail} type="email" />
                <EditableField label="Company" value={companyName} onChange={setCompanyName} />
              </>
            ) : (
              <>
                <Info label="Full name" value={order.customerName} />
                <Info label="WhatsApp phone" value={order.customerPhone} />
                <Info label="Email" value={order.customerEmail || "—"} />
                <Info label="Company" value={order.companyName || "—"} />
              </>
            )}
            <Info label="Date / time" value={formatDateTime(order.submittedAt)} />
            <Info label="Amount" value={`RM ${order.subtotal.toFixed(2)}`} />
          </div>

          {isEditingCustomer && (
            <button
              type="button"
              onClick={cancelCustomerEdit}
              className="mt-3 text-sm text-ash underline underline-offset-2 hover:text-ink"
            >
              Cancel edit
            </button>
          )}
        </section>

        <section className="border-t border-ash/20 pt-7">
          <h2 className="mb-4 text-lg font-bold text-ink">Payment</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info label="Payment method" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
            <div>
              <SingleImageField
                name="paymentSlip"
                label="Payment slip"
                initialUrl={slipUrl}
                hint=""
                onChange={({ file, empty }) => {
                  setSlipFile(file);
                  setSlipEmpty(empty);
                }}
              />
              {slipError && <p className="mt-1 text-xs text-red-600">{slipError}</p>}
            </div>
          </div>
        </section>

        <section className="border-t border-ash/20 pt-7">
          <h2 className="mb-4 text-lg font-bold text-ink">Status</h2>
          <StatusOrderPicker
            statuses={MERCH_ORDER_STATUSES}
            labels={MERCH_ORDER_STATUS_LABELS}
            current={status}
            selected={pendingStatus}
            dangerStatus="CANCELLED"
            isPending={isPending}
            onSelect={setPendingStatus}
          />
        </section>

        <section className="border-t border-ash/20 pt-7">
          <h2 className="mb-4 text-lg font-bold text-ink">Notes</h2>
          {order.notes && (
            <div className="mb-4">
              <span className="text-sm text-ink/70">Customer&apos;s notes</span>
              <p className="mt-1.5 whitespace-pre-wrap rounded border border-ash/20 bg-paper p-3 text-sm text-ink">
                {order.notes}
              </p>
            </div>
          )}
          <label className="flex flex-col gap-2">
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
          cancelHref="/admin/merch-orders"
          saveLabel="Save changes"
          isPending={isPending}
          canSave={dirty}
          onSave={onSaveClick}
        />
      </div>

      {confirmingStatus && (
        <StatusChangeDialog
          from={MERCH_ORDER_STATUS_LABELS[status]}
          to={MERCH_ORDER_STATUS_LABELS[pendingStatus]}
          requiresNote={pendingStatus === "CANCELLED" || isBackward(status, pendingStatus)}
          isPending={isPending}
          onConfirm={(note) => doSave(note)}
          onCancel={() => setConfirmingStatus(false)}
        />
      )}

      <UnsavedGuard dirty={dirty} />
      <SavedOverlay show={saved} />

      {/* Right: item + order history */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm shadow-ink/5">
          <h2 className="mb-4 text-lg font-bold text-ink">Item</h2>
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-smoke">
              {order.productImage ? (
                <Image src={order.productImage} alt={order.productName} fill className="object-cover" />
              ) : null}
            </div>
            <div className="flex flex-1 items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-ink">{order.productName}</div>
                <div className="text-sm text-ash">
                  Size {order.size} · RM {order.unitPrice.toFixed(2)} × {order.quantity}
                </div>
              </div>
              <span className="text-sm font-semibold text-ink">RM {order.subtotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-ash/15 pt-4 text-sm">
            <span className="text-ash">Total</span>
            <span className="font-semibold text-ink">RM {order.subtotal.toFixed(2)}</span>
          </div>
        </div>

        <OrderHistory history={history} />

        <Link
          href="/admin/settings?tab=payment"
          className="text-center text-sm text-ash underline underline-offset-2 hover:text-ink"
        >
          Manage payment settings
        </Link>
      </div>
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

function EditableField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-ink/70">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
      />
    </label>
  );
}
