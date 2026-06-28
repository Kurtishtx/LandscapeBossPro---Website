import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LandscapeBossPro vs Jobber | LandscapeBossPro',
  description: 'LandscapeBossPro vs Jobber: spray-native scheduling, flat $129/month pricing, circle-map routing, and chemical compliance logs. Feature-by-feature comparison.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
