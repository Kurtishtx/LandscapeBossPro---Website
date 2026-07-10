import type { Metadata } from "next";
import Script from "next/script";
import Footer from "./components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: 'LandscapeBossPro | Landscaping Business Software',
  description: "LandscapeBossPro is landscaping business software — job scheduling, estimates, crew dispatch, recurring maintenance, automated SMS, and invoicing. $129/month, everything included.",
};


const structuredData = {"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://landscapebosspro.com/#organization","name":"LandscapeBossPro","url":"https://landscapebosspro.com","logo":"https://landscapebosspro.com/icon.svg","description":"Landscaping business software with job scheduling, estimates, crew dispatch, recurring maintenance, and invoicing."},{"@type":"WebSite","@id":"https://landscapebosspro.com/#website","url":"https://landscapebosspro.com","name":"LandscapeBossPro","publisher":{"@id":"https://landscapebosspro.com/#organization"}},{"@type":"SoftwareApplication","name":"LandscapeBossPro","applicationCategory":"BusinessApplication","operatingSystem":"Web, iOS, Android","description":"Landscaping business software with job scheduling, estimates, crew dispatch, recurring maintenance, and invoicing.","offers":{"@type":"Offer","price":"129","priceCurrency":"USD","description":"$129/month flat — everything included, 14-day free trial."},"publisher":{"@id":"https://landscapebosspro.com/#organization"}}]};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
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
