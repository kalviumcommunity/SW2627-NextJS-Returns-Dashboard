import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Returns Dashboard | Amazon.in Seller Central",
  description: "Review return requests, approve or reject with a reason, and let the SLA engine auto-approve anything left unattended.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased text-gray-900">{children}</body>
    </html>
  );
}
