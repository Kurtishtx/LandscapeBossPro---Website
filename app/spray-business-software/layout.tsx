import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spray Business Software | LandscapeBossPro',
  description: 'Scheduling, dispatch, circle-map routing, SMS alerts, and chemical logs for lawn care, mosquito, pest, and weed control. $129/month, everything included.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
