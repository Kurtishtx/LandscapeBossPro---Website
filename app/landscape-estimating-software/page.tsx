'use client';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';

const SBP_URL  = 'https://knjdbgroiyhvqwrpqzcx.supabase.co';
const SBP_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuamRiZ3JvaXlodnF3cnBxemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTczMDMsImV4cCI6MjA5NTA3MzMwM30.zoExtkem-XZqU86S4yJjA_xOOaS1G0IPU2M9OAAza2g';
let sbpClient: any = null;
let sbpOpenForm = 0;

function getSbpClient() {
  if (!sbpClient) sbpClient = (window as any).supabase.createClient(SBP_URL, SBP_ANON);
  return sbpClient;
}

function openSignupModal(n: number, btn: HTMLElement) {
  closeAllModals();
  sbpOpenForm = n;
  const form = document.getElementById('sbp-form-' + n)!;
  const rect = btn.getBoundingClientRect();
  const formW = Math.min(420, window.innerWidth - 24);
  const centerX = rect.left + rect.width / 2;
  let top  = rect.bottom + 12;
  let left = centerX - formW / 2;
  if (top + 460 > window.innerHeight) { top = rect.top - 460 - 12; if (top < 12) top = 12; }
  top  = Math.max(12, top);
  left = Math.max(12, Math.min(left, window.innerWidth - formW - 12));
  form.style.top  = top  + 'px';
  form.style.left = left + 'px';
  form.style.display = 'block';
  document.getElementById('sbp-backdrop')!.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeSignupModal(n: number) {
  document.getElementById('sbp-form-' + n)!.style.display = 'none';
  document.getElementById('sbp-backdrop')!.style.display = 'none';
  document.body.style.overflow = '';
  sbpOpenForm = 0;
}

function closeAllModals() {
  [1, 2, 3].forEach(i => {
    const el = document.getElementById('sbp-form-' + i);
    if (el) el.style.display = 'none';
  });
  const backdrop = document.getElementById('sbp-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  document.body.style.overflow = '';
  sbpOpenForm = 0;
}

function sbpStep2(n: number) {
  const err = document.getElementById(`sbp${n}-err1`)!;
  err.style.display = 'none';
  const first = (document.getElementById(`sbp${n}-first`) as HTMLInputElement).value.trim();
  const last  = (document.getElementById(`sbp${n}-last`)  as HTMLInputElement).value.trim();
  const comp  = (document.getElementById(`sbp${n}-company`) as HTMLInputElement).value.trim();
  const email = (document.getElementById(`sbp${n}-email`) as HTMLInputElement).value.trim();
  if (!first || !last)                return sbpShowErr(err, 'Please enter your first and last name.');
  if (!comp)                          return sbpShowErr(err, 'Please enter your company name.');
  if (!email || !email.includes('@')) return sbpShowErr(err, 'Please enter a valid email address.');
  (document.getElementById(`sbp${n}-login-email`) as HTMLInputElement).value = email;
  document.getElementById(`sbp${n}-step1`)!.style.display = 'none';
  document.getElementById(`sbp${n}-step2`)!.style.display = 'block';
  (document.getElementById(`sbp${n}-password`) as HTMLInputElement).focus();
}

function sbpBackToStep1(n: number) {
  document.getElementById(`sbp${n}-step2`)!.style.display = 'none';
  document.getElementById(`sbp${n}-step1`)!.style.display = 'block';
  document.getElementById(`sbp${n}-err2`)!.style.display  = 'none';
}

async function sbpCreateAccount(n: number) {
  const err = document.getElementById(`sbp${n}-err2`)!;
  const btn = document.getElementById(`sbp${n}-create-btn`) as HTMLButtonElement;
  err.style.display = 'none';
  const email    = (document.getElementById(`sbp${n}-login-email`) as HTMLInputElement).value.trim();
  const password = (document.getElementById(`sbp${n}-password`)    as HTMLInputElement).value;
  const confirm  = (document.getElementById(`sbp${n}-confirm`)     as HTMLInputElement).value;
  if (password.length < 8)  return sbpShowErr(err, 'Password must be at least 8 characters.');
  if (password !== confirm)  return sbpShowErr(err, 'Passwords do not match.');
  if (!(document.getElementById(`sbp${n}-agree`) as HTMLInputElement).checked)
    return sbpShowErr(err, 'Please agree to the Terms of Service and Privacy Policy.');
  btn.disabled = true;
  btn.textContent = 'Creating your account…';
  try {
    const res = await fetch(SBP_URL + '/functions/v1/manage-users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SBP_ANON, 'apikey': SBP_ANON },
      body: JSON.stringify({ action: 'create', email, password }),
    });
    const result = await res.json();
    if (result.error) throw new Error(result.error);
    const sb = getSbpClient();
    const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password });
    if (signInErr) throw new Error(signInErr.message);
    const uid   = signInData.user.id;
    const first = (document.getElementById(`sbp${n}-first`)   as HTMLInputElement).value.trim();
    const last  = (document.getElementById(`sbp${n}-last`)    as HTMLInputElement).value.trim();
    const comp  = (document.getElementById(`sbp${n}-company`) as HTMLInputElement).value.trim();
    await sb.auth.updateUser({ data: { full_name: first + ' ' + last } });
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from('user_profiles').upsert(
      { id: uid, email, role: 'full_access', is_primary_owner: true, tenant_id: null, trial_ends_at: trialEnd },
      { onConflict: 'id' }
    );
    await sb.from('company_info').insert({ user_id: uid, company_name: comp, display_name: comp });
    const reasons = ['Cancel Maintaining Self','Cancel Sold House','Cancel Too Expensive','Cancel Unknown','Dropping Customer','Sold House']
      .map(nm => ({ name: nm, active: true, user_id: uid }));
    await sb.from('cancellation_reasons').insert(reasons);
    document.getElementById(`sbp${n}-step2`)!.style.display   = 'none';
    document.getElementById(`sbp${n}-success`)!.style.display = 'block';
    let secs = 4;
    const cd = document.getElementById(`sbp${n}-countdown`)!;
    cd.textContent = 'Redirecting in ' + secs + ' seconds…';
    const iv = setInterval(() => {
      secs--;
      if (secs <= 0) { clearInterval(iv); window.location.href = 'https://my.landscapebosspro.com/dashboard.html'; }
      else cd.textContent = 'Redirecting in ' + secs + ' second' + (secs === 1 ? '' : 's') + '…';
    }, 1000);
  } catch (e: any) {
    sbpShowErr(err, e.message || 'Something went wrong. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Create My Account';
  }
}

function sbpShowErr(el: HTMLElement, msg: string) { el.textContent = msg; el.style.display = 'block'; }

function SignupForm({ n }: { n: number }) {
  return (
    <div id={`sbp-form-${n}`} className="sbp-form">
      <div className="sbp-form-header">
        <div className="sbp-form-title">Start Your 14-Day Free Trial</div>
        <div className="sbp-form-subtitle">No credit card required. Full access. Cancel anytime.</div>
        <button className="sbp-form-close" onClick={() => closeSignupModal(n)}>×</button>
      </div>
      <div id={`sbp${n}-step1`} className="sbp-form-body">
        <div id={`sbp${n}-err1`} className="sbp-err"></div>
        <div className="sbp-field-row">
          <div className="sbp-field-half">
            <label className="sbp-label">First Name</label>
            <input id={`sbp${n}-first`} type="text" placeholder="John" className="sbp-input" />
          </div>
          <div className="sbp-field-half">
            <label className="sbp-label">Last Name</label>
            <input id={`sbp${n}-last`} type="text" placeholder="Smith" className="sbp-input" />
          </div>
        </div>
        <div className="sbp-field">
          <label className="sbp-label">Company Name</label>
          <input id={`sbp${n}-company`} type="text" placeholder="Smith Landscaping" className="sbp-input" />
        </div>
        <div className="sbp-field-last">
          <label className="sbp-label">Email Address</label>
          <input id={`sbp${n}-email`} type="email" placeholder="you@yourcompany.com" className="sbp-input" />
        </div>
        <button onClick={() => sbpStep2(n)} className="btn-primary" style={{width:'100%', fontSize:'15px', padding:'13px'}}>
          Next: Create Password →
        </button>
      </div>
      <div id={`sbp${n}-step2`} className="sbp-form-body" style={{display:'none'}}>
        <div id={`sbp${n}-err2`} className="sbp-err"></div>
        <div className="sbp-trial-note">
          <div className="sbp-trial-note-title">14-Day Free Trial — No Credit Card Required</div>
          <div className="sbp-trial-note-sub">Full access to every feature. $129/month after trial.</div>
        </div>
        <div className="sbp-field">
          <label className="sbp-label">Login Email</label>
          <input id={`sbp${n}-login-email`} type="email" readOnly className="sbp-input sbp-input-readonly" />
        </div>
        <div className="sbp-field">
          <label className="sbp-label">Password</label>
          <input id={`sbp${n}-password`} type="password" placeholder="At least 8 characters" className="sbp-input" />
        </div>
        <div className="sbp-field">
          <label className="sbp-label">Confirm Password</label>
          <input id={`sbp${n}-confirm`} type="password" placeholder="Repeat password" className="sbp-input" />
        </div>
        <div className="sbp-agree-row">
          <input type="checkbox" id={`sbp${n}-agree`} className="sbp-agree-check" />
          <label htmlFor={`sbp${n}-agree`} className="sbp-agree-label">
            I agree to the{' '}
            <a href="https://landscapebosspro.com/terms" target="_blank" rel="noreferrer" className="sbp-link">Terms of Service</a>
            {' '}and{' '}
            <a href="https://landscapebosspro.com/privacy-policy" target="_blank" rel="noreferrer" className="sbp-link">Privacy Policy</a>
          </label>
        </div>
        <button id={`sbp${n}-create-btn`} onClick={() => sbpCreateAccount(n)} className="btn-primary" style={{width:'100%', fontSize:'15px', padding:'13px'}}>
          Create My Account
        </button>
        <button className="sbp-btn-back" onClick={() => sbpBackToStep1(n)}>← Back</button>
      </div>
      <div id={`sbp${n}-success`} className="sbp-success-panel">
        <div className="sbp-success-icon">✓</div>
        <div className="sbp-success-title">You&#39;re In!</div>
        <div className="sbp-success-sub">Your 14-day free trial has started.<br />Taking you to your dashboard…</div>
        <div id={`sbp${n}-countdown`} className="sbp-countdown"></div>
      </div>
    </div>
  );
}

export default function LandscapeEstimatingSoftware() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !sbpOpenForm) return;
      const n = sbpOpenForm;
      if (document.getElementById('sbp-form-' + n)?.style.display !== 'block') return;
      if (document.getElementById(`sbp${n}-step2`)?.style.display === 'block') sbpCreateAccount(n);
      else sbpStep2(n);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      <div className="hero">
        <div className="hero-badge">Built Specifically for Landscaping</div>
        <h1>Landscape Estimating Software<br /><span>That Builds Real Bids in Minutes</span></h1>
        <p>Generic field service software was never built to price a paver patio, a planting bed, a sod install, or a season of recurring maintenance. <a href="/">LandscapeBossPro</a> is built from the ground up for landscaping companies &mdash; line-item estimates, material and product tracking, project scheduling, crew dispatch, and invoicing all live in one place so the way you bid, build, and bill finally matches how you actually work.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">Line-Item</div><div className="hero-stat-lbl">Bids Built in Minutes</div></div>
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Flat Monthly — No Add-Ons</div></div>
          <div><div className="hero-stat-val">500+</div><div className="hero-stat-lbl">SMS Alerts Included Monthly</div></div>
          <div><div className="hero-stat-val">2006</div><div className="hero-stat-lbl">In the Industry Since</div></div>
        </div>
      </div>

      {/* HERO IMAGE */}
      <div style={{background:'var(--purple-dark)', padding:'0 40px 60px', textAlign:'center'}}>
        <img
          src="/dashboard-mockup.webp"
          width={1200}
          height={800}
          fetchPriority="high"
          decoding="async"
          alt="LandscapeBossPro landscape estimating software dashboard on laptop showing a line-item bid with materials and labor, plus the mobile crew app on a phone"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Affordable Doesn&apos;t Mean Cheap.<br /><span>This Is Enterprise-Level Landscape Estimating Software.</span></h2>
        <p>$129/month sounds modest. But what you&apos;re getting isn&apos;t modest at all. LandscapeBossPro is built to the same standard as estimating software that costs 10 times more &mdash; the difference is we built it ourselves, for ourselves, and we don&apos;t have a sales team, investor overhead, or a $500/month add-on for every feature you actually need.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">📝</div><h4>Line-Item Estimates</h4><p>Build detailed bids with separate lines for labor, materials, and equipment &mdash; hardscape, planting, sod, mulch, grading, or a full design-build. Adjust quantities and watch the total recalculate instantly, then send a clean, branded estimate the client can accept with one tap.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Materials &amp; Products</h4><p>Track every product you buy and install &mdash; pavers, block, plants, sod, mulch, topsoil, gravel, edging. Store your cost and markup once, drop items into any estimate, and know your real margin on every project before you ever break ground.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Communication Suite</h4><p>Two-way SMS inbox, automated alerts, estimate follow-up sequences, payment reminders, and review requests &mdash; all built in at the flat price. No Twilio account, no Mailchimp, no third-party setup to keep clients in the loop.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Stripe Payments</h4><p>Cards on file, deposits, progress billing, invoicing, and overdue reports &mdash; the full Stripe integration is wired in. Collect a deposit the day a bid is accepted and see every dollar collected across every project in one place.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🗓️</div><h4>Project Scheduling</h4><p>Put multi-day installs and recurring maintenance on the same calendar. Assign crews, set start dates, and see what every truck is doing this week &mdash; from a three-week hardscape build to a Tuesday mowing route.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Your Crew</h4><p>Your crews get a mobile dashboard with the day&apos;s jobs, the materials list, the property notes, and the complete button. Mark work done, log progress, and add photos &mdash; all from the jobsite without calling the office once.</p></div>
        </div>
      </div>

      {/* ESTIMATE BUILDER */}
      <section className="dark-section">
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">The Estimate Builder</span>
            <h2 style={{color:'#fff'}}>Build a Line-Item Landscape Bid in Minutes, Not an Evening.</h2>
            <p style={{color:'rgba(255,255,255,.65)'}}>Most landscapers price jobs on a legal pad or a spreadsheet that breaks every time you copy it. LandscapeBossPro&apos;s estimate builder lets you stack labor, materials, and equipment line by line, pull saved items straight from your catalog, and watch the total and your margin update in real time. For a full walkthrough, read <a href="/blogs/landscape-estimating-software-line-item-bids" style={{color:'#d4a017', fontWeight:600}}>How Landscape Estimating Software Builds Line-Item Bids in Minutes</a>.</p>
            <ul className="check-list" style={{marginTop:'20px'}}>
              <li style={{color:'rgba(255,255,255,.75)'}}>Separate lines for labor, materials, products, and equipment</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Pull saved catalog items into any bid with one click</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Quantities and totals recalculate the instant you edit them</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>See your true margin before you send the bid to the client</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Apply discounts and sales tax automatically per jurisdiction</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Email a branded estimate the client accepts with one tap</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Convert any accepted bid into an invoice without re-keying a thing</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Reuse winning bids as templates for the next similar project</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>Estimate — Backyard Paver Patio</div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Pavers &mdash; 480 sq ft</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Material · cost + markup</div></div>
              <div style={{marginLeft:'auto', background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$3,840</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1b6e3b', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Base &amp; Sand &mdash; 14 tons</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Material · delivered</div></div>
              <div style={{marginLeft:'auto', background:'#1b6e3b', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$1,260</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#d4a017', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Crew Labor &mdash; 3 days</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>4 crew · install + grade</div></div>
              <div style={{marginLeft:'auto', background:'#d4a017', color:'#1a1a1a', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$4,200</div>
            </div>
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'#d4a017', fontSize:'22px', fontWeight:800}}>$9,300 bid · 38% margin</div>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'12px', marginTop:'4px'}}>Calculated live as you build the estimate.</div>
            </div>
          </div>
        </div>
      </section>

      {/* EASIER TO USE */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Simplicity</span>
          <h2 className="section-title">The Most Capable Landscape Estimating Software Is Also the Easiest to Learn</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>Most powerful software is complicated. LandscapeBossPro is the exception. Every screen was designed by people who actually bid and built landscape projects &mdash; not UX designers who&apos;ve never loaded a skid steer. Your team will be writing bids and dispatching crews confidently on day one.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'24px', maxWidth:'1100px', margin:'0 auto'}}>
          {[
            {n:'01', title:'Set Up in One Afternoon', body:'Add your services and material catalog, import your clients and properties, set up your automated alerts, and connect Stripe — most owners are writing real bids the same day they sign up. No implementation consultant, no onboarding call, no 90-day setup timeline.'},
            {n:'02', title:'One Screen Does Everything', body:'Estimating, materials, scheduling, dispatch, and invoicing are all connected. You\'re not jumping between five different modules or browser tabs. Pull up a project and the bid, the materials list, the crew, and the invoice are all right there.'},
            {n:'03', title:'Your Crews Learn It in Minutes', body:'The mobile app your crews use shows them exactly what they need and nothing they don\'t. Today\'s jobs, the property info, the materials list, the job notes, and the complete button. No training videos, no IT ticket, no frustrated crew members.'},
            {n:'04', title:'Automation Runs Without You', body:'Set up your SMS alerts, estimate follow-ups, and payment reminders once. After that, LandscapeBossPro handles every notification, every follow-up, and every review request automatically — whether you\'re on a jobsite, at home, or on vacation.'},
          ].map(({n, title, body}) => (
            <div key={n} style={{background:'#fff', border:'1.5px solid var(--border)', borderRadius:'12px', padding:'30px 26px'}}>
              <div style={{fontSize:'40px', fontWeight:800, color:'var(--gold)', opacity:.35, lineHeight:1, marginBottom:'12px'}}>{n}</div>
              <h3 style={{fontSize:'17px', fontWeight:700, color:'var(--text)', marginBottom:'8px'}}>{title}</h3>
              <p style={{color:'var(--muted)', fontSize:'14px', lineHeight:1.6}}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* THE PROBLEM */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">The Problem</span>
          <h2 className="section-title">Generic Software Wasn&apos;t Built to Estimate Landscape Projects</h2>
          <p className="section-sub">Landscaping is not plumbing. You&apos;re not sending one tech to one job for two hours. You&apos;re pricing multi-day installs with dozens of material line items, juggling design-build projects and recurring maintenance routes, and trying to protect a margin while material costs move every season.</p>
        </div>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <div style={{background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'36px 40px', borderLeft:'5px solid var(--gold)'}}>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8, marginBottom:'16px'}}>When we were running our own landscaping crews, we tried every piece of software out there. The big names, the small names, the ones built for &quot;field service.&quot; None of them understood what it meant to bid a <strong>paver patio with 40 line items</strong> of pavers, base, sand, edging, and labor &mdash; and still know your real margin before you handed the client a price.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8, marginBottom:'16px'}}>They don&apos;t have that. Because they weren&apos;t built by someone who runs a landscaping business. <strong>We were.</strong> We&apos;ve been in this industry since 2006, and LandscapeBossPro is the software we always wished existed.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8}}>Every feature in LandscapeBossPro exists because we needed it on a real landscape project. Not because a product manager in a tech office decided it sounded good.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="centered" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <span className="section-label">Built for Landscaping</span>
          <h2 className="section-title">Features Designed Around Your Projects</h2>
          <p className="section-sub">Every tool in LandscapeBossPro was built with landscaping workflows in mind &mdash; not adapted from a plumbing app and called good enough.</p>
        </div>
        <div className="feature-grid">
          {[
            {icon:'📝', title:'Line-Item Estimating', body:'Build detailed bids with separate lines for labor, materials, products, and equipment. Adjust a quantity and the total recalculates instantly. Price hardscape, planting, sod, mulch, grading, or a full design-build in minutes.'},
            {icon:'📦', title:'Materials &amp; Product Catalog', body:'Store every product you install — pavers, block, plants, sod, mulch, topsoil, gravel, edging — with your cost and markup. Drop catalog items into any estimate and protect your margin on every project.'},
            {icon:'📐', title:'Bid Templates', body:'Save your winning bids as reusable templates. The next patio, planting bed, or sod install starts from a proven estimate instead of a blank page — so you bid faster and never forget a line item.'},
            {icon:'🗓️', title:'Project Scheduling', body:'Put multi-day installs and recurring maintenance on one calendar. Assign crews, set start dates, and see exactly what every truck is doing this week at a glance.'},
            {icon:'🗺️', title:'Crew Dispatch &amp; Routing', body:'Send the day\'s jobs to the right crew and tighten maintenance routes geographically. Reorder stops, cut windshield time, and keep your mowing crews moving efficiently.'},
            {icon:'📋', title:'The Job Board', body:'See every job that needs to be scheduled, in progress, or wrapping up in one view. Move work from estimate-accepted to dispatched to complete without anything slipping through the cracks.'},
            {icon:'💬', title:'Automated Job Alerts', body:'Automatically text clients when a project is scheduled, when the crew is on the way, and when the job is done. Set it once — LandscapeBossPro handles the communication for every job.'},
            {icon:'💰', title:'Estimates That Close', body:'Email a branded landscape bid directly from the platform and let clients accept with one click. Automatic follow-ups go out if they don\'t respond, so warm bids don\'t go cold.'},
            {icon:'💳', title:'Card-on-File &amp; Deposits', body:'Store cards on file via Stripe, collect a deposit the day a bid is accepted, and bill progress payments on big installs. Every dollar tracked in one place.'},
            {icon:'🔁', title:'Recurring Maintenance Plans', body:'Set up recurring maintenance and mowing accounts with their own schedules and billing. LandscapeBossPro keeps the route running and the invoices going out automatically.'},
            {icon:'📱', title:'Mobile App for Crews', body:'Your crews get a mobile view of the day\'s jobs with the materials list and notes attached. Mark work complete, log progress, and add photos — right from the jobsite.'},
            {icon:'🏠', title:'Client &amp; Property Profiles', body:'Every property has its own record — project history, bids, photos, materials installed, notes, and GPS coordinates. Everything tied to the address, not just the customer.'},
            {icon:'💬', title:'Two-Way SMS Inbox', body:'Send and receive text messages with clients directly inside LandscapeBossPro. Full conversation history organized by contact — no more switching to your personal phone.'},
            {icon:'⭐', title:'Automated Review Requests', body:'After every completed project, LandscapeBossPro automatically sends a Google review request — on your schedule, every time, without you lifting a finger.'},
            {icon:'📄', title:'Invoice Management', body:'Convert accepted estimates to invoices instantly. Filter by unpaid, partial, paid, or overdue. Every dollar tracked with full payment history, method, and date.'},
            {icon:'🏷️', title:'Discount Codes &amp; Sales Tax', body:'Apply percentage or fixed-dollar discounts to any bid. Set sales tax rates by jurisdiction and let LandscapeBossPro calculate and track tax on every invoice automatically.'},
            {icon:'👑', title:'Role-Based Access', body:'Owner, Manager, Office, Crew Lead, and Mobile roles. Control exactly what each person on your team can see and do — from full access down to field-only.'},
            {icon:'🚛', title:'Truck &amp; Equipment Management', body:'Create truck profiles, assign vehicles and equipment to jobs, and track which crew handled each project. Know exactly what\'s on every truck every day.'},
            {icon:'⏱️', title:'Employee Hour Tracking', body:'Track crew hours per project and generate payroll-ready reports. Know exactly what you owe — and how your labor estimate compared to reality — on every job.'},
            {icon:'📊', title:'Dashboard &amp; Reports', body:'Custom stat cards show today\'s revenue, projects in progress, bids out, money owed, and more — all at a glance the moment you log in.'},
            {icon:'🔔', title:'10+ Automated Alert Types', body:'Job scheduled, completed, rescheduled, estimate sent, estimate accepted, review request, payment declined, inbound text — all automated, all customizable.'},
            {icon:'👥', title:'Unlimited Users', body:'Add every crew member, office staff member, and lead at no extra cost. No per-seat fees. Unlimited users are included in the flat $129/month rate.'},
            {icon:'🏢', title:'Unlimited Clients &amp; Properties', body:'No caps on clients, properties, bids, or projects. Whether you run 50 accounts or 5,000 — LandscapeBossPro handles it all at the same flat price.'},
          ].map(({icon, title, body}) => (
            <div key={title} className="feature-card">
              <span className="feature-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MATERIALS */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Materials &amp; Products</span>
            <h2>Price Materials Right, and Your Margin Stops Leaking on Every Project.</h2>
            <p>Landscaping is material-heavy, and that&apos;s where most bids quietly lose money. LandscapeBossPro keeps a full materials catalog with your real cost and markup on every product you install &mdash; so the moment you drop pavers, plants, sod, or mulch into an estimate, your price and your margin are correct.</p>
            <ul className="check-list">
              <li>Full product catalog with cost and markup stored per item</li>
              <li>Pavers, block, plants, sod, mulch, topsoil, gravel, edging and more</li>
              <li>Quantities flow straight from the bid into the materials list</li>
              <li>See true margin per line and per project before you send it</li>
              <li>Crews get the exact materials list for each job on mobile</li>
              <li>Update a cost once and every new bid reflects it</li>
              <li>Track what was actually installed against what was estimated</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Materials Catalog</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px'}}>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>312</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Catalog Items</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>9</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Material Types</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#d4a017', fontSize:'20px', fontWeight:700}}>38%</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Avg Margin</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#d4a017', fontSize:'20px', fontWeight:700}}>1-Click</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Add to Bid</div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Holland Paver &mdash; per sq ft</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Cost $5.20 · Sell $8.00</div></div>
              <div style={{background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>35% mg</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1b6e3b', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Shredded Mulch &mdash; per yard</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Cost $28 · Sell $48</div></div>
              <div style={{background:'#1b6e3b', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>42% mg</div>
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULING */}
      <section>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Scheduling &amp; Dispatch</span>
            <h2>One Calendar for Multi-Day Installs and Recurring Maintenance Crews</h2>
            <p>The hardest part of running a landscaping company isn&apos;t the bid &mdash; it&apos;s keeping a three-week hardscape build, a sod install, and a full slate of recurring maintenance routes all moving without crews tripping over each other. LandscapeBossPro puts every job on one calendar and sends each crew exactly what it needs for the day.</p>
            <ul className="check-list">
              <li>Multi-day projects and recurring maintenance on one calendar</li>
              <li>Assign crews and trucks at scheduling time</li>
              <li>Job board shows scheduled, in-progress, and completed work</li>
              <li>Drag-and-drop route reordering for maintenance crews</li>
              <li>Mark jobs complete, in progress, or rescheduled from the field</li>
              <li>Crews see the day&apos;s jobs, materials, and notes on mobile</li>
              <li>Recurring maintenance plans bill and schedule automatically</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>This Week &mdash; By Crew</div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Install Crew A</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Paver patio · day 2 of 3</div></div>
              <div style={{marginLeft:'auto', background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>In Progress</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1b6e3b', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Install Crew B</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Sod &amp; planting · 6,200 ft²</div></div>
              <div style={{marginLeft:'auto', background:'#1b6e3b', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>Scheduled</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#d4a017', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Maintenance Crew</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>18-stop mowing route</div></div>
              <div style={{marginLeft:'auto', background:'#d4a017', color:'#1a1a1a', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>Recurring</div>
            </div>
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'#1b6e3b', fontSize:'16px', fontWeight:700}}>Every crew, one calendar.</div>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'12px', marginTop:'4px'}}>Installs and maintenance, side by side.</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">One Flat Price. Everything Included.</h2>
          <p className="section-sub">We were paying $500&ndash;$700 a month for software that nickel-and-dimed us. We built LandscapeBossPro to be the pricing we always wished existed.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="lc-price-card featured">
            <div className="featured-badge">Everything Included</div>
            <div className="price-tier">One Plan. No Surprises.</div>
            <div style={{fontSize:'48px', fontWeight:800, color:'var(--text)', lineHeight:1}}><sup style={{fontSize:'22px', verticalAlign:'super'}}>$</sup>129</div>
            <div style={{color:'var(--muted)', fontSize:'13px', marginBottom:'24px', marginTop:'4px'}}>per month</div>
            <div style={{color:'var(--muted)', fontSize:'14px', marginBottom:'24px', lineHeight:1.5}}>Every feature. Unlimited clients, properties, employees, and users. No tiers, no locked features, no per-seat fees.</div>
            <ul className="price-features">
              <li>Unlimited Clients, Properties &amp; Bids</li>
              <li>Unlimited Employees &amp; Users</li>
              <li>Line-Item Estimating &amp; Bid Templates</li>
              <li>Materials &amp; Product Catalog</li>
              <li>Project Scheduling, Dispatch &amp; Job Board</li>
              <li>Estimates, Invoices &amp; Stripe Payments</li>
              <li>Card-on-File, Deposits &amp; Progress Billing</li>
              <li>Two-Way SMS &amp; Automated Alerts</li>
              <li>Recurring Maintenance Plans</li>
              <li>Mobile App for Crews</li>
              <li>500 Outbound SMS/month included</li>
              <li>+$15 per additional 500 SMS after that</li>
            </ul>
            <button onClick={(e) => openSignupModal(2, e.currentTarget as HTMLElement)} className="price-btn price-btn-primary">Start Your 14-Day Free Trial</button>
          </div>
        </div>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'13px', marginTop:'32px'}}>No contracts. Cancel anytime. No hidden fees — ever.</p>
      </section>

      {/* FAQ */}
      <section style={{background:'#fff'}}>
        <div style={{maxWidth:'860px', margin:'0 auto', padding:'80px 40px'}}>
          <span className="section-label">FAQ</span>
          <h2 className="section-title" style={{marginBottom:'48px'}}>Landscape Estimating Software — Common Questions</h2>
          {[
            {q:'Is LandscapeBossPro built for landscaping businesses?', a:'Yes. LandscapeBossPro handles the full landscaping operation: line-item estimating, a materials and product catalog, project scheduling, crew dispatch, the job board, estimate-to-invoice conversion, automated client SMS, and card-on-file payments. It\'s designed for install, design-build, hardscape, planting, sod, mulch, and recurring maintenance crews — not general service businesses.'},
            {q:'How does line-item estimating work?', a:'You build a bid by stacking separate lines for labor, materials, products, and equipment. Pull saved items straight from your catalog, set quantities, and the total and your margin recalculate instantly. Then email a branded estimate the client can accept with one click, and convert it to an invoice without re-keying anything.'},
            {q:'Can I track materials and products on every bid?', a:'Yes. The materials catalog stores your real cost and markup for every product you install — pavers, block, plants, sod, mulch, topsoil, gravel, edging, and more. Drop items into any estimate and you always know your true margin per line and per project before you send the price.'},
            {q:'Can it handle both installs and recurring maintenance?', a:'Yes. Multi-day installs and recurring maintenance routes live on the same calendar. Assign crews and trucks, dispatch the day\'s work from the job board, and let recurring maintenance plans schedule and bill themselves automatically.'},
            {q:'Does it replace spreadsheets and separate scheduling apps?', a:'Yes. LandscapeBossPro replaces spreadsheet estimating, project scheduling, client tracking, invoicing, and SMS communication tools in one platform. Most owners are writing real bids the same day they sign up — no onboarding consultant, no implementation timeline.'},
            {q:'How much does LandscapeBossPro cost?', a:'$129/month, all features included. No per-user fees, no add-ons for estimating or scheduling tools, no setup fees. 14-day free trial with no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>LandscapeBossPro runs your estimating, materials, scheduling, dispatch, and invoicing all from one platform &mdash; <a href="/" style={{color:'var(--gold)', fontWeight:600}}>see the full platform overview at LandscapeBossPro</a>.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Stop Bidding Landscape Projects<br />on a Legal Pad and a Broken Spreadsheet.</h2>
        <p>LandscapeBossPro is landscape estimating software built by someone who has actually bid and built the projects. Try it free for 14 days.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(3, e.currentTarget as HTMLElement); }} className="btn-primary" style={{fontSize:'17px', padding:'18px 44px'}}>Start Your 14-Day Free Trial</a>
        </div>
      </div>

      <div id="sbp-backdrop" className="sbp-backdrop" onClick={() => closeAllModals()}></div>
      <SignupForm n={1} />
      <SignupForm n={2} />
      <SignupForm n={3} />
    </>
  );
}
