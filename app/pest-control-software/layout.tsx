import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pest Control Software | SprayBossPro',
  description: 'Pest control software for recurring programs, route scheduling, chemical compliance logs, and automated customer SMS. Built for spray businesses. $129/month.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
