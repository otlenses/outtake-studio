"use client";

import { useRef, useState, useTransition } from "react";
import { formatDateTime } from "@/lib/format-date";
import Image from "next/image";
import { changeOrderStatusAction, updateOrderAction } from "@/lib/server/actions";
import type { OrderRequest, OrderStatus } from "@/lib/server/db";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from "@/lib/server/status-labels";
import SavedOverlay, { useSavedFlash } from "@/components/admin/SavedOverlay";
import { EditDetailsButton, StickyActionBar } from "@/components/admin/FormParts";
import StatusOrderPicker, { StatusChangeDialog } from "@/components/admin/StatusOrderPicker";
import UnsavedGuard from "@/components/admin/UnsavedGuard";
import OrderHistory from "@/components/admin/OrderHistory";

const STATUS_FLOW: OrderStatus[] = ["NEW", "CONFIRMED", "COMPLETED"];

function isBackward(from: OrderStatus, to: OrderStatus): boolean {
  if (to === "CANCELLED") return false;
  const fromIndex = STATUS_FLOW.indexOf(from);
  const toIndex = STATUS_FLOW.indexOf(to);
  return fromIndex !== -1 && toIndex !== -1 && toIndex < fromIndex;
}

function itemsTotal(order: OrderRequest): number {
  return order.items.reduce((sum, i) => sum + i.subtotal, 0);
}

export default function OrderDetailForm({ order }: { order: OrderRequest }) {
  const [saved, flashSaved] = useSavedFlash();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [history, setHistory] = useState(order.orderHistory);
  const [startDate, setStartDate] = useState(order.rentalStartDate);
  const [endDate, setEndDate] = useState(order.rentalEndDate);
  const [internalNotes, setInternalNotes] = useState(order.internalNotes);
  const [depositAmount, setDepositAmount] = useState(order.depositAmount?.toString() ?? "");
  const [depositReceived, setDepositReceived] = useState(order.depositReceived);
  const [balanceReceived, setBalanceReceived] = useState(order.balanceReceived);
  const [discount, setDiscount] = useState(order.discount ? order.discount.toString() : "");
  const [isPending, startTransition] = useTransition();
  const endDateRef = useRef<HTMLInputElement>(null);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus>(order.status);
  const [confirmingStatus, setConfirmingStatus] = useState(false);

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerName, setCustomerName] = useState(order.customerName);
  const [customerPhone, setCustomerPhone] = useState(order.customerPhone);
  const [customerEmail, setCustomerEmail] = useState(order.customerEmail);
  const [companyName, setCompanyName] = useState(order.companyName);

  // Last saved values, to know whether anything changed
  const [base, setBase] = useState({
    startDate: order.rentalStartDate,
    endDate: order.rentalEndDate,
    internalNotes: order.internalNotes,
    depositAmount: order.depositAmount?.toString() ?? "",
    depositReceived: order.depositReceived,
    balanceReceived: order.balanceReceived,
    discount: order.discount ? order.discount.toString() : "",
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    companyName: order.companyName,
  });
  const dirty =
    pendingStatus !== status ||
    startDate !== base.startDate ||
    endDate !== base.endDate ||
    internalNotes !== base.internalNotes ||
    depositAmount !== base.depositAmount ||
    depositReceived !== base.depositReceived ||
    balanceReceived !== base.balanceReceived ||
    discount !== base.discount ||
    customerName !== base.customerName ||
    customerPhone !== base.customerPhone ||
    customerEmail !== base.customerEmail ||
    companyName !== base.companyName;

  const subtotal = itemsTotal(order);
  const discountNumber = discount.trim() === "" ? 0 : Math.max(0, Number(discount) || 0);
  const finalAmount = Math.max(0, subtotal - discountNumber);
  const depositNumber = depositAmount.trim() === "" ? 0 : Number(depositAmount) || 0;
  const depositPaid = depositReceived ? depositNumber : 0;
  const balanceRemaining = Math.max(0, finalAmount - depositPaid);
  const balanceDue = balanceReceived ? 0 : balanceRemaining;

  // Save button: when the status was changed, ask for confirmation first.
  const onSaveClick = () => {
    if (pendingStatus !== status) setConfirmingStatus(true);
    else doSave();
  };

  const doSave = (statusNote?: string) => {
    startTransition(async () => {
      await updateOrderAction(order.id, {
        rentalStartDate: startDate,
        rentalEndDate: endDate,
        internalNotes,
        depositAmount: depositAmount.trim() === "" ? null : Number(depositAmount),
        depositReceived,
        balanceReceived,
        discount: discountNumber,
        customerName,
        customerPhone,
        customerEmail,
        companyName,
      });
      if (pendingStatus !== status) {
        const updated = await changeOrderStatusAction(order.id, pendingStatus, statusNote ?? "");
        if (updated) setHistory(updated.orderHistory);
        setStatus(pendingStatus);
      }
      setBase({
        startDate,
        endDate,
        internalNotes,
        depositAmount,
        depositReceived,
        balanceReceived,
        discount,
        customerName,
        customerPhone,
        customerEmail,
        companyName,
      });
      setConfirmingStatus(false);
      setIsEditingCustomer(false);
      flashSaved();
    });
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
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
            className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold tracking-[0.06em] ${ORDER_STATUS_STYLES[status]}`}
          >
            {ORDER_STATUS_LABELS[status]}
          </span>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Customer info</h2>
            {!isEditingCustomer && (
              <EditDetailsButton onClick={() => setIsEditingCustomer(true)} />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 rounded-xl bg-smoke/50 p-4 sm:grid-cols-2">
            {isEditingCustomer ? (
              <>
                <EditableField label="Customer name" value={customerName} onChange={setCustomerName} />
                <EditableField label="Phone" value={customerPhone} onChange={setCustomerPhone} />
                <EditableField label="Email" value={customerEmail} onChange={setCustomerEmail} type="email" />
                <EditableField label="Company" value={companyName} onChange={setCompanyName} />
              </>
            ) : (
              <>
                <Info label="Customer name" value={order.customerName} />
                <Info label="Phone" value={order.customerPhone} />
                <Info label="Email" value={order.customerEmail || "—"} />
                <Info label="Company" value={order.companyName || "—"} />
              </>
            )}
            <Info label="Date / time" value={formatDateTime(order.submittedAt)} />
            <Info label="Amount" value={`RM ${finalAmount.toFixed(2)}`} />
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
          <h2 className="mb-4 text-lg font-bold text-ink">Rental dates</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Rental start</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm text-ink/70">Rental end</span>
              <input
                ref={endDateRef}
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-ash/40 px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </label>
          </div>
        </section>

        <section className="border-t border-ash/20 pt-7">
          <h2 className="mb-4 text-lg font-bold text-ink">Status</h2>
          <StatusOrderPicker
            statuses={ORDER_STATUSES}
            labels={ORDER_STATUS_LABELS}
            current={status}
            selected={pendingStatus}
            dangerStatus="CANCELLED"
            isPending={isPending}
            onSelect={setPendingStatus}
          />
        </section>

        <section className="border-t border-ash/20 pt-7">
          <h2 className="mb-4 text-lg font-bold text-ink">Notes</h2>
          {order.customerNotes && (
            <div className="mb-4">
              <span className="text-sm text-ink/70">Customer&apos;s original notes</span>
              <p className="mt-1.5 whitespace-pre-wrap rounded border border-ash/20 bg-paper p-3 text-sm text-ink">
                {order.customerNotes}
              </p>
            </div>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-sm text-ink/70">
              Internal notes (what was finally agreed on WhatsApp, etc.)
            </span>
            <textarea
              rows={4}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              className="resize-none rounded border border-ash/40 px-3 py-2.5 text-sm outline-none focus:border-ink"
            />
          </label>
        </section>

        <StickyActionBar
          cancelHref="/admin/orders"
          saveLabel="Save changes"
          isPending={isPending}
          canSave={dirty}
          onSave={onSaveClick}
        />
      </div>

      {confirmingStatus && (
        <StatusChangeDialog
          from={ORDER_STATUS_LABELS[status]}
          to={ORDER_STATUS_LABELS[pendingStatus]}
          requiresNote={pendingStatus === "CANCELLED" || isBackward(status, pendingStatus)}
          isPending={isPending}
          onConfirm={(note) => doSave(note)}
          onCancel={() => setConfirmingStatus(false)}
        />
      )}

      <UnsavedGuard dirty={dirty} />
      <SavedOverlay show={saved} />

      {/* Right: line items + payment summary + order history */}
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm shadow-ink/5">
          <h2 className="mb-4 text-lg font-bold text-ink">Line items</h2>
          <ul className="flex flex-col divide-y divide-ash/15 border-t border-b border-ash/15">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-smoke">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-ash">
                      <PlaceholderIcon />
                    </span>
                  )}
                </div>
                <div className="flex flex-1 items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink">{item.productName}</div>
                    <div className="text-sm text-ash">
                      RM {item.unitPrice.toFixed(2)} × {item.quantity}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-ink">RM {item.subtotal.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm shadow-ink/5">
          <h2 className="mb-4 text-lg font-bold text-ink">Payment summary</h2>

          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink/70">Subtotal</span>
              <span className="font-medium text-ink">RM {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-ink/70">Discount (RM)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-28 rounded border border-ash/40 px-2 py-1.5 text-right text-sm outline-none focus:border-ink"
              />
            </div>
            <div className="flex items-center justify-between border-t border-ash/15 pt-3">
              <span className="text-base font-bold text-ink">Total</span>
              <span className="text-base font-bold text-ink">RM {finalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-ash/15 pt-5 text-sm">
            <label className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-ink/70">
                <input
                  type="checkbox"
                  checked={depositReceived}
                  onChange={(e) => setDepositReceived(e.target.checked)}
                />
                Deposit received (1st payment)
              </span>
              {depositReceived && (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="RM 0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-28 rounded border border-ash/40 px-2 py-1.5 text-right text-sm outline-none focus:border-ink"
                />
              )}
            </label>

            <label className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-ink/70">
                <input
                  type="checkbox"
                  checked={balanceReceived}
                  onChange={(e) => setBalanceReceived(e.target.checked)}
                />
                Balance received (2nd payment)
              </span>
              {!balanceReceived && depositReceived && (
                <span className="text-ink/50">RM {balanceRemaining.toFixed(2)} left</span>
              )}
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-ash/15 pt-5">
            <span className="text-base font-bold text-ink">Balance due</span>
            {balanceReceived ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Paid in full
              </span>
            ) : (
              <span className="font-display text-2xl font-black text-ink">RM {balanceDue.toFixed(2)}</span>
            )}
          </div>
        </div>

        <OrderHistory history={history} />
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

function PlaceholderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="m21 15-5-5-11 11" />
    </svg>
  );
}
