import type { Metadata } from "next";
import Script from "next/script";
import Footer from "./components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "LandscapeBossPro | Lawn Care & Pest Control Software",
  description: "LandscapeBossPro is premium lawn care and pest control software built by people who've run real routes. Circle a map area and instantly know sq ft, stops, and chemical needs. $129/month, everything included.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Footer />
        <Script
          src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
