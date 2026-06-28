import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LandscapeBossPro vs ServiceTitan | LandscapeBossPro',
  description: 'LandscapeBossPro vs ServiceTitan: lighter pricing, faster setup, and spray-route-native scheduling built for lawn care and pest control — not enterprise HVAC.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}