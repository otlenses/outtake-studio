import type { Metadata } from "next";
import LegalPage, { type LegalSection } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy | Out Take Studio" };

const SECTIONS: LegalSection[] = [
  {
    title: "Who we are",
    body: [
      "Out Take Studio is a production house and camera rental house based in Petaling Jaya, Selangor, Malaysia. In this policy, “we”, “us” and “our” mean Out Take Studio. You can reach us at ot.studio26@gmail.com.",
    ],
  },
  {
    title: "What we collect",
    body: [
      "When you send a quote request, contact us, or buy merchandise, we collect the details you give us: your name, email address, phone number, company, delivery address, project details, rental dates, and any message you write.",
      "If you pay by bank transfer, we also receive the payment slip image you upload.",
      "Our website stores a small amount of information in your browser, such as the items in your quote cart, so they are still there when you come back. We do not use advertising or tracking cookies.",
    ],
  },
  {
    title: "How we use it",
    body: [
      "We use your details to reply to your enquiry, prepare quotations, arrange rentals and productions, process and deliver merchandise orders, confirm payments, and keep records of our business.",
      "We do not sell your personal data and we do not use it for marketing unless you have asked us to.",
    ],
  },
  {
    title: "Who we share it with",
    body: [
      "We only share your data with the service providers that help us run the website and the business: our hosting provider, our database and file storage provider, and our email delivery provider. They process data on our behalf and only for that purpose.",
      "We may also disclose data where the law requires it, or to protect our rights.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "We keep enquiry, quotation and order records for as long as we need them to serve you and to meet our accounting and legal obligations. After that, we delete or anonymise them.",
    ],
  },
  {
    title: "Security",
    body: [
      "Access to our admin system is restricted to authorised staff and protected by a password. Payment slips are stored privately and are only visible to our staff. No system is perfectly secure, but we take reasonable steps to protect your data.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "Under the Personal Data Protection Act 2010 of Malaysia, you may ask to access or correct the personal data we hold about you, or ask us to stop using it. To do so, email ot.studio26@gmail.com. If you choose not to give us certain details, we may not be able to respond to your request.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "We may update this policy from time to time. The date at the top of this page shows when it was last changed.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="27 October 2026"
      intro="This policy explains what personal data Out Take Studio collects through this website, why we collect it, and how we look after it."
      sections={SECTIONS}
    />
  );
}
