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
          <input id={`sbp${n}-company`} type="text" placeholder="Smith Lawn Care" className="sbp-input" />
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

export default function MosquitoSpraySoftware() {
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
        <div className="hero-badge">Mosquito Spray Software</div>
        <h1>The Software Built for<br /><span>Mosquito Spray Businesses.</span></h1>
        <p>Schedule mosquito treatments, manage recurring spray programs, build routes by geography and sq ft or linear ft, send automated appointment alerts, and log every application — all in one platform designed for lawn care and pest control companies that spray for mosquitoes.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial — $129/Month</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Per month — everything included</div></div>
          <div><div className="hero-stat-val">Unlimited</div><div className="hero-stat-lbl">Technicians and users</div></div>
          <div><div className="hero-stat-val">14-Day</div><div className="hero-stat-lbl">Free trial — no credit card</div></div>
          <div><div className="hero-stat-val">Today</div><div className="hero-stat-lbl">Start scheduling mosquito routes</div></div>
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
          alt="LandscapeBossPro mosquito spray software showing the waiting list, circle-map route builder, and mobile dispatch on laptop and phone"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* WHAT IT DOES */}
      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Mosquito Treatment Software</span>
          <h2 className="section-title">Everything a Mosquito Spray Business Needs to Schedule, Route, and Manage Treatments</h2>
          <p className="section-sub" style={{maxWidth:'800px'}}>LandscapeBossPro is field service software built specifically for lawn care and pest control businesses that apply spray treatments. Every feature is designed around how a mosquito spray company actually operates — recurring program management, sq ft or linear ft-based route planning, chemical application logs, and automated customer communication.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🗺️</div>
            <h3>Lasso — Build Mosquito Routes by Drawing a Circle</h3>
            <p>Draw a circle on any area of your map and instantly see every property with a mosquito treatment due inside — total stops, total sq ft or linear ft, and route revenue. Add them all to a route in one click. Stop building mosquito routes one address at a time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Mosquito Sq Ft or Linear Ft Waiting List</h3>
            <p>Before you build a route, see exactly how many sq ft or linear ft of mosquito service are waiting to be scheduled. LandscapeBossPro organizes your waiting list by service type — Mosquito 3, Mosquito 4, any program name you use — so you know exactly what&apos;s pending.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Recurring Mosquito Program Management</h3>
            <p>Mosquito spray businesses run recurring treatment programs — monthly, every 21 days, seasonal. When a mosquito treatment is marked complete, LandscapeBossPro automatically puts the next scheduled treatment back on the waiting list. Programs manage themselves.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Automated Mosquito Treatment Alerts</h3>
            <p>Send automated SMS alerts when a mosquito treatment is scheduled, when your technician is en route, and when service is complete. Pre-built alert templates for every touchpoint — set them up once and they send automatically on every job.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧪</div>
            <h3>Mosquito Application Compliance Logs</h3>
            <p>Log every mosquito spray application — product name, application rate, gallons applied, total area treated, weather conditions at time of application, and applicator license number. Generate print-ready compliance reports whenever you need them.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Mosquito Package Plans &amp; Renewals</h3>
            <p>Sell seasonal mosquito packages — 6-treatment programs, monthly plans, or custom service packages. LandscapeBossPro tracks treatments remaining, notifies you when packages expire, and makes renewing a customer&apos;s mosquito program a two-click process.</p>
          </div>
        </div>
      </section>

      {/* LASSO */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Lasso — Route Building for Mosquito Spray</span>
            <h2>Draw a Circle. See Every Mosquito Treatment Due Inside. Build the Route.</h2>
            <p>Most mosquito spray businesses build routes the slow way — searching the schedule, pulling up addresses one by one, trying to remember which neighborhoods are clustered together. Lasso changes that.</p>
            <p>Open your map, draw a circle around any area — a neighborhood, a subdivision, a zip code — and LandscapeBossPro instantly shows you every property with a mosquito treatment due inside that boundary: how many stops, how many sq ft or linear ft, and how much revenue.</p>
            <ul className="check-list">
              <li>Draw any shape on the map — no fixed zones</li>
              <li>Instantly see stops, sq ft or linear ft, and revenue inside the boundary</li>
              <li>Filter by service type — mosquito only, or any combination</li>
              <li>Add all selected properties to a route in one click</li>
              <li>Optimize the route for drive time automatically</li>
              <li>Share the route to your technician&apos;s mobile app</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
              <div style={{color:'rgba(255,255,255,.4)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px'}}>Lasso Selection — North Side</div>
              <div style={{color:'#fff', fontSize:'13px', fontWeight:700}}>Mosquito 3 · 8 stops</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {[
                {n:1, addr:'142 Maplewood Dr', detail:'Mosquito 3 · Due today', sqft:'6,200 ft²'},
                {n:2, addr:'218 Birchwood Ln', detail:'Mosquito 3 · Due today', sqft:'8,450 ft²'},
                {n:3, addr:'304 Cedar Ridge Ct', detail:'Mosquito 3 · Due today', sqft:'5,800 ft²'},
                {n:4, addr:'91 Willow Creek Rd', detail:'Mosquito 3 · Due today', sqft:'11,200 ft²'},
              ].map(({n, addr, detail, sqft}) => (
                <div key={n} style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'11px 14px', display:'flex', alignItems:'center', gap:'12px'}}>
                  <div style={{background:'rgba(27,110,59,.2)', border:'1px solid rgba(27,110,59,.4)', color:'var(--orange)', fontSize:'11px', fontWeight:700, width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{n}</div>
                  <div style={{flex:1}}>
                    <div style={{color:'rgba(255,255,255,.8)', fontSize:'12px', fontWeight:600}}>{addr}</div>
                    <div style={{color:'rgba(255,255,255,.35)', fontSize:'10px', marginTop:'1px'}}>{detail}</div>
                  </div>
                  <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', fontWeight:600, whiteSpace:'nowrap'}}>{sqft}</div>
                </div>
              ))}
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'11px 14px', display:'flex', alignItems:'center', gap:'12px', opacity:.55}}>
                <div style={{background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)', fontSize:'11px', fontWeight:700, width:'24px', height:'24px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>+</div>
                <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.3)', fontSize:'12px', fontWeight:600}}>4 more properties…</div></div>
                <div style={{color:'rgba(255,255,255,.3)', fontSize:'11px', fontWeight:600}}>31,400 ft²</div>
              </div>
            </div>
            <div style={{background:'rgba(27,110,59,.1)', border:'1px solid rgba(27,110,59,.25)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'4px'}}>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Total Selected</div>
              <div style={{color:'var(--orange)', fontSize:'14px', fontWeight:700}}>8 stops · 63,050 ft² · $1,120</div>
            </div>
          </div>
        </div>
      </section>

      {/* WAITING LIST */}
      <section>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Mosquito Sq Ft or Linear Ft Waiting List</span>
            <h2>Know Exactly How Much Mosquito Treatment Is Waiting — Before You Build a Single Route.</h2>
            <p>Before you open the map and start building a mosquito spray route, LandscapeBossPro shows you a waiting list organized by service type and total square footage. You can see at a glance how much Mosquito 3 is due, how much Mosquito 4 is waiting, and how many properties of each type are in the queue.</p>
            <p>That number tells you what your day needs to look like — how many routes to build, how many technicians to send out, and which service type to prioritize. No more guessing. No more counting addresses manually.</p>
            <ul className="check-list">
              <li>Waiting list organized by service type — Mosquito 3, Mosquito 4, any name you use</li>
              <li>Shows total sq ft or linear ft and total stops waiting per service type</li>
              <li>Updates in real time as treatments are completed and rescheduled</li>
              <li>Helps you plan crew size before building routes</li>
              <li>Separate waiting lists for each spray service you offer</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Waiting List — Services Due</div>
            <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
              {[
                {svc:'Mosquito 3', count:'14 properties waiting', sqft:'127,400 ft²', active:true},
                {svc:'Mosquito 4', count:'8 properties waiting', sqft:'74,800 ft²', active:true},
                {svc:'Lawn Care 4', count:'22 properties waiting', sqft:'198,600 ft²', active:false},
                {svc:'Lawn Insect 3', count:'6 properties waiting', sqft:'53,200 ft²', active:false},
                {svc:'Flower Beds 4', count:'4 properties waiting', sqft:'18,900 ft²', active:false},
              ].map(({svc, count, sqft, active}) => (
                <div key={svc} style={{background: active ? 'rgba(27,110,59,.07)' : 'rgba(255,255,255,.06)', border:`1px solid ${active ? 'rgba(27,110,59,.35)' : 'rgba(255,255,255,.09)'}`, borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div>
                    <div style={{color:'rgba(255,255,255,.75)', fontSize:'13px', fontWeight:600}}>{svc}</div>
                    <div style={{color:'rgba(255,255,255,.4)', fontSize:'11px', marginTop:'2px'}}>{count}</div>
                  </div>
                  <div style={{color: active ? 'var(--orange)' : 'rgba(255,255,255,.4)', fontSize:'13px', fontWeight:700}}>{sqft}</div>
                </div>
              ))}
            </div>
            <div style={{marginTop:'14px', background:'rgba(27,110,59,.08)', border:'1px solid rgba(27,110,59,.2)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Mosquito Total</div>
              <div style={{color:'var(--orange)', fontSize:'13px', fontWeight:700}}>22 stops · 202,200 ft²</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 64px'}}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">From Waiting List to Completed Mosquito Routes — Same Day</h2>
          <p className="section-sub">LandscapeBossPro is designed so that building and completing a full day of mosquito spray routes takes minutes, not hours. For a closer look at how one platform handles the waiting list, circle routing, mobile dispatch, compliance logs, and automated SMS end to end, read <a href="/blogs/run-mosquito-spray-business-single-platform" style={{color:'var(--orange)', fontWeight:600}}>How to Run a Mosquito Spray Business From a Single Platform</a>.</p>
        </div>
        <div className="steps-grid">
          <div className="step-box"><div className="step-circle">1</div><h3>Check the Waiting List</h3><p>Open LandscapeBossPro and see exactly how many sq ft or linear ft of mosquito treatment is waiting — organized by service type. Know your day before you build anything.</p></div>
          <div className="step-box"><div className="step-circle">2</div><h3>Lasso a Neighborhood</h3><p>Open the map and draw a circle around any area. See all properties with mosquito treatment due inside — stops, sq ft or linear ft, revenue — and add them to a route.</p></div>
          <div className="step-box"><div className="step-circle">3</div><h3>Send to Your Technician</h3><p>Push the route to your technician&apos;s mobile app. They see the stops in order, property details, access notes, and the chemical application log for each address.</p></div>
          <div className="step-box"><div className="step-circle">4</div><h3>Treatment Complete — Next One Scheduled</h3><p>When the technician marks a mosquito treatment complete, LandscapeBossPro automatically schedules the next treatment and puts it back on the waiting list.</p></div>
        </div>
      </section>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Every Feature a Mosquito Spray Business Needs.<br /><span>$129/Month. Nothing Locked Behind Upgrades.</span></h2>
        <p>LandscapeBossPro isn&apos;t a general field service platform that happens to work for mosquito spray. It&apos;s built specifically for businesses that apply chemical treatments — with the route planning, compliance logging, and program management that mosquito spray companies actually use.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">🗺️</div><h4>Lasso Circle Map Route Builder</h4><p>Draw a circle on your map and see every mosquito treatment due inside — stops, sq ft or linear ft, revenue. Build a full day of mosquito routes in minutes instead of hours.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📋</div><h4>Sq Ft or Linear Ft Waiting List by Service</h4><p>See how many sq ft or linear ft of Mosquito 3, Mosquito 4, and every other service type is waiting to be scheduled. Know your workload before you build a single route.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔄</div><h4>Auto-Rescheduling Mosquito Programs</h4><p>When a mosquito treatment is complete, the next one automatically goes back on the waiting list. Recurring programs manage themselves — no manual rescheduling.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Automated SMS Alerts</h4><p>Appointment reminders, on-the-way alerts, and completion notifications sent automatically on every mosquito spray job. 10+ pre-built alert types included.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🧪</div><h4>Chemical Application Logs</h4><p>Log product, rate, gallons, area treated, weather, and applicator license on every mosquito application. Print-ready compliance reports on demand.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Mosquito Package Programs</h4><p>Sell seasonal mosquito programs and track treatments remaining. LandscapeBossPro notifies you before packages expire and makes renewals fast.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Technicians</h4><p>Your technicians see their mosquito route, property details, application notes, and chemical log form on their phone. No paper, no clipboard.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Card-on-File Payments</h4><p>Collect payment automatically after each mosquito treatment. Card-on-file payments included at $129/month — no payment add-on required.</p></div>
          <div className="premium-card"><div className="premium-card-icon">👥</div><h4>Unlimited Technicians</h4><p>Add as many technicians as you run mosquito routes. LandscapeBossPro doesn&apos;t cap users. Run 1 truck or 10 — the price stays the same.</p></div>
        </div>
      </div>

      {/* SMS ALERTS */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Automated Customer Communication</span>
            <h2>Automated SMS Alerts for Every Mosquito Treatment — Set Up Once, Send Forever.</h2>
            <p>Mosquito spray customers want to know when their treatment is coming and what to do after the technician leaves. LandscapeBossPro includes pre-built SMS alert templates for every touchpoint in the mosquito treatment process — appointment reminders the day before, on-the-way notifications when your technician is 30 minutes out, and completion messages with any re-entry instructions.</p>
            <ul className="check-list">
              <li>Day-before appointment reminder — &quot;Your mosquito treatment is tomorrow&quot;</li>
              <li>On-the-way alert — &quot;Your technician is 30 minutes away&quot;</li>
              <li>Service complete notification with re-entry time if needed</li>
              <li>Renewal reminder when a mosquito program is about to expire</li>
              <li>Two-way SMS inbox — customers can reply and you see every thread</li>
              <li>500 outbound SMS messages per month included — no add-on fee</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'14px'}}>SMS Alerts — Mosquito Treatment</div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              {[
                {label:'Day Before Reminder', msg:'"Hi Sarah — your Mosquito 3 treatment is scheduled for tomorrow between 9–11am. Please ensure pets are kept indoors during service."'},
                {label:'On-the-Way Alert', msg:'"Your technician is about 30 minutes away for your mosquito treatment. Please unlock any gates before they arrive."'},
                {label:'Service Complete', msg:'"Your mosquito treatment is complete! Please keep pets off treated areas for 30 minutes. Your next treatment is in 21 days."'},
              ].map(({label, msg}) => (
                <div key={label} style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px'}}>
                  <div style={{color:'var(--orange)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'6px'}}>{label}</div>
                  <div style={{color:'rgba(255,255,255,.7)', fontSize:'12px', lineHeight:1.6}}>{msg}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">$129/Month. Every Mosquito Spray Feature Included.</h2>
          <p className="section-sub">One plan. No add-ons for SMS, route building, or compliance logs. No user caps. No per-technician fees.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="lc-price-card featured">
            <div className="featured-badge">Everything Included — No Add-Ons</div>
            <div className="price-tier">Mosquito Spray Software — One Plan</div>
            <div style={{fontSize:'48px', fontWeight:800, color:'var(--text)', lineHeight:1}}><sup style={{fontSize:'22px', verticalAlign:'super'}}>$</sup>129</div>
            <div style={{color:'var(--muted)', fontSize:'13px', marginBottom:'24px', marginTop:'4px'}}>per month — cancel anytime</div>
            <ul className="price-features">
              <li>Lasso Circle Map Route Builder for Mosquito Routes</li>
              <li>Sq Ft or Linear Ft Waiting List by Service Type</li>
              <li>Recurring Mosquito Program Management</li>
              <li>Chemical Application Compliance Logs</li>
              <li>Automated SMS Alerts — 10+ pre-built types</li>
              <li>Two-Way SMS Customer Inbox</li>
              <li>Package Plans &amp; Renewal Tracking</li>
              <li>Full Scheduling, Dispatch &amp; Route Map</li>
              <li>Estimates, Invoices &amp; Card-on-File Payments</li>
              <li>Mobile App for Technicians</li>
              <li>Unlimited Technicians — no per-user fees</li>
              <li>500 Outbound SMS/month included</li>
              <li>14-day free trial — no credit card required</li>
            </ul>
            <button onClick={(e) => openSignupModal(2, e.currentTarget as HTMLElement)} className="price-btn price-btn-primary">Start Your 14-Day Free Trial</button>
          </div>
        </div>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'13px', marginTop:'32px'}}>No contracts. No add-ons. No per-technician fees. Cancel anytime.</p>
      </section>

      {/* FAQ */}
      <section style={{background:'#fff'}}>
        <div style={{maxWidth:'860px', margin:'0 auto', padding:'80px 40px'}}>
          <span className="section-label">FAQ</span>
          <h2 className="section-title" style={{marginBottom:'48px'}}>Mosquito Spray Software — Common Questions</h2>
          {[
            {q:'Does LandscapeBossPro work specifically for mosquito spray businesses?', a:'Yes. LandscapeBossPro is purpose-built for spray businesses including mosquito barrier spray. It has 21-day auto-interval scheduling, sq ft and linear ft measurement fields per property, a waiting list sorted by treatment due date, circle-map route building, and chemical application logs with EPA registration numbers — built around the mosquito spray model, not adapted from a generic tool.'},
            {q:'How does LandscapeBossPro handle the 21-day treatment interval?', a:'When a technician logs a completion, LandscapeBossPro automatically calculates the next due date (21 days from completion) and places the account back on the waiting list. No manual rebooking required. The account appears ready to schedule when it\'s due, with all property details and pricing pre-populated.'},
            {q:'Can I track chemical application compliance for mosquito spray?', a:'Yes. LandscapeBossPro logs the product, application rate, EPA registration number, area treated, weather conditions, and applicator license for every treatment. The chemical tracking report generates a print-ready compliance document on demand — no separate paper logs needed.'},
            {q:'Does LandscapeBossPro send automated SMS to mosquito spray customers?', a:'Yes. Pre-built SMS alert types include day-before appointment reminders, on-the-way notifications, and post-service completion messages with re-entry interval instructions. Alerts fire automatically when the technician dispatches or logs completion. 500 outbound SMS messages per month are included at no extra charge.'},
            {q:'Can I manage multiple trucks from one account?', a:'Yes. LandscapeBossPro supports unlimited technicians and multiple trucks — the price stays at $129/month regardless of crew size. The waiting list and dispatch board show all accounts across all trucks and can be assigned to specific technicians per route day.'},
            {q:'How much does LandscapeBossPro cost for a mosquito spray business?', a:'$129/month, flat. No per-user fees, no SMS add-ons, no extra charge for chemical logs or route building. Every feature is included. There\'s a 14-day free trial with no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>LandscapeBossPro is purpose-built mosquito spray software — <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full platform overview</a> to learn everything that's included.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Ready to Run Mosquito Spray Routes<br /><span style={{color:'var(--orange)'}}>The Way They Should Be Run?</span></h2>
        <p>LandscapeBossPro is $129/month — schedule mosquito treatments, build routes with Lasso, log every application, and send automated SMS alerts from day one. No add-ons required.</p>
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
