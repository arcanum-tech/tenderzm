import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TenderZM — Zambia Government & Private Tenders",
  description: "Find and track government and private tenders in Zambia. Never miss a bidding opportunity.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
