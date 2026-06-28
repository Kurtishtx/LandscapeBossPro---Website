import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SprayBossPro vs LawnPro | SprayBossPro',
  description: 'SprayBossPro vs LawnPro: circle-map routing, waiting list dispatch, sq ft pricing, and automated SMS for spray businesses. Feature-by-feature comparison.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}