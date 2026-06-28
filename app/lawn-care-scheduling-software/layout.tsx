import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lawn Care Scheduling Software | SprayBossPro',
  description: 'Schedule recurring lawn treatments, build sq ft routes by map, dispatch technicians, and automate customer alerts. 14-day free trial, no credit card.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}