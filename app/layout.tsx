import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FeedDoctor – Fix Google Shopping Feeds in 24h",
  description:
    "Instantly fix your Google Merchant Center disapprovals. Upload your feed, get a clean CSV ready for upload within 24 hours.",
  openGraph: {
    title: "FeedDoctor",
    description: "Fix Google Shopping disapprovals fast.",
    url: "https://feeddoctor.vercel.app",
    siteName: "FeedDoctor",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <main>{children}</main>
      </body>
    </html>
  );
}
