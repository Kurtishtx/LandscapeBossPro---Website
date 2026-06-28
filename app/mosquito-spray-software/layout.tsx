import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mosquito Spray Software | SprayBossPro',
  description: 'Manage 21-day barrier spray intervals, build circle-map routes by sq ft, dispatch technicians, and automate re-entry SMS. Purpose-built for mosquito spray.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}