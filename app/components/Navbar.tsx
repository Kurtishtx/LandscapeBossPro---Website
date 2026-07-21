'use client';
import { useState } from 'react';

const solutions = [
  { label: 'Landscaping Software',         href: '/landscaping-software' },
  { label: 'Landscape Estimating',         href: '/landscape-estimating-software' },
  { label: 'Landscape Scheduling',         href: '/landscape-scheduling-software' },
  { label: 'Crew & Dispatch',              href: '/landscape-crew-dispatch-software' },
  { label: 'Invoicing & Billing',          href: '/landscaping-invoicing-software' },
  { label: 'Landscape Business Software',  href: '/landscape-business-software' },
  { label: 'Landscape Maintenance',        href: '/landscape-maintenance-software' },
  { label: 'Customer Management',          href: '/landscape-customer-management-software' },
];

const comparisons = [
  { label: 'vs. Jobber',             href: '/vs-jobber' },
  { label: 'vs. ServiceTitan',       href: '/vs-servicetitan' },
  { label: 'vs. Aspire',             href: '/vs-aspire' },
  { label: 'vs. LMN',                href: '/vs-lmn' },
  { label: 'vs. Yardbook',           href: '/vs-yardbook' },
  { label: 'vs. SingleOps',          href: '/vs-singleops' },
  { label: 'vs. Service AutoPilot',  href: '/vs-serviceautopilot' },
  { label: 'vs. Housecall Pro',      href: '/vs-housecallpro' },
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
              <span className="navbar-name">LandscapeBossPro</span>
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
            <a href="https://my.landscapebosspro.com" target="_blank" rel="noreferrer">Log In</a>
            <a href="https://my.landscapebosspro.com/demo.html" className="navbar-demo" style={{display:'inline-flex', alignItems:'center', gap:'7px', border:'1.5px solid rgba(255,255,255,.35)', borderRadius:'6px', padding:'9px 16px', fontSize:'14px', fontWeight:700, color:'#fff', textDecoration:'none', whiteSpace:'nowrap'}}>
              <span style={{width:'7px', height:'7px', borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 0 3px rgba(74,222,128,.22)'}} />
              Live Demo
            </a>
            <button
              className="navbar-cta"
              onClick={(e) => onTrialClick(e.currentTarget as HTMLElement)}
              style={{background:'var(--orange)', color:'#fff', border:'none', borderRadius:'6px', padding:'10px 20px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}
            >
              Start Free Trial
            </button>
          </div>
          {/* Live Demo — mobile only, sits in the bar next to the hamburger */}
          <a
            href="https://my.landscapebosspro.com/demo.html"
            className="nav-demo-mobile"
            style={{ alignItems: 'center', gap: '6px', marginLeft: 'auto', marginRight: '12px', border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.06)', borderRadius: '999px', padding: '7px 13px', fontSize: '13px', fontWeight: 700, color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 0 3px rgba(74,222,128,.22)', flexShrink: 0 }} />
            Live Demo
          </a>

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
          <a href="https://my.landscapebosspro.com" target="_blank" rel="noreferrer" className="nav-mobile-link" onClick={() => toggleMenu(false)}>Log In</a>
          <a href="https://my.landscapebosspro.com/demo.html" className="nav-mobile-link" onClick={() => toggleMenu(false)}>▶ Try the Live Demo — no signup</a>
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
