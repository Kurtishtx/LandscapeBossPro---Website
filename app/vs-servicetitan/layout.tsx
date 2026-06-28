import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SprayBossPro vs ServiceTitan | SprayBossPro',
  description: 'SprayBossPro vs ServiceTitan: lighter pricing, faster setup, and spray-route-native scheduling built for lawn care and pest control — not enterprise HVAC.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}