import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LandscapeBossPro vs Spraye | LandscapeBossPro',
  description: 'LandscapeBossPro vs Spraye: circle-map routing, sq ft pricing, waiting list dispatch, and automated SMS alerts. See how they compare for spray businesses.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}