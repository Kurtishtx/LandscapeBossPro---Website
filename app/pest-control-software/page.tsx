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
      if (secs <= 0) { clearInterval(iv); window.location.href = 'https://my.spraybosspro.com/dashboard.html'; }
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
          <input id={`sbp${n}-company`} type="text" placeholder="Smith Pest Control" className="sbp-input" />
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
            <a href="https://spraybosspro.com/terms" target="_blank" rel="noreferrer" className="sbp-link">Terms of Service</a>
            {' '}and{' '}
            <a href="https://spraybosspro.com/privacy-policy" target="_blank" rel="noreferrer" className="sbp-link">Privacy Policy</a>
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

export default function PestControlSoftware() {
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
        <div className="hero-badge">Built for Pest Control Businesses</div>
        <h1>Pest Control Software<br /><span>That Actually Fits How You Run Routes</span></h1>
        <p>Generic field service software wasn&apos;t built for pest control. SprayBossPro is — recurring treatment plans, chemical application logs, compliance reports, automated customer alerts, and route scheduling built around the way spray businesses actually operate.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Flat Monthly — Everything Included</div></div>
          <div><div className="hero-stat-val">500+</div><div className="hero-stat-lbl">SMS Alerts Included Monthly</div></div>
          <div><div className="hero-stat-val">30 sec</div><div className="hero-stat-lbl">Pull a Compliance Report</div></div>
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
          alt="SprayBossPro pest control software showing recurring program scheduling, compliance logs, and mobile dispatch on laptop and phone"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Affordable Doesn&apos;t Mean Cheap.<br /><span>This Is Enterprise-Level Pest Control Software.</span></h2>
        <p>$129/month sounds like a bargain. It is — but not because we cut corners. SprayBossPro is built to the same standard as software that costs 10 times more. The difference is we built it ourselves, for ourselves, with no sales team overhead, no investor timeline, and no $200/month module you have to buy just to print a compliance report.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">🧪</div><h4>Chemical Compliance Built In</h4><p>Every application auto-logged with product name, EPA reg number, mix rate, gallons used, target pest, area treated, weather, and tech license. Print a state-ready compliance report in under 30 seconds — no spreadsheet, no extra module.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔁</div><h4>Recurring Treatment Engine</h4><p>Quarterly, bi-monthly, annual, or custom — every property&apos;s treatment schedule is tracked automatically. A waiting list shows you exactly what&apos;s due by service type before you schedule a single stop. No other pest control software has this.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Full Communication Suite</h4><p>Two-way SMS inbox, 10+ automated alert types, estimate follow-up sequences, payment reminders, review requests — all built into the flat price. No Twilio account to manage, no Mailchimp subscription, no third-party setup.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Stripe Payments</h4><p>Cards on file, invoicing, charge after service, payment tracking, overdue reports — the full Stripe integration is wired in. Your customers can pay instantly and every dollar is tracked in one place without a separate accounting tool.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔐</div><h4>Role-Based Team Access</h4><p>Owner, Manager, Office Staff, Technician, and Mobile-only roles. Granular permission control so your field techs see only what they need, your office manager can&apos;t delete a client by accident, and you stay in control of everything.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Your Crew</h4><p>Technicians get a mobile-optimized stop list for the day. Mark complete, log chemicals, skip, or reschedule — all from the truck without calling the office once. Everything syncs in real time the moment they tap done.</p></div>
        </div>
      </div>

      {/* LASSO */}
      <section className="dark-section">
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Lasso — Circle Map Scheduling</span>
            <h2 style={{color:'#fff'}}>Draw a Circle on the Map. Instantly See Every Property Inside It.</h2>
            <p style={{color:'rgba(255,255,255,.65)'}}>Lasso is the fastest way to build a pest control route we&apos;ve ever seen. Draw a circle on your service area map and SprayBossPro instantly pulls every property inside that radius that has a treatment due — with total stops, service types, and counts all calculated in real time before you commit to a single schedule. What used to take an hour now takes under five minutes.</p>
            <ul className="check-list" style={{marginTop:'20px'}}>
              <li style={{color:'rgba(255,255,255,.75)'}}>Draw any size circle on the map — instantly see all properties inside</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Breaks out stops and counts by treatment type automatically</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Shows what&apos;s already scheduled vs. what&apos;s still on the waiting list</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>One click to schedule all selected properties to a date and truck</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Tighten your routes geographically — stop wasting fuel on scattered stops</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Works across all your treatment types simultaneously in one view</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Cuts route-building time from an hour to under 5 minutes</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>No competitor has this. It doesn&apos;t exist anywhere else in pest control software.</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>Lasso — Route Selector</div>
            <div style={{background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'10px', padding:'20px', marginBottom:'14px', position:'relative', minHeight:'130px', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}}>
              <div style={{position:'absolute', top:'14px', left:'18px', right:'18px', bottom:'14px', border:'2.5px dashed #e07820', borderRadius:'50%', opacity:.7}}></div>
              <div style={{display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center', position:'relative', zIndex:1}}>
                {['s','s','u','s','s','s','u','s','s','u','s','s','s','u','s','s','s','u','s'].map((t,i) => (
                  <div key={i} style={{width:'11px', height:'11px', borderRadius:'50%', flexShrink:0, background: t==='s' ? '#e07820' : 'rgba(255,255,255,.2)', boxShadow: t==='s' ? '0 0 0 3px rgba(224,120,32,.3)' : 'none'}}></div>
                ))}
              </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px'}}><div style={{color:'#e07820', fontSize:'18px', fontWeight:800}}>14</div><div style={{color:'rgba(255,255,255,.42)', fontSize:'11px', marginTop:'1px'}}>Stops Selected</div></div>
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px'}}><div style={{color:'#e07820', fontSize:'18px', fontWeight:800}}>19</div><div style={{color:'rgba(255,255,255,.42)', fontSize:'11px', marginTop:'1px'}}>Total Treatments</div></div>
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px'}}><div style={{color:'#e07820', fontSize:'18px', fontWeight:800}}>8</div><div style={{color:'rgba(255,255,255,.42)', fontSize:'11px', marginTop:'1px'}}>General Pest</div></div>
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px'}}><div style={{color:'#e07820', fontSize:'18px', fontWeight:800}}>6</div><div style={{color:'rgba(255,255,255,.42)', fontSize:'11px', marginTop:'1px'}}>Mosquito Barrier</div></div>
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', gridColumn:'span 2'}}><div style={{color:'#fff', fontSize:'13px', fontWeight:600}}>Quarterly · 8 &nbsp;|&nbsp; Mosquito · 6 &nbsp;|&nbsp; Rodent · 5</div><div style={{color:'rgba(255,255,255,.42)', fontSize:'11px', marginTop:'1px'}}>Breakdown by Treatment Type</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* EASIER TO USE */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Simplicity</span>
          <h2 className="section-title">The Most Capable Pest Control Software Is Also the Easiest to Learn</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>Most powerful software is complicated. SprayBossPro is the exception. Every screen was designed by people who ran spray routes — not UX designers who&apos;ve never been near a service truck. Your team will be using it confidently on day one.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'24px', maxWidth:'1100px', margin:'0 auto'}}>
          {[
            {n:'01', title:'Set Up in One Afternoon', body:'Add your treatment types, import your clients and properties, set up automated alerts, and connect Stripe — most owners are fully operational the same day they sign up. No onboarding consultant, no 90-day implementation, no help desk ticket required.'},
            {n:'02', title:'One Screen Does Everything', body:'Scheduling, dispatch, waiting list, map, and chemical log are all connected. You\'re not bouncing between five different modules. Pull up the dispatch board and everything you need for the day is right there in a single view — no tab-switching, no hunting.'},
            {n:'03', title:'Your Techs Learn It in Minutes', body:'The mobile app shows technicians exactly what they need and nothing they don\'t. Their stops for the day, the property notes, the treatment history, and the complete button. No training videos, no IT setup, no frustrated crew calling the office for help.'},
            {n:'04', title:'Automation Runs Without You', body:'Set up your SMS alerts, estimate follow-ups, and payment reminders once. After that, SprayBossPro handles every notification, every follow-up text, and every review request automatically — whether you\'re on a route, at the office, or on a day off.'},
          ].map(({n, title, body}) => (
            <div key={n} style={{background:'#fff', border:'1.5px solid var(--border)', borderRadius:'12px', padding:'30px 26px'}}>
              <div style={{fontSize:'40px', fontWeight:800, color:'var(--orange)', opacity:.25, lineHeight:1, marginBottom:'12px'}}>{n}</div>
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
          <h2 className="section-title">Most Software Was Built for Plumbers. Not Pest Control.</h2>
          <p className="section-sub">Pest control is a recurring service business. You&apos;re not doing a one-time fix — you&apos;re managing quarterly treatments, annual plans, re-service calls, chemical logs, and a state inspector who can show up at any time. Your software needs to handle all of that.</p>
        </div>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <div style={{background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'36px 40px', borderLeft:'5px solid var(--orange)'}}>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8, marginBottom:'16px'}}>We ran our own routes for years before building SprayBossPro. We used every piece of software on the market — the big names, the field service apps, the ones that promised they &quot;work for any industry.&quot; None of them tracked chemicals the way regulators actually require. None of them had a waiting list that showed us how much work was ready before we built a route. None of them understood that a pest control business runs on recurring service, not one-off jobs.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8, marginBottom:'16px'}}>We built SprayBossPro because we needed it. <strong>Every feature exists because someone on a real pest control route needed it.</strong> Not because a software company thought it sounded good.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8}}>If you run mosquito treatments, general pest, rodent control, termite inspections, or any combination — SprayBossPro was built for the way you work.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="centered" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <span className="section-label">Built for Pest Control</span>
          <h2 className="section-title">Every Feature Your Operation Needs</h2>
          <p className="section-sub">From your first estimate to your compliance report at the end of the year — SprayBossPro covers the full lifecycle of a pest control business.</p>
        </div>
        <div className="feature-grid">
          {[
            {icon:'📋', title:'Service Waiting List', body:'See exactly which properties are due for each treatment type — General Pest, Mosquito, Rodent, Termite Inspection — before you build a single route. Know what\'s waiting and how much of it before you make a call.'},
            {icon:'🔁', title:'Recurring Treatment Plans', body:'Set up quarterly, bi-monthly, or custom recurring schedules for any property. SprayBossPro tracks when each stop is due and flags it automatically — no spreadsheet, no calendar reminders.'},
            {icon:'🧪', title:'Chemical Application Log', body:'Every application is logged with product name, mix rate, area treated, gallons used, weather conditions, and technician license. Compliance reports print in under 30 seconds.'},
            {icon:'🗺️', title:'Live Route Map', body:'Every scheduled stop pinned on a map. Drag to reorder, build tight geographic clusters, and cut drive time before your tech ever leaves the shop.'},
            {icon:'💬', title:'Automated Customer Alerts', body:'Texts go out automatically when a service is scheduled, when your tech is en route, and when the job is done. Customers always know what\'s happening — you never have to make a call.'},
            {icon:'💰', title:'Estimates & Proposals', body:'Build a pest control estimate in minutes, email it with one click, and let the client accept online. 3 automated follow-ups go out if they don\'t respond — SprayBossPro chases the deal for you.'},
            {icon:'💳', title:'Card-on-File Billing', body:'Store cards via Stripe. Charge after each treatment, send invoices, and let SprayBossPro send 3 automated payment reminders if an invoice goes unpaid. Stop chasing checks.'},
            {icon:'📱', title:'Mobile App for Technicians', body:'Techs see their stops for the day on their phone. Mark complete, log chemicals, skip, or reschedule — without calling the office. Everything syncs in real time.'},
            {icon:'🏠', title:'Property Profiles', body:'Every property has its own record — service history, full chemical log, notes, photos, square footage, and GPS coordinates. Everything tied to the address, not just the customer name.'},
            {icon:'💬', title:'Two-Way SMS Inbox', body:'Customers text you, you text them — all inside SprayBossPro. Full conversation history by contact. No more mixing business texts with your personal phone.'},
            {icon:'📦', title:'Service Package Plans', body:'Create annual or multi-treatment packages, assign clients to them, and track how many treatments remain. SprayBossPro alerts you when a package is coming up for renewal.'},
            {icon:'⭐', title:'Automated Review Requests', body:'After every completed service, a Google review request goes out automatically. More reviews, zero effort.'},
            {icon:'👥', title:'Client & Lead Management', body:'Manage active customers and open prospects in the same place. Full search, contact history, estimate records, and service logs — all tied together.'},
            {icon:'📄', title:'Invoice Management', body:'Filter invoices by unpaid, partial, paid, or overdue. Full payment history with method, date, and amount. Convert accepted estimates to invoices with one click.'},
            {icon:'👑', title:'Role-Based Team Access', body:'Owner, Manager, Office, Technician, and Mobile roles. Control exactly what each person on your team can see — from full access to field-only.'},
            {icon:'🚛', title:'Truck & Equipment Tracking', body:'Assign vehicles to routes and track which truck handled each stop. Know exactly what\'s on every truck every day.'},
            {icon:'⏱️', title:'Employee Hour Tracking', body:'Track hours per job and generate payroll-ready reports. Know what you owe before payday without a separate system.'},
            {icon:'📊', title:'Dashboard & Reports', body:'See today\'s revenue, completed stops, outstanding invoices, and more the moment you log in. Custom stat cards show what matters most to your business.'},
            {icon:'🔔', title:'10+ Alert Types', body:'Service scheduled, completed, skipped, rescheduled — plus estimate sent, estimate accepted, payment reminder, review request, and more. All automated and fully customizable.'},
            {icon:'👥', title:'Unlimited Users', body:'Add every tech, office staff member, and manager at no extra cost. No per-seat pricing. Unlimited users included in the flat monthly rate.'},
            {icon:'🏢', title:'Unlimited Clients & Properties', body:'50 accounts or 5,000 — no caps, no upgrade tiers. One flat price covers everything no matter how big you grow.'},
            {icon:'🏷️', title:'Discounts & Sales Tax', body:'Apply percentage or flat discounts to any estimate. Set tax rates and SprayBossPro calculates and tracks tax on every invoice automatically.'},
          ].map(({icon, title, body}) => (
            <div key={title} className="feature-card">
              <span className="feature-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CHEMICAL COMPLIANCE */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Compliance</span>
            <h2>Chemical Logs That Hold Up to Any Inspector</h2>
            <p>Every state requires pesticide application records. SprayBossPro logs every application automatically when your tech marks a job complete — and you can pull a print-ready compliance report for any date range, product, technician, or property in under 30 seconds.</p>
            <ul className="check-list">
              <li>Product name, EPA registration, mix rate, and gallons per stop</li>
              <li>Target pest and treatment area logged per job</li>
              <li>Weather conditions at time of application</li>
              <li>Technician name and license number on every record</li>
              <li>Filter by product, property, tech, or date range</li>
              <li>Print-ready compliance reports — no formatting needed</li>
              <li>Full product catalog with mix recipes stored in the system</li>
              <li>Everything tied to the property address for fast lookup</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Chemical Log — This Month</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px'}}>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}><div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>184</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Applications</div></div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}><div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>112</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Properties</div></div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}><div style={{color:'var(--orange)', fontSize:'20px', fontWeight:700}}>6</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Products Used</div></div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}><div style={{color:'var(--orange)', fontSize:'20px', fontWeight:700}}>328</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Gallons Applied</div></div>
            </div>
            {[
              {color:'#22c55e', label:'Temprid SC · General Pest', sub:'J. Smith · Sunny · 82°F · 0.4 oz/gal', badge:'3 gal', badgeBg:'#16a34a'},
              {color:'#e07820', label:'Bifen IT · Mosquito Barrier', sub:'M. Torres · Partly Cloudy', badge:'5 gal', badgeBg:'#e07820'},
              {color:'#5bbfff', label:'Talstar P · Perimeter', sub:'R. Davis · Clear · 78°F', badge:'2 gal', badgeBg:'#2272c3'},
            ].map(({color, label, sub, badge, badgeBg}) => (
              <div key={label} style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{width:'10px', height:'10px', borderRadius:'50%', background:color, flexShrink:0}}></div>
                <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>{label}</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>{sub}</div></div>
                <div style={{marginLeft:'auto', background:badgeBg, color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px', flexShrink:0}}>{badge}</div>
              </div>
            ))}
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'var(--orange)', fontSize:'15px', fontWeight:700}}>Ready for any inspection.</div>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'12px', marginTop:'4px'}}>Print a full report in under 30 seconds.</div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURRING TREATMENTS */}
      <section>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Recurring Treatments</span>
            <h2>Never Miss a Treatment. Never Chase a Renewal.</h2>
            <p>Pest control runs on recurring revenue — and SprayBossPro is built around it. Set a schedule for any property, track how many treatments remain in a package, and let SprayBossPro alert you and the customer when it&apos;s time for the next visit. For a closer look at how package plan tracking drives renewal timing across a full book of recurring accounts, read <a href="/blogs/why-pest-control-software-recurring-treatments" style={{color:'var(--orange)', fontWeight:600}}>Why Pest Control Businesses Need Software Built for Recurring Treatments</a>.</p>
            <ul className="check-list">
              <li>Set recurring schedules by service type per property</li>
              <li>Waiting list shows all properties due for each treatment</li>
              <li>Package plans track remaining treatments automatically</li>
              <li>Renewal alerts sent to you before a package expires</li>
              <li>Re-service tracking — log callbacks tied to original job</li>
              <li>Automated &quot;your next service is scheduled&quot; texts to customers</li>
              <li>Full service history on every property going back to day one</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Waiting List — By Service Type</div>
            {[
              {color:'#22c55e', label:'General Pest — Quarterly', sub:'38 properties due', badgeBg:'#16a34a'},
              {color:'#e07820', label:'Mosquito Barrier', sub:'24 properties due', badgeBg:'#e07820'},
              {color:'#5bbfff', label:'Rodent Control — Monthly', sub:'11 properties due', badgeBg:'#2272c3'},
              {color:'#e07820', label:'Termite Inspection', sub:'6 properties due', badgeBg:'#e07820'},
            ].map(({color, label, sub, badgeBg}) => (
              <div key={label} style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{width:'10px', height:'10px', borderRadius:'50%', background:color, flexShrink:0}}></div>
                <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>{label}</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>{sub}</div></div>
                <div style={{marginLeft:'auto', background:badgeBg, color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>Schedule</div>
              </div>
            ))}
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'var(--orange)', fontSize:'15px', fontWeight:700}}>Everything due. Nothing missed.</div>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'12px', marginTop:'4px'}}>Schedule from the waiting list in one click.</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">One Flat Price. Everything Included.</h2>
          <p className="section-sub">No per-seat fees. No add-ons. No contracts. Just $129/month for your entire operation.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="lc-price-card featured">
            <div className="featured-badge">Everything Included</div>
            <div className="price-tier">One Plan. No Surprises.</div>
            <div style={{fontSize:'48px', fontWeight:800, color:'var(--text)', lineHeight:1}}><sup style={{fontSize:'22px', verticalAlign:'super'}}>$</sup>129</div>
            <div style={{color:'var(--muted)', fontSize:'13px', marginBottom:'24px', marginTop:'4px'}}>per month</div>
            <div style={{color:'var(--muted)', fontSize:'14px', marginBottom:'24px', lineHeight:1.5}}>Every feature. Unlimited clients, properties, employees, and users. No tiers, no locked features, no per-seat fees.</div>
            <ul className="price-features">
              <li>Unlimited Clients, Properties &amp; Leads</li>
              <li>Unlimited Employees &amp; Users</li>
              <li>Full Scheduling, Dispatch &amp; Route Map</li>
              <li>Recurring Treatment Plans &amp; Package Tracking</li>
              <li>Estimates, Invoices &amp; Stripe Payments</li>
              <li>Two-Way SMS &amp; Automated Alerts</li>
              <li>Chemical Tracking &amp; Compliance Reports</li>
              <li>Mobile App for Technicians</li>
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
          <h2 className="section-title" style={{marginBottom:'48px'}}>Pest Control Software — Common Questions</h2>
          {[
            {q:'Does SprayBossPro work for pest control businesses?', a:'Yes. SprayBossPro is built for recurring pest control programs — quarterly, bi-monthly, monthly, and custom intervals. It handles route scheduling, chemical compliance logs, automated SMS alerts, estimate-to-program conversion, and card-on-file payments for recurring treatments.'},
            {q:'Can I manage quarterly, bi-monthly, and monthly programs at the same time?', a:'Yes. SprayBossPro supports multiple program intervals simultaneously. Each customer can be on a different schedule, and the waiting list tracks every account across all program types. When a treatment is completed, the next one is automatically placed back at the correct interval — no manual rebooking.'},
            {q:'Does it handle chemical compliance logs for pest control?', a:'Yes. Every pest control treatment logs the product, EPA registration number, application rate, target pest, treatment areas (interior/exterior), and applicator license. The compliance report generates a formatted log suitable for state inspection — no paper records needed.'},
            {q:'Does SprayBossPro send automated SMS for pest control visits?', a:'Yes. Pre-built SMS alerts include appointment reminders, on-the-way notifications, service completion messages, and re-entry interval instructions. Alerts fire automatically from dispatch and completion events — configured once, sent on every job.'},
            {q:'Can I manage multiple pest control technicians?', a:'Yes. SprayBossPro supports unlimited technicians. The dispatch board assigns routes to specific technicians, and each uses the mobile app to see their stops, property notes, and chemical log form. No per-user fees regardless of crew size.'},
            {q:'How much does SprayBossPro cost for pest control?', a:'$129/month, flat. Every feature — route scheduling, compliance logs, SMS alerts, card payments — is included at one price. No per-user fees, no add-ons. 14-day free trial, no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>SprayBossPro handles pest control alongside lawn care, mosquito spray, and every other spray service from one platform — <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full platform overview</a>.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Stop Running Your Pest Control Business<br />on Software Built for Someone Else.</h2>
        <p>SprayBossPro is built by people who&apos;ve run real spray routes. Try it free for 14 days — no credit card required.</p>
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
