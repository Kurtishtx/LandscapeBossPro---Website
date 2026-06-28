import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LandscapeBossPro vs RealGreen | LandscapeBossPro',
  description: 'LandscapeBossPro vs RealGreen: modern routing, circle-map dispatch, and chemical compliance logs — without the legacy software learning curve. $129/month flat.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
