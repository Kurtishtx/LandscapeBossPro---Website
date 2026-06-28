import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SprayBossPro vs Spraye | SprayBossPro',
  description: 'SprayBossPro vs Spraye: circle-map routing, sq ft pricing, waiting list dispatch, and automated SMS alerts. See how they compare for spray businesses.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}