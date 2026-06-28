import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pest Control Scheduling Software | SprayBossPro',
  description: 'Schedule quarterly, bi-monthly, and monthly pest control programs, dispatch technicians, and automate customer SMS — from one platform. 14-day free trial.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}