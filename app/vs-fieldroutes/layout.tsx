import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SprayBossPro vs FieldRoutes | SprayBossPro',
  description: 'SprayBossPro vs FieldRoutes: spray-route-native scheduling, flat pricing, and faster setup without enterprise overhead. Built for smaller spray businesses.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}