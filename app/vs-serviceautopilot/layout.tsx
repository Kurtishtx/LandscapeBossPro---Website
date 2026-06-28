import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SprayBossPro vs Service Autopilot | SprayBossPro',
  description: 'SprayBossPro vs Service Autopilot: spray-specific route scheduling, flat pricing, and faster setup for lawn care and pest control businesses. Compare features.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}