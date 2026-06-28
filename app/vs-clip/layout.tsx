import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SprayBossPro vs CLIP Lawn Software | SprayBossPro',
  description: 'SprayBossPro vs CLIP Lawn Software: modern web-based routing, circle-map dispatch, automated SMS, and spray-native scheduling at flat $129/month.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
