import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosquito Control Software | SprayBossPro',
  description: 'Mosquito control scheduling with 21-day auto-intervals, waiting list routing, chemical compliance logs, and automated SMS alerts. 14-day free trial.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}