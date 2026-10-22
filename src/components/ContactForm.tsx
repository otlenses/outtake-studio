"use client";

import { useState, type FormEvent } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { WHATSAPP_NUMBER } from "@/lib/data";
import { submitEnquiry } from "@/lib/server/actions";
import ScrollReveal from "./ScrollReveal";
import SuccessCheck from "./SuccessCheck";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  enquiry: string;
};

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  enquiry: "",
};

const CONTACT_EMAIL = "ot.studio26@gmail.com";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fullName = `${form.firstName} ${form.lastName}`.trim();

    // Save a durable copy so the enquiry is never lost even if the customer's
    // mail client doesn't open or they never send the email.
    submitEnquiry({
      name: fullName,
      email: form.email.trim(),
      phone: form.phone.trim(),
      message: form.enquiry,
    }).catch((err) => console.error("Failed to record enquiry", err));

    const subject = `Enquiry from ${fullName}`;
    const body = [
      `Name: ${fullName}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone}`,
      "",
      form.enquiry,
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    setSubmitted(true);
    setForm(EMPTY_FORM);
  };

  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] py-16 md:py-24">
      <ScrollReveal className="mx-auto max-w-xl">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <h1 className="page-title font-display text-3xl font-black tracking-tight md:text-4xl">
          Leave Us A Message
        </h1>
        <p className="mt-4 text-sm text-ash">
          Tell us about your shoot or the gear you need — we&apos;ll get back to you
          with availability and pricing.
        </p>

        {submitted ? (
          <div className="mt-10 border border-ash/30 bg-white px-6 py-10 text-center">
            <SuccessCheck />
            <p className="mt-5 font-display text-xl font-black tracking-tight">
              Message Sent
            </p>
            <p className="mt-3 text-sm text-ash">
              Thanks for reaching out — our team will get back to you shortly.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-ink underline underline-offset-2 transition-colors hover:text-signal"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-7">
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field
                label="First Name"
                name="firstName"
                value={form.firstName}
                onChange={update("firstName")}
              />
              <Field
                label="Last Name"
                name="lastName"
                value={form.lastName}
                onChange={update("lastName")}
              />
            </div>

            <Field
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={update("email")}
            />

            <Field
              label="Phone No."
              name="phone"
              type="tel"
              value={form.phone}
              onChange={update("phone")}
            />

            <Field
              label="Enquiry"
              name="enquiry"
              as="textarea"
              rows={5}
              value={form.enquiry}
              onChange={update("enquiry")}
            />

            <button
              type="submit"
              className="mt-3 flex items-center justify-center rounded-full bg-signal px-8 py-4 font-mono text-sm font-semibold tracking-[0.02em] text-ink transition-transform hover:scale-[1.02]"
            >
              Submit
            </button>
          </form>
        )}

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ash/25 pt-8 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-xs font-semibold tracking-[0.04em] text-ink">
              Reach Out To Us At WhatsApp
            </p>
            <p className="mt-1 text-sm text-ash">
              Prefer to chat? Message us directly and we&apos;ll reply as soon as we can.
            </p>
          </div>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-transform hover:scale-[1.02]"
          >
            <WhatsAppIcon />
            WhatsApp Us
          </a>
        </div>
      </ScrollReveal>
    </section>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.83 14.16c-.25.7-1.24 1.28-2.02 1.44-.54.11-1.24.2-3.62-.78-3.04-1.26-5-4.35-5.15-4.55-.15-.2-1.23-1.64-1.23-3.13s.77-2.22 1.05-2.52c.27-.3.6-.37.8-.37.2 0 .4.002.57.01.18.008.43-.07.67.51.25.6.85 2.08.92 2.23.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.77 1.27 1.66 2.06 1.14 1.02 2.1 1.34 2.4 1.49.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.75.82 2.05.97.3.15.5.22.57.35.08.13.08.72-.17 1.42Z" />
    </svg>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  as = "input",
  rows,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
}) {
  const sharedClassName =
    "w-full resize-none rounded border border-ash/40 bg-transparent px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink";

  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-ink/70">
        {label} <span className="text-signal">*</span>
      </span>
      {as === "textarea" ? (
        <textarea
          name={name}
          required
          rows={rows}
          value={value}
          onChange={onChange}
          className={sharedClassName}
        />
      ) : (
        <input
          type={type}
          name={name}
          required
          value={value}
          onChange={onChange}
          className={sharedClassName}
        />
      )}
    </label>
  );
}
