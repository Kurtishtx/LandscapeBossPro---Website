import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LandscapeBossPro vs LawnPro | LandscapeBossPro',
  description: 'LandscapeBossPro vs LawnPro: circle-map routing, waiting list dispatch, sq ft pricing, and automated SMS for spray businesses. Feature-by-feature comparison.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}