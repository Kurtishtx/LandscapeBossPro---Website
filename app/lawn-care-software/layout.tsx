import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lawn Care Software | LandscapeBossPro',
  description: 'Lawn care software with sq ft pricing, recurring program scheduling, circle-map routing, and automated SMS. Built for routes. $129/month, all features.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
