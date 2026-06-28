'use client';
import { useState } from 'react';

const solutions = [
  { label: 'Lawn Care Software',           href: '/lawn-care-software' },
  { label: 'Lawn Care Scheduling',         href: '/lawn-care-scheduling-software' },
  { label: 'Mosquito Control Software',    href: '/mosquito-control-software' },
  { label: 'Mosquito Spray Software',      href: '/mosquito-spray-software' },
  { label: 'Pest Control Software',        href: '/pest-control-software' },
  { label: 'Pest Control Scheduling',      href: '/pest-control-scheduling-software' },
  { label: 'Spray Business Software',      href: '/spray-business-software' },
  { label: 'Weed Control Software',        href: '/weed-control-software' },
  { label: 'Fertilizer Software',          href: '/fertilizer-software' },
];

const comparisons = [
  { label: 'vs. Jobber',             href: '/vs-jobber' },
  { label: 'vs. ServiceTitan',       href: '/vs-servicetitan' },
  { label: 'vs. GorillaDesk',        href: '/vs-gorilladesk' },
  { label: 'vs. Housecall Pro',      href: '/vs-housecallpro' },
  { label: 'vs. FieldRoutes',        href: '/vs-fieldroutes' },
  { label: 'vs. Service AutoPilot',  href: '/vs-serviceautopilot' },
  { label: 'vs. Spraye',             href: '/vs-spraye' },
  { label: 'vs. RealGreen',          href: '/vs-realgreen' },
  { label: 'vs. LawnPro',            href: '/vs-lawnpro' },
  { label: 'vs. CLIP',               href: '/vs-clip' },
  { label: 'vs. Aspire',             href: '/vs-aspire' },
];

export default function Navbar({ onTrialClick }: { onTrialClick: (el: HTMLElement) => void }) {
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleMenu = (val: boolean) => {
    setOpen(val);
    document.body.style.overflow = val ? 'hidden' : '';
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <a href="/" style={{textDecoration:'none', display:'flex', alignItems:'center', gap:'8px'}}>
              <span className="navbar-icon">🌿</span>
              <span className="navbar-name">SprayBossPro</span>
            </a>
          </div>
          <div className="navbar-links">
            <div className="nav-dropdown">
              <span className="nav-dropdown-trigger">Solutions ▾</span>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-inner">
                  {solutions.map(s => (
                    <a key={s.href} href={s.href} className="nav-dropdown-item">{s.label}</a>
                  ))}
                </div>
              </div>
            </div>
            <div className="nav-dropdown">
              <span className="nav-dropdown-trigger">Compare ▾</span>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-inner">
                  {comparisons.map(c => (
                    <a key={c.href} href={c.href} className="nav-dropdown-item">{c.label}</a>
                  ))}
                </div>
              </div>
            </div>
            <a href="/features">Features</a>
            <a href="/pricing">Pricing</a>
            <a href="https://my.spraybosspro.com" target="_blank" rel="noreferrer">Log In</a>
            <button
              className="navbar-cta"
              onClick={(e) => onTrialClick(e.currentTarget as HTMLElement)}
              style={{background:'var(--orange)', color:'#fff', border:'none', borderRadius:'6px', padding:'10px 20px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}
            >
              Start Free Trial
            </button>
          </div>
          {/* Hamburger — mobile only */}
          <button className="nav-hamburger" onClick={() => toggleMenu(!open)} aria-label="Menu">
            <span style={{display:'block', width:'22px', height:'2px', background:'#fff', marginBottom:'5px', transition:'transform .2s', transform: open ? 'rotate(45deg) translate(5px,5px)' : 'none'}}></span>
            <span style={{display:'block', width:'22px', height:'2px', background:'#fff', marginBottom:'5px', transition:'opacity .2s', opacity: open ? 0 : 1}}></span>
            <span style={{display:'block', width:'22px', height:'2px', background:'#fff', transition:'transform .2s', transform: open ? 'rotate(-45deg) translate(5px,-5px)' : 'none'}}></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu — outside <nav> so navbar's backdrop-filter doesn't trap fixed positioning */}
      {open && (
        <div className="nav-mobile-menu">
          <div className="nav-mobile-section">
            <div className="nav-mobile-group-trigger" onClick={() => setSolutionsOpen(!solutionsOpen)}>
              Solutions {solutionsOpen ? '▴' : '▾'}
            </div>
            {solutionsOpen && solutions.map(s => (
              <a key={s.href} href={s.href} className="nav-mobile-item" onClick={() => toggleMenu(false)}>{s.label}</a>
            ))}
          </div>
          <div className="nav-mobile-section">
            <div className="nav-mobile-group-trigger" onClick={() => setCompareOpen(!compareOpen)}>
              Compare {compareOpen ? '▴' : '▾'}
            </div>
            {compareOpen && comparisons.map(c => (
              <a key={c.href} href={c.href} className="nav-mobile-item" onClick={() => toggleMenu(false)}>{c.label}</a>
            ))}
          </div>
          <a href="/features" className="nav-mobile-link" onClick={() => toggleMenu(false)}>Features</a>
          <a href="/pricing" className="nav-mobile-link" onClick={() => toggleMenu(false)}>Pricing</a>
          <a href="https://my.spraybosspro.com" target="_blank" rel="noreferrer" className="nav-mobile-link" onClick={() => toggleMenu(false)}>Log In</a>
          <button
            className="nav-mobile-cta"
            onClick={(e) => { toggleMenu(false); onTrialClick(e.currentTarget as HTMLElement); }}
          >
            Start Free Trial
          </button>
        </div>
      )}
    </>
  );
}
