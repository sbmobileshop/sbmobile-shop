import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "SB Mobile Shop — মোবাইল ও গ্যাজেট শপ",
  description: "SB Mobile Shop — বাংলাদেশের সেরা মোবাইল, গ্যাজেট এবং ডিজিটাল প্রোডাক্ট শপ। সেরা দামে অরিজিনাল পণ্য কিনুন।",
  keywords: ["mobile shop", "gadget", "accessories", "online shop", "bangladesh"],
  authors: [{ name: "SB Mobile Shop" }],
  openGraph: {
    title: "SB Mobile Shop — মোবাইল ও গ্যাজেট শপ",
    description: "বাংলাদেশের সেরা মোবাইল, গ্যাজেট এবং ডিজিটাল প্রোডাক্ট শপ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background font-english antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
