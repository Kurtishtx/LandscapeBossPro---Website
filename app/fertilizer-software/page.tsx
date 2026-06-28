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

export default function FertilizerSoftware() {
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
        <div className="hero-badge">Fertilizer Software for Lawn Care Companies</div>
        <h1>Fertilizer Software That Tracks Every Round,<br /><span>Logs Every Application, and Schedules the Next.</span></h1>
        <p>LandscapeBossPro tracks 5-round and 6-round fertilizer programs from start to finish. Log product name, EPA reg number, application rate per 1,000 sq ft, and applicator license on every visit. When a round is completed, the next round reschedules itself on the waiting list automatically. $129/month, everything included.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial — $129/Month</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Per month — everything included</div></div>
          <div><div className="hero-stat-val">5 &amp; 6</div><div className="hero-stat-lbl">Round program tracking built-in</div></div>
          <div><div className="hero-stat-val">14-Day</div><div className="hero-stat-lbl">Free trial — no credit card</div></div>
          <div><div className="hero-stat-val">0</div><div className="hero-stat-lbl">Add-ons or per-user fees</div></div>
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
          alt="LandscapeBossPro fertilizer software showing round scheduling, sq ft route building, and EPA compliance log on laptop and mobile"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* PROGRAM TYPES */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">Built for Every Type of Fertilizer Program</span>
          <h2 className="section-title">Whether You Run 5 Rounds or 6, Granular or Liquid — LandscapeBossPro Has You Covered.</h2>
          <p className="section-sub">LandscapeBossPro tracks every fertilizer program type your lawn care company runs — round-by-round scheduling, compliance logging, auto-rescheduling, and automated re-entry SMS — all in one platform at one flat price.</p>
        </div>
        <div className="audience-grid">
          <div className="audience-card">
            <div className="audience-tag">5-Round Programs</div>
            <h3>Classic 5-Round Lawn Fertilizer Program</h3>
            <p>Early spring, late spring, summer, fall, and winterizer — LandscapeBossPro tracks each round, auto-schedules the next when the previous is complete, and logs EPA reg numbers and rates on every application from the technician&apos;s phone.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">6-Round Programs</div>
            <h3>6-Round Programs with Pre-Emergent Combo</h3>
            <p>Run a 6-round fertilizer program that includes pre-emergent in rounds 1 and 2? LandscapeBossPro tracks each round individually — different products, different rates, same compliance log format — all under one customer account and one sq ft measurement.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Granular vs. Liquid</div>
            <h3>Granular, Liquid, or Mixed Application Programs</h3>
            <p>Granular programs tracked per 1,000 sq ft. Liquid programs tracked per linear ft or per gallon per 1,000 sq ft. Log the exact rate and formulation your tech used in the field — actual application data tied to the compliance record.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Multi-Property Accounts</div>
            <h3>Commercial &amp; Multi-Property Fertilizer Accounts</h3>
            <p>Manage commercial accounts with multiple properties, each on its own sq ft measurement and fertilizer program. All properties under one client account. Each gets its own waiting list entry, its own compliance log history, and its own auto-scheduled rounds.</p>
          </div>
        </div>
      </section>

      {/* COMPLIANCE LOGS */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">EPA Compliance Logs — Captured In-Field on Every Application</span>
            <h2>Log EPA Reg Numbers, Application Rates, and Sq Ft Treated on Every Fertilizer Job. At the Property.</h2>
            <p>Your technician opens the application log on their phone when they arrive and fills it out before they leave — product name, EPA registration number, application rate per 1,000 sq ft or per linear ft, total area treated, wind speed, temperature, and their applicator license number.</p>
            <p>When a state inspector shows up asking for fertilizer application records, you pull a compliance report in seconds — not binders. Filter by date range, product, property, or applicator license and print or export on demand.</p>
            <ul className="check-list">
              <li>Product name and EPA reg number required on every fertilizer application log</li>
              <li>Rate per 1,000 sq ft or per linear ft — matches your specific formulation</li>
              <li>Total area treated auto-calculated from property square footage record</li>
              <li>Wind speed, temperature, and conditions captured at time of application</li>
              <li>Applicator license number logged — required for state compliance audits</li>
              <li>Pull compliance reports by date, product, applicator, or property in seconds</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Fertilizer Application Log — Filled Out In-Field</div>
            {[
              {lbl:'Property', val:'412 Crestwood Dr — 9,400 ft²', highlight:true},
              {lbl:'Service', val:'Lawn Fertilizer — Round 5 (Winterizer)'},
              {lbl:'Product Applied', val:'Lesco Winterizer 32-0-10 SCU'},
              {lbl:'EPA Reg Number', val:'10631-119'},
              {lbl:'Rate Applied', val:'4.0 lbs / 1,000 ft² — 37.6 lbs total'},
              {lbl:'Conditions at Application', val:'Wind: 4 mph · Temp: 52°F · Clear'},
              {lbl:'Applicator License', val:'TX-LAW-20419'},
            ].map(({lbl, val, highlight}) => (
              <div key={lbl} className="log-row" style={{marginBottom:'6px', ...(highlight ? {borderColor:'rgba(27,110,59,.35)', background:'rgba(27,110,59,.07)'} : {})}}>
                <div className="log-label">{lbl}</div>
                <div className="log-value">{val}</div>
              </div>
            ))}
            <div style={{marginTop:'12px', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.25)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.4)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Log Status</div>
              <div style={{color:'#22c55e', fontSize:'12px', fontWeight:700}}>✓ Saved — Program Complete</div>
            </div>
          </div>
        </div>
      </section>

      {/* LASSO */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Lasso — Circle Map Route Builder for Fertilizer Routes</span>
            <h2>Draw a Circle Around Any Neighborhood. See Every Fertilizer Round Due Inside. Build the Route.</h2>
            <p>Open Lasso on the map, draw a circle around any neighborhood or service zone, and LandscapeBossPro shows you every property with a fertilizer treatment due inside that boundary — round number, sq ft, and route revenue all visible before you commit to the route.</p>
            <p>Filter by round — pull only Round 4 stops, only Round 5 winterizer stops, or any round combination. Select all stops, drive order gets optimized automatically, and the route is pushed to your technician&apos;s phone.</p>
            <ul className="check-list">
              <li>Draw a circle on any neighborhood, subdivision, or commercial zone</li>
              <li>See every fertilizer round due inside — round number, sq ft, revenue</li>
              <li>Filter by round — pull only Round 4 or only winterizer stops at once</li>
              <li>Drive order optimized automatically to cut windshield time and fuel costs</li>
              <li>Push route to technician&apos;s phone with one click — they see stops in order</li>
              <li>Build routes for multiple crews simultaneously without overlap</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'10px'}}>Lasso — Eastside Fertilizer Route · Round 5</div>
            <div style={{display:'flex', flexDirection:'column', gap:'7px'}}>
              {[
                {n:'1', addr:'412 Crestwood Dr', sub:'Fertilizer Round 5 · 9,400 ft² · Winterizer', rev:'$79'},
                {n:'2', addr:'88 Ridgewood Ct', sub:'Fertilizer Round 5 · 7,800 ft² · Winterizer', rev:'$67'},
                {n:'3', addr:'301 Elmwood Blvd', sub:'Fertilizer Round 5 · 11,200 ft² · Winterizer', rev:'$88'},
              ].map(({n, addr, sub, rev}) => (
                <div key={n} style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{background:'rgba(27,110,59,.2)', border:'1px solid rgba(27,110,59,.4)', color:'var(--orange)', fontSize:'10px', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{n}</div>
                  <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.8)', fontSize:'12px', fontWeight:600}}>{addr}</div><div style={{color:'rgba(255,255,255,.35)', fontSize:'10px'}}>{sub}</div></div>
                  <div style={{color:'var(--orange)', fontSize:'11px', fontWeight:700}}>{rev}</div>
                </div>
              ))}
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px', opacity:.5}}>
                <div style={{background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)', fontSize:'10px', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>+</div>
                <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.3)', fontSize:'12px'}}>19 more stops in this circle…</div></div>
                <div style={{color:'rgba(255,255,255,.3)', fontSize:'11px', fontWeight:600}}>$1,480</div>
              </div>
            </div>
            <div style={{marginTop:'10px', background:'rgba(27,110,59,.1)', border:'1px solid rgba(27,110,59,.25)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Route Total</div>
              <div style={{color:'var(--orange)', fontSize:'13px', fontWeight:700}}>22 stops · 196,600 ft² · $1,715</div>
            </div>
          </div>
        </div>
      </section>

      {/* WAITING LIST */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Waiting List — Every Fertilizer Round Due, Organized Before You Route</span>
            <h2>See Every Fertilizer Treatment Due Today — By Round, By Sq Ft, Before You Open the Map.</h2>
            <p>Before you build a single fertilizer route, LandscapeBossPro shows you a waiting list of every treatment due — organized by round number with total sq ft and total stops for each round. Round 3 summer fertilizer has 31 stops at 278,000 sq ft. Round 5 winterizer has 22 stops at 196,000 sq ft. You know the exact scope of your day before you ever open Lasso.</p>
            <p>When a round is completed, the next round schedules itself automatically at your set interval — 6 weeks, 8 weeks, whatever your program calls for. You don&apos;t touch anything between rounds.</p>
            <ul className="check-list">
              <li>Waiting list organized by fertilizer round — see all rounds due today at a glance</li>
              <li>Total sq ft and stops per round so you know how big each route needs to be</li>
              <li>Rounds auto-schedule at your set interval when the previous round is completed</li>
              <li>Overdue rounds highlighted — nothing slips through the cracks between seasons</li>
              <li>Filter by technician or crew to split routes between multiple trucks</li>
              <li>Program-complete alerts when a customer finishes their final round of the season</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Waiting List — Today&apos;s Fertilizer Queue by Round</div>
            {[
              {name:'Fertilizer Round 5 — Winterizer', sub:'22 properties · season close round', ft:'196,600 ft²', active:true},
              {name:'Fertilizer Round 4 — Fall', sub:'31 properties waiting', ft:'278,400 ft²', active:true},
              {name:'Pre-Emergent Round 2', sub:'14 properties waiting', ft:'124,200 ft²', active:false},
              {name:'Weed Control Round 3', sub:'19 properties waiting', ft:'168,800 ft²', active:false},
              {name:'Fertilizer Round 3 — Overdue', sub:'7 properties — past due date', ft:'62,400 ft²', overdue:true},
            ].map(({name, sub, ft, active, overdue}) => (
              <div key={name} className="svc-row" style={{marginBottom:'6px', ...(active ? {borderColor:'rgba(27,110,59,.35)', background:'rgba(27,110,59,.07)'} : {})}}>
                <div>
                  <div className="svc-name">{name}</div>
                  <div className="svc-sub">{sub}</div>
                </div>
                <div className="svc-ft" style={overdue ? {color:'#f87171'} : active ? {} : {color:'rgba(255,255,255,.4)'}}>{ft}</div>
              </div>
            ))}
            <div style={{marginTop:'12px', background:'rgba(27,110,59,.08)', border:'1px solid rgba(27,110,59,.2)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.4)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Total Due Today</div>
              <div style={{color:'var(--orange)', fontSize:'12px', fontWeight:700}}>93 stops across 5 round types</div>
            </div>
          </div>
        </div>
      </section>

      {/* SMS */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Automated SMS Alerts on Every Fertilizer Visit</span>
            <h2>Re-Entry Interval Texts Fire Automatically After Every Fertilizer Application. Your Team Sends Zero.</h2>
            <p>LandscapeBossPro sends a day-before service reminder the evening before every fertilizer visit, an on-the-way alert when the tech heads to the property, and a service complete notification with re-entry interval and lawn care instructions automatically when the application log is saved.</p>
            <p>Re-entry interval SMS is especially important for fertilizer programs — customers need to know when it&apos;s safe to bring kids and pets back on the lawn. LandscapeBossPro handles that communication automatically on every visit.</p>
            <ul className="check-list">
              <li>Day-before reminder fires the evening before every scheduled fertilizer visit</li>
              <li>On-the-way alert fires when the tech marks the stop started on their phone</li>
              <li>Service complete with re-entry interval fires after the compliance log is saved</li>
              <li>10+ pre-built fertilizer SMS templates — ready to use on day one</li>
              <li>Two-way inbox — all customer replies organized for your team to see</li>
              <li>500 outbound SMS/month included in $129/month flat</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'14px'}}>Fertilizer SMS Thread — Sent Automatically by LandscapeBossPro</div>
            <div className="sms-bubble sms-out">Hi Mike! Your lawn fertilizer service (Round 4 – Fall) is scheduled for tomorrow. Please mow first if needed. We&apos;ll let you know when the tech is on the way. — Green Valley Lawn</div>
            <div className="sms-label right">Day before · Sent automatically · 5:00 PM</div>
            <div className="sms-bubble sms-in">Great, thanks for the heads up!</div>
            <div className="sms-label">Mike · 5:22 PM</div>
            <div className="sms-bubble sms-out">Your lawn tech is on the way — about 20 minutes out. — Green Valley Lawn</div>
            <div className="sms-label right">On the way · Fires automatically · 9:12 AM</div>
            <div className="sms-bubble sms-out">Fertilizer Round 4 is complete! Please keep kids and pets off the lawn for 24 hours while the granules work in. Next round is in approximately 6–8 weeks. — Green Valley Lawn</div>
            <div className="sms-label right">Complete · Fires automatically when log is saved</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 64px'}}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">From Waiting List to Compliance Log — Every Fertilizer Round, Every Customer</h2>
          <p className="section-sub">LandscapeBossPro manages your fertilizer programs from the first round of the season to the final winterizer — round tracking, routing, compliance logging, and auto-SMS all handled automatically. For a closer look at how round tracking works in practice, read <a href="/blogs/track-5-round-6-round-fertilizer-programs" style={{color:'var(--orange)', fontWeight:600}}>How to Track 5-Round and 6-Round Fertilizer Programs Without Losing Count</a>.</p>
        </div>
        <div className="steps-grid">
          <div className="step-box"><div className="step-circle">1</div><h3>Check the Waiting List</h3><p>See every fertilizer round due today — organized by round number with total sq ft and stop count. Know the full scope of the day&apos;s fertilizer work before you build any routes.</p></div>
          <div className="step-box"><div className="step-circle">2</div><h3>Lasso the Neighborhood</h3><p>Draw a circle on any area of the map. See every fertilizer stop due inside — round number, sq ft, revenue. Filter by round. Pull all stops into a route and dispatch to the tech.</p></div>
          <div className="step-box"><div className="step-circle">3</div><h3>Log the Application In-Field</h3><p>Tech logs product, EPA reg number, rate per 1,000 sq ft, area treated, conditions, and applicator license at the property before leaving. Re-entry SMS fires automatically on save.</p></div>
          <div className="step-box"><div className="step-circle">4</div><h3>Auto-Schedule the Next Round</h3><p>When a round is completed, the next round auto-schedules at your set interval on the waiting list. Programs manage themselves through the entire season — no manual scheduling between rounds.</p></div>
        </div>
      </section>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Fertilizer Software Built for Lawn Care Companies That Apply Chemicals.<br /><span>$129/Month. Everything Included.</span></h2>
        <p>LandscapeBossPro isn&apos;t a generic scheduling tool with fertilizer tags added on. Round tracking, EPA compliance logs, auto-rescheduling, Lasso routing, and re-entry SMS are all built specifically for companies running recurring fertilizer programs.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">📋</div><h4>EPA Compliance Logs</h4><p>Product name, EPA reg number, rate per 1,000 sq ft, applicator license — logged in-field on every application. Print compliance reports by date, product, or applicator on demand.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔄</div><h4>Round Auto-Rescheduling</h4><p>The next round schedules itself when the previous one is completed. 5-round and 6-round programs manage themselves all season without your team manually scheduling a single treatment.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🗺️</div><h4>Lasso Circle Map Routing</h4><p>Draw a circle on any neighborhood — see every fertilizer round due inside. Filter by round. Build and dispatch a full day of routes in minutes from one map view.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📊</div><h4>Sq Ft Waiting List by Round</h4><p>See every round due today — organized by round number with total sq ft and stops. Know your full day&apos;s fertilizer scope before you build a single route.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Automated SMS Alerts</h4><p>Day-before, on-the-way, and re-entry interval complete texts fire automatically on every fertilizer visit. 10+ pre-built templates. Your team sends zero manually.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Fertilizer Package Plans</h4><p>Sell 5-round, 6-round, and custom seasonal programs as packages. Track rounds remaining per customer and alert when the final round of the season is approaching.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Technicians</h4><p>Techs see their route in order, property notes, gate codes, past service history, and the compliance log form on their phone. No paper tickets. No calls back to the office.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Card-on-File Payments</h4><p>Charge cards automatically when each fertilizer round is completed. No separate billing step — included in $129/month flat, no extra percentage per transaction.</p></div>
          <div className="premium-card"><div className="premium-card-icon">👥</div><h4>Unlimited Technicians</h4><p>Run 1 fertilizer truck or 10. Every tech is included in the flat $129/month. The price never changes based on how many people use the software.</p></div>
        </div>
      </div>

      {/* PRICING */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">$129/Month. Every Feature. No Add-Ons.</h2>
          <p className="section-sub">One flat price covers round tracking, EPA compliance logs, Lasso routing, automated SMS alerts, card-on-file payments, and unlimited technicians. No per-user fees. No contracts.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="lc-price-card featured">
            <div className="featured-badge">Everything Included — One Price</div>
            <div className="price-tier">Fertilizer Software — One Plan</div>
            <div style={{fontSize:'48px', fontWeight:800, color:'var(--text)', lineHeight:1}}><sup style={{fontSize:'22px', verticalAlign:'super'}}>$</sup>129</div>
            <div style={{color:'var(--muted)', fontSize:'13px', marginBottom:'24px', marginTop:'4px'}}>per month — cancel anytime</div>
            <ul className="price-features">
              <li>5-Round &amp; 6-Round Program Round Tracking</li>
              <li>EPA Reg Number &amp; Rate Logging on Every Application</li>
              <li>Applicator License &amp; Conditions Captured In-Field</li>
              <li>Compliance Reports — Print by Date, Product, or Applicator</li>
              <li>Round Auto-Rescheduling — Manage All Season Automatically</li>
              <li>Sq Ft or Linear Ft Waiting List by Round Number</li>
              <li>Lasso Circle Map Route Builder</li>
              <li>Automated Re-Entry Interval SMS on Every Application</li>
              <li>Day-Before &amp; On-the-Way SMS Alerts — 10+ Pre-Built Templates</li>
              <li>Two-Way SMS Customer Inbox</li>
              <li>Fertilizer Package Plans &amp; Round Tracking per Customer</li>
              <li>Mobile App for Technicians — Route, Log &amp; Complete in Field</li>
              <li>Card-on-File Payments — Charge on Completion Automatically</li>
              <li>Unlimited Technicians — No Per-User Fees</li>
              <li>14-Day Free Trial — No Credit Card Required</li>
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
          <h2 className="section-title" style={{marginBottom:'48px'}}>Fertilizer Software — Common Questions</h2>
          {[
            {q:'Does LandscapeBossPro work for fertilizer businesses?', a:'Yes. LandscapeBossPro handles recurring fertilizer programs from Round 1 through Winterizer — tracking which round each customer is on, routing by sq ft, logging EPA registration numbers and application rates, and sending automated SMS alerts after each application.'},
            {q:'Can I track multiple fertilizer rounds per customer?', a:'Yes. LandscapeBossPro tracks each customer\'s current round, treatments remaining, and next due date. When Round 3 is completed, Round 4 automatically goes back on the waiting list. You always know who is on which round without checking a spreadsheet.'},
            {q:'Does it log EPA registration numbers and application rates for fertilizer compliance?', a:'Yes. LandscapeBossPro stores EPA registration numbers at the product level and captures them on every treatment log. Application rates, product, area treated, and applicator license are recorded per treatment and accessible in a print-ready compliance report.'},
            {q:'Can I build fertilizer routes by square footage?', a:'Yes. The circle-map lasso tool shows sq ft totals in real time as you select accounts for a route. You can filter by service type to show only the round you\'re scheduling and see total sq ft and revenue for the route before dispatching.'},
            {q:'Does LandscapeBossPro send re-entry interval notifications after fertilizer applications?', a:'Yes. Post-service SMS alerts can include re-entry timing — "Please keep pets off treated areas for 2 hours." Alerts fire automatically when the technician logs completion — before the customer has a chance to wonder whether it\'s safe to go outside.'},
            {q:'What does LandscapeBossPro cost for a fertilizer business?', a:'$129/month, flat. All features included — compliance logs, route tools, SMS alerts, card payments. No per-user fees, no add-ons. 14-day free trial, no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>LandscapeBossPro handles fertilizer programs alongside lawn care, weed control, pest control, and mosquito spray — all from one platform — <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full platform overview</a>.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Fertilizer Software That Runs Your Rounds<br /><span style={{color:'var(--orange)'}}>From First App to Winterizer. Every Season.</span></h2>
        <p>$129/month covers round tracking, compliance logs, Lasso routing, and automated re-entry SMS — everything built for lawn care companies running recurring fertilizer programs. No add-ons. No contracts.</p>
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
