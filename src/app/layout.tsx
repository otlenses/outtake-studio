import type { Metadata } from "next";
import { Jost, Nunito_Sans } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import "./globals.css";

// Free, openly licensed faces (Jost for titles, Nunito Sans for everything else), downloaded at build time and served from this site.
const jost = Jost({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-jost", display: "swap" });

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-nunito",
  display: "swap",
});

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
    <html lang="en" className={`h-full ${jost.variable} ${nunito.variable}`}>
      <body className="min-h-full flex flex-col bg-paper text-ink font-body">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
