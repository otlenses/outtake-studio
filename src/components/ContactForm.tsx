"use client";

import { useState, type FormEvent } from "react";
import ScrollReveal from "./ScrollReveal";

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

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setForm(EMPTY_FORM);
  };

  return (
    <section className="bg-paper px-[max(1.5rem,4vw)] py-16 md:py-24">
      <ScrollReveal className="mx-auto max-w-xl">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
          Contact
        </p>
        <h1 className="font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          Leave Us A Message
        </h1>
        <p className="mt-4 text-sm text-ash">
          Tell us about your shoot or the gear you need — we&apos;ll get back to you
          with availability and pricing.
        </p>

        {submitted ? (
          <div className="mt-10 border border-ash/30 bg-white px-6 py-10 text-center">
            <p className="font-display text-xl font-black uppercase tracking-tight">
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
              className="mt-3 flex items-center justify-center rounded-full bg-signal px-8 py-4 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink transition-transform hover:scale-[1.02]"
            >
              Submit
            </button>
          </form>
        )}
      </ScrollReveal>
    </section>
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
    "w-full resize-none border-0 border-b border-ash/40 bg-transparent py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink";

  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
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
