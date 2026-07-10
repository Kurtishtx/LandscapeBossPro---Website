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

  // Inject BlogPosting + BreadcrumbList JSON-LD built from this post's own H1,
  // meta description, and URL. Google reads dynamically-injected structured data,
  // so one shell covers every blog post on the site without per-post edits.
  useEffect(() => {
    const ID = 'blogposting-ld';
    if (document.getElementById(ID)) return;
    const origin = window.location.origin;
    const url = origin + window.location.pathname;
    const h1 = document.querySelector('.blog-article h1');
    const headline = (h1?.textContent || document.title.replace(/\s*\|.*$/, '')).trim();
    const brand = (document.title.match(/\|\s*(.+?)\s*(\||$)/)?.[1] || window.location.hostname).trim();
    const descEl = document.querySelector('meta[name="description"]');
    const description = (descEl?.getAttribute('content') || '').trim();
    const ld = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BlogPosting',
          headline,
          description,
          author: { '@type': 'Organization', name: brand, url: origin },
          publisher: { '@type': 'Organization', name: brand, logo: { '@type': 'ImageObject', url: origin + '/icon.svg' } },
          mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Blog', item: origin + '/blogs' },
            { '@type': 'ListItem', position: 2, name: headline, item: url },
          ],
        },
      ],
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id = ID;
    s.textContent = JSON.stringify(ld);
    document.head.appendChild(s);
    return () => { document.getElementById(ID)?.remove(); };
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
