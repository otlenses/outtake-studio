import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions | Out Take Studio" };

const SECTIONS: LegalSection[] = [
  {
    title: "About these terms",
    body: [
      "These terms apply to your use of the Out Take Studio website and to the quotations, rentals, productions and merchandise orders you make through it. By using the site or sending a request, you agree to them.",
    ],
  },
  {
    title: "Quote requests",
    body: [
      "Submitting a quote request is an enquiry, not a booking. Prices and rates shown on the website are estimates and may change depending on rental dates, duration, availability and project scope.",
      "A booking is only confirmed when we send you a written confirmation and any required deposit or payment has been received.",
    ],
  },
  {
    title: "Equipment rental",
    body: [
      "Equipment is subject to availability on your requested dates. You are responsible for rented equipment from the time you collect it until it is returned to us.",
      "You must return equipment on time and in the condition you received it, apart from normal wear. You are responsible for loss, theft or damage during the rental period, and we may charge for repair or replacement. Late returns may be charged at the daily rate.",
      "The detailed rental terms, such as deposit, insurance and cancellation, will be set out in your written quotation or rental agreement.",
    ],
  },
  {
    title: "Production services",
    body: [
      "Scope, schedule, deliverables and fees for production work are agreed in a separate written quotation or agreement. Unless that agreement says otherwise, you keep the rights to the final delivered work once it is paid for in full, and we may show it in our portfolio.",
    ],
  },
  {
    title: "Merchandise",
    body: [
      "Merchandise orders are confirmed once we have received and verified your payment. Prices are in Malaysian Ringgit (RM). If an item is unavailable, we will contact you to offer an alternative or a refund.",
      "Please check your details before ordering. Contact us promptly if there is a problem with your order and we will do our best to put it right.",
    ],
  },
  {
    title: "Website content",
    body: [
      "All photos, videos, text, logos and designs on this website belong to Out Take Studio or its clients and may not be copied or used without our permission.",
    ],
  },
  {
    title: "Liability",
    body: [
      "We take care to keep the website accurate and available, but we do not guarantee that it will always be error-free or uninterrupted. To the extent the law allows, we are not liable for indirect or consequential loss arising from your use of the website.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These terms are governed by the laws of Malaysia, and any dispute is subject to the courts of Malaysia.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about these terms? Email ot.studio26@gmail.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="27 October 2026"
      intro="Please read these terms before sending a quote request or placing an order with Out Take Studio."
      sections={SECTIONS}
    />
  );
}
