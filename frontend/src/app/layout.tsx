import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traya ScalpScan",
  description: "Track your scalp health progress with Traya"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
