import type { Metadata } from "next";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Out Take Studio — Production & Camera Rental",
  description:
    "Out Take Studio is a Kuala Lumpur-based production house and camera rental house: cinematography, photography, and full-crew production, plus a professional gear rental catalogue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/hcw5lmv.css" />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink font-body">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
