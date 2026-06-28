'use client';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import SignupModal from '../components/SignupModal';

export default function BlogShell({ children }: { children: React.ReactNode }) {
  const handleTrialClick = (el: HTMLElement) => { (window as any).__openSignup?.(1, el); };
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      // in-article "Start Free Trial" CTAs point at the app; open the popup instead
      if (a.closest('.blog-main') && /my\.[a-z]+bosspro\.com/i.test(href)) {
        e.preventDefault();
        (window as any).__openSignup?.(1, a);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <>
      <Navbar onTrialClick={handleTrialClick} />
      <main className="blog-main">
        {children}
      </main>
      <SignupModal />
    </>
  );
}
