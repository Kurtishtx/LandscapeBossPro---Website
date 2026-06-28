import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weed Control Software | SprayBossPro',
  description: 'Schedule pre-emergent and post-emergent rounds, log chemical applications with EPA numbers, build sq ft routes, and send automated alerts. 14-day free trial.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}