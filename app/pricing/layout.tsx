import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | SprayBossPro',
  description: '$129/month for everything. No per-user fees, no add-ons, no setup costs. Full access to every feature including routes, SMS alerts, and compliance logs.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
