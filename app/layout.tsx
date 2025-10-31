import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SignalNotification } from "@/components/SignalNotification";
import { SignalCaptureWorker } from "@/components/SignalCaptureWorker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Crypto Chart Viewer",
  description: "Modern cryptocurrency charting application with real-time data from Binance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <SignalNotification />
        <SignalCaptureWorker />
        {children}
      </body>
    </html>
  );
}
