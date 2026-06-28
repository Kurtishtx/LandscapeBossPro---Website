import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fertilizer Software | SprayBossPro',
  description: 'Track fertilizer rounds, log application rates and EPA registration numbers, build sq ft routes, and automate customer alerts. Built for fertilizer programs.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}