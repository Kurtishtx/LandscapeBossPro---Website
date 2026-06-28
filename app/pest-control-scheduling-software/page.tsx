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

export default function PestControlSchedulingSoftware() {
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
      {/* ════ NAVBAR ════ */}
      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      {/* ════ HERO ════ */}
      <div className="hero">
        <div className="hero-badge">Pest Control Scheduling Software</div>
        <h1>Pest Control Scheduling Software for<br /><span>Quarterly, Bi-Monthly, and Monthly Programs.</span></h1>
        <p>SprayBossPro is scheduling software for pest control companies running recurring programs. Every customer&#39;s next treatment auto-schedules when the previous one is completed. Build Lasso circle routes, log EPA reg numbers and application rates on every job, and send automated SMS alerts without your team ever touching a text message. $129/month, everything included.</p>
        <div className="hero-btns" style={{marginBottom:0}}>
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">
            Start Your 14-Day Free Trial — $129/Month
          </a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Per month — everything included</div></div>
          <div><div className="hero-stat-val">Auto</div><div className="hero-stat-lbl">Reschedule on every completed job</div></div>
          <div><div className="hero-stat-val">14-Day</div><div className="hero-stat-lbl">Free trial — no credit card</div></div>
          <div><div className="hero-stat-val">0</div><div className="hero-stat-lbl">Add-ons or per-technician fees</div></div>
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
          alt="SprayBossPro pest control scheduling software showing the dispatch board, recurring program waiting list, and technician mobile app"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* ════ PROGRAM TYPES ════ */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">Built for Every Recurring Pest Control Program</span>
          <h2 className="section-title">Quarterly, Bi-Monthly, Monthly, and Mosquito Add-On — All in One Platform. $129/Month.</h2>
          <p className="section-sub">SprayBossPro handles the scheduling, routing, compliance logging, and automated SMS alerts for every recurring pest control program your company runs — with auto-rescheduling after every treatment so your waiting list stays accurate all year without anyone managing it manually.</p>
        </div>
        <div className="audience-grid">
          <div className="audience-card">
            <div className="audience-tag">Quarterly Programs</div>
            <h3>Quarterly Pest Control — 4 Treatments Per Year</h3>
            <p>SprayBossPro auto-schedules each quarterly treatment approximately 13 weeks after the previous one completes. Your waiting list stays accurate year-round without your office ever manually scheduling a single follow-up visit between quarterly rounds for any customer.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Bi-Monthly Programs</div>
            <h3>Bi-Monthly Pest Control — 6 Treatments Per Year</h3>
            <p>Bi-monthly programs auto-reschedule every 8 weeks on completion. The waiting list manages the entire year automatically — all 6 visits per customer, all customers. When a bi-monthly treatment is done, the next one appears on the waiting list at the right date without anyone touching anything.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Monthly Programs</div>
            <h3>Monthly Recurring Pest Control Programs</h3>
            <p>Monthly pest control programs are the highest-frequency scheduling challenge. SprayBossPro manages monthly recurrence automatically — 12 treatments per customer per year, each auto-scheduled 4 weeks after the previous. Your waiting list shows every monthly treatment due each day without any manual scheduling.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Mosquito Add-On</div>
            <h3>Mosquito Add-On for Existing Pest Control Customers</h3>
            <p>Many pest control companies add mosquito programs to existing quarterly or bi-monthly customers. SprayBossPro tracks both services under the same customer account — each on its own schedule, its own compliance log, its own SMS template — without mixing them together in a confusing combined schedule.</p>
          </div>
        </div>
      </section>

      {/* ════ WAITING LIST ════ */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Waiting List — Every Pest Control Treatment Due Today, Organized by Program</span>
            <h2>See Every Pest Control Visit Due Today — By Program Type, With Route Revenue, Before You Build a Single Route.</h2>
            <p>Before you build any pest control routes, SprayBossPro shows you a waiting list of every treatment due — organized by program type (quarterly, bi-monthly, monthly, mosquito) with total stops and route revenue per program. You know the full scope of the day and how to split work between crews before you ever open Lasso or dispatch anything.</p>
            <p>When a treatment is completed, the next one auto-schedules at your set interval — 13 weeks for quarterly, 8 weeks for bi-monthly, 4 weeks for monthly. The waiting list updates automatically. There&#39;s no manual scheduling between visits for any recurring program.</p>
            <ul className="check-list">
              <li>Waiting list organized by program type — quarterly, bi-monthly, monthly all separated</li>
              <li>Total stops and route revenue per program — know the day&#39;s full scope instantly</li>
              <li>Next treatment auto-schedules at your interval when the previous completes</li>
              <li>Overdue visits highlighted — nothing falls through the cracks on any recurring program</li>
              <li>Filter by technician or crew to split the route workload between trucks</li>
              <li>Mix program types on one route or keep quarterly and monthly routes separate</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Waiting List — Today&#39;s Pest Control Queue by Program</div>
            <div className="svc-row" style={{borderColor:'rgba(224,120,32,.35)', background:'rgba(224,120,32,.07)'}}>
              <div><div className="svc-name">Quarterly Treatment Q3</div><div className="svc-sub">34 properties · auto-scheduled</div></div>
              <div className="svc-ft">$3,060</div>
            </div>
            <div className="svc-row" style={{borderColor:'rgba(224,120,32,.35)', background:'rgba(224,120,32,.07)'}}>
              <div><div className="svc-name">Bi-Monthly Treatment 4</div><div className="svc-sub">21 properties · auto-scheduled</div></div>
              <div className="svc-ft">$1,890</div>
            </div>
            <div className="svc-row">
              <div><div className="svc-name">Monthly Service — June</div><div className="svc-sub">18 properties waiting</div></div>
              <div className="svc-ft" style={{color:'rgba(255,255,255,.4)'}}>$1,620</div>
            </div>
            <div className="svc-row">
              <div><div className="svc-name">Mosquito Treatment 4</div><div className="svc-sub">12 properties waiting</div></div>
              <div className="svc-ft" style={{color:'rgba(255,255,255,.4)'}}>$1,080</div>
            </div>
            <div className="svc-row">
              <div><div className="svc-name">Quarterly Treatment — Overdue</div><div className="svc-sub">6 properties past due date</div></div>
              <div className="svc-ft" style={{color:'#f87171'}}>$540</div>
            </div>
            <div style={{marginTop:'12px', background:'rgba(224,120,32,.08)', border:'1px solid rgba(224,120,32,.2)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.4)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Total Due Today</div>
              <div style={{color:'var(--orange)', fontSize:'12px', fontWeight:700}}>91 stops · $8,190 route revenue</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ LASSO ════ */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Lasso — Circle Map Route Builder for Pest Control Routes</span>
            <h2>Draw a Circle on Any Neighborhood. Pull Every Pest Control Stop Due Inside. Dispatch in Minutes.</h2>
            <p>Open Lasso on the map, draw a circle around any neighborhood or service zone, and SprayBossPro instantly shows you every property with a pest control treatment due inside that boundary — program type, stop count, and total route revenue — before you commit to building the route.</p>
            <p>Filter by program type — pull only quarterly stops, only bi-monthly, or mix programs together on the same route. Select all, drive order optimizes automatically, and you push the route to your technician&#39;s phone in one click. Building a full day of pest control routes takes minutes. Lasso is the fastest way to build recurring pest control routes from any scheduling software on the market.</p>
            <ul className="check-list">
              <li>Draw a circle on any neighborhood, subdivision, or zip code boundary</li>
              <li>See every pest control stop due inside — program, revenue, overdue status</li>
              <li>Filter by program type — quarterly, bi-monthly, monthly, or mosquito</li>
              <li>Drive order optimized automatically to minimize windshield time and fuel</li>
              <li>Push the complete route to the technician&#39;s phone with one click</li>
              <li>Build routes for multiple crews simultaneously without stop overlap</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'10px'}}>Lasso — Northside Pest Route · Quarterly Q3</div>
            <div style={{display:'flex', flexDirection:'column', gap:'7px'}}>
              {[
                {n:1, addr:'512 Maplewood Ct',    svc:'Quarterly Treatment Q3 · General Pest · Due today', price:'$89'},
                {n:2, addr:'88 Ridgeview Dr',      svc:'Quarterly Treatment Q3 · General Pest · Due today', price:'$89'},
                {n:3, addr:'204 Thornwood Blvd',   svc:'Bi-Monthly Treatment 4 · General Pest · Due today', price:'$79'},
              ].map(({n, addr, svc, price}) => (
                <div key={n} style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{background:'rgba(224,120,32,.2)', border:'1px solid rgba(224,120,32,.4)', color:'var(--orange)', fontSize:'10px', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{n}</div>
                  <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.8)', fontSize:'12px', fontWeight:600}}>{addr}</div><div style={{color:'rgba(255,255,255,.35)', fontSize:'10px'}}>{svc}</div></div>
                  <div style={{color:'var(--orange)', fontSize:'11px', fontWeight:700}}>{price}</div>
                </div>
              ))}
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px', opacity:.5}}>
                <div style={{background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)', fontSize:'10px', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>+</div>
                <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.3)', fontSize:'12px'}}>17 more stops in this circle…</div></div>
                <div style={{color:'rgba(255,255,255,.3)', fontSize:'11px', fontWeight:600}}>$1,490</div>
              </div>
            </div>
            <div style={{marginTop:'10px', background:'rgba(224,120,32,.1)', border:'1px solid rgba(224,120,32,.25)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Route Total</div>
              <div style={{color:'var(--orange)', fontSize:'13px', fontWeight:700}}>20 stops · $1,747 route revenue</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ COMPLIANCE LOGS ════ */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Chemical Application Compliance Logs on Every Pest Control Job</span>
            <h2>EPA Reg Numbers, Application Rates, and Re-Entry Intervals Logged In-Field on Every Pest Control Visit.</h2>
            <p>Your technician logs the complete application record on their phone at the property — product name, EPA registration number, application rate per linear ft or per sq ft, target pest, treatment areas, re-entry interval, and applicator license. Logged at the property, saved to the permanent service record. Your team never reconstructs records after the fact.</p>
            <p>Pest control compliance requirements vary by state — but they all require product records, application rates, and applicator license numbers. SprayBossPro captures all of it in a structured log tied to every service visit. Pull a compliance report for any date range, any product, any technician, or any property in seconds — ready to show a state inspector on the spot.</p>
            <ul className="check-list">
              <li>Product name and EPA registration number captured on every application</li>
              <li>Application rate per linear ft, per sq ft, or per unit — matches your application method</li>
              <li>Target pest, treatment areas (interior/exterior/perimeter), and method logged</li>
              <li>Re-entry interval captured and used to send the automatic SMS to the customer</li>
              <li>Applicator license and certification type required per log for state compliance</li>
              <li>Print compliance reports by date, product, applicator, or property in seconds</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Pest Control Application Log — Filed In-Field on Tech&#39;s Phone</div>
            <div className="log-row" style={{borderColor:'rgba(224,120,32,.35)', background:'rgba(224,120,32,.07)'}}><div className="log-label">Property</div><div className="log-value">512 Maplewood Ct — Quarterly Q3</div></div>
            <div className="log-row"><div className="log-label">Service</div><div className="log-value">General Pest Control — Exterior + Perimeter</div></div>
            <div className="log-row"><div className="log-label">Product Applied</div><div className="log-value">Bifen IT Bifenthrin 7.9%</div></div>
            <div className="log-row"><div className="log-label">EPA Reg Number</div><div className="log-value">53883-284</div></div>
            <div className="log-row"><div className="log-label">Rate Applied</div><div className="log-value">0.5 oz / gallon · 2 gal perimeter</div></div>
            <div className="log-row"><div className="log-label">Re-Entry Interval</div><div className="log-value">30 minutes — SMS queued to customer</div></div>
            <div className="log-row"><div className="log-label">Applicator License</div><div className="log-value">TX-GEN-38812 · General Pest Category</div></div>
            <div style={{marginTop:'12px', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.25)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.4)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Log Status</div>
              <div style={{color:'#22c55e', fontSize:'12px', fontWeight:700}}>✓ Saved — Next Q4 Scheduled in 13 Weeks</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ SMS ALERTS ════ */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Automated SMS Alerts on Every Pest Control Visit</span>
            <h2>Day-Before, On-the-Way, and Service Complete Texts Fire Automatically. Your Team Sends Zero of Them.</h2>
            <p>SprayBossPro sends a day-before service reminder the evening before every pest control visit, an on-the-way alert when the tech is headed to the property, and a service complete notification with re-entry interval automatically when the compliance log is saved. Your technicians never touch a text message. Your office never follows up after a job.</p>
            <p>Customers stop calling your office about when you&#39;re coming — they already know. The day-before text tells them what day. The on-the-way text tells them 15 minutes out. The complete text tells them the re-entry interval and confirms the next visit is scheduled. Three automated texts per job, every job, no manual effort from your team.</p>
            <ul className="check-list">
              <li>Day-before reminder fires the evening before every scheduled pest control visit</li>
              <li>On-the-way text fires when the tech marks the stop started on their phone</li>
              <li>Service complete with re-entry interval fires automatically when the log is saved</li>
              <li>10+ pre-built pest control SMS templates — ready out of the box on day one</li>
              <li>Two-way SMS inbox — customer replies go into one organized inbox for your team</li>
              <li>500 outbound SMS/month included in $129/month flat</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'14px'}}>Pest Control SMS Thread — Sent Automatically by SprayBossPro</div>
            <div className="sms-bubble sms-out">Hi Dave! Your quarterly pest control service is scheduled for tomorrow between 8am–11am. Please ensure access to the exterior perimeter. We&#39;ll text when your tech is on the way. — Elite Pest Control</div>
            <div className="sms-label right">Day before · Sent automatically · 6:00 PM</div>
            <div className="sms-bubble sms-in">Will do! Side gate code is 4418.</div>
            <div className="sms-label">Dave · 6:24 PM</div>
            <div className="sms-bubble sms-out">Your pest tech is on the way — about 15 minutes out. — Elite Pest Control</div>
            <div className="sms-label right">On the way · Fires automatically · 8:32 AM</div>
            <div className="sms-bubble sms-out">Quarterly pest control complete! Re-entry interval is 30 minutes after application dries. Your next quarterly service is scheduled for approximately 13 weeks from today. — Elite Pest Control</div>
            <div className="sms-label right">Complete · Fires automatically when log is saved</div>
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════ */}
      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 64px'}}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">From Waiting List to Compliance Log — Every Recurring Pest Control Program, Managed Automatically</h2>
          <p className="section-sub">SprayBossPro manages quarterly, bi-monthly, and monthly pest control programs end-to-end — routing, compliance logging, SMS alerts, and auto-rescheduling — without your team manually managing the schedule between any visits. For a closer look at how multiple program types run simultaneously in one system, read <a href="/blogs/manage-quarterly-bi-monthly-monthly-pest-control-programs" style={{color:'var(--orange)', fontWeight:600}}>How to Manage Quarterly, Bi-Monthly, and Monthly Pest Control Programs in One System</a>.</p>
        </div>
        <div className="steps-grid">
          <div className="step-box"><div className="step-circle">1</div><h3>Check the Waiting List</h3><p>See every pest control visit due today — quarterly, bi-monthly, monthly, mosquito — organized by program with stop count and route revenue. Know the day&#39;s full scope before you build any routes.</p></div>
          <div className="step-box"><div className="step-circle">2</div><h3>Lasso the Neighborhood</h3><p>Draw a circle on any area of the map. See every pest control stop due inside — program type, revenue, overdue status. Filter by program. Optimize drive order. Push to the tech in one click.</p></div>
          <div className="step-box"><div className="step-circle">3</div><h3>Log the Application In-Field</h3><p>Tech logs product, EPA reg number, rate, treatment areas, re-entry interval, and applicator license at the property on their phone. Re-entry SMS fires automatically when the log is saved.</p></div>
          <div className="step-box"><div className="step-circle">4</div><h3>Auto-Schedule the Next Visit</h3><p>The next visit auto-schedules at your set interval — 13 weeks for quarterly, 8 for bi-monthly, 4 for monthly. The waiting list updates itself. Nobody on your team schedules the follow-up manually.</p></div>
        </div>
      </section>

      {/* ════ PREMIUM BAND ════ */}
      <div className="premium-band">
        <h2>Pest Control Scheduling Software Built for Recurring Programs.<br /><span>$129/Month. Everything Included.</span></h2>
        <p>SprayBossPro isn&#39;t a generic job board adapted for pest control. Recurring program auto-rescheduling, compliance logs, Lasso circle route building, and automated SMS alerts are built specifically for pest control companies running quarterly, bi-monthly, and monthly programs at scale.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">🔄</div><h4>Recurring Program Auto-Scheduling</h4><p>Quarterly, bi-monthly, and monthly programs auto-reschedule when treatments complete. Every customer&#39;s next visit schedules itself — your waiting list stays accurate all year automatically.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🗺️</div><h4>Lasso Circle Map Route Builder</h4><p>Draw a circle on any neighborhood — see every pest control stop due inside. Filter by program. Build and dispatch a full day of recurring routes in minutes from one map view.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📋</div><h4>EPA Compliance Logs In-Field</h4><p>Product, EPA reg number, rate, treatment areas, re-entry interval, applicator license — all logged in-field on every application. Print compliance reports on demand by date, product, or applicator.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Automated SMS Alerts</h4><p>Day-before, on-the-way, and re-entry interval complete texts fire automatically on every job. 10+ pre-built pest control templates. Zero sent manually by your team or your office.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📊</div><h4>Revenue-Visible Waiting List</h4><p>Waiting list shows route revenue per program — know the dollar value of every day&#39;s pest control work before you build the first route or assign the first truck.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Pest Control Package Plans</h4><p>Sell quarterly, bi-monthly, and monthly programs as packages. Track visits remaining per customer, alert when a program is nearing its end, and renew with one click.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Technicians</h4><p>Techs see their optimized route, customer property notes, access codes, service history, and the compliance log form on their phone. No paper. No calls back to the office.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Card-on-File Payments</h4><p>Charge customer cards automatically when each pest control visit is completed. Included in $129/month flat — no separate billing module, no extra percentage per transaction ever.</p></div>
          <div className="premium-card"><div className="premium-card-icon">👥</div><h4>Unlimited Technicians</h4><p>Run 1 pest control truck or 10. Every technician is included in the flat $129/month. The price never changes no matter how many people use the software.</p></div>
        </div>
      </div>

      {/* ════ PRICING ════ */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">$129/Month. Every Feature. No Add-Ons.</h2>
          <p className="section-sub">One flat price covers recurring program scheduling, compliance logs, Lasso routing, automated SMS alerts, card-on-file payments, and unlimited technicians. No per-user fees. No contracts. No surprises.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="lc-price-card featured">
            <div className="featured-badge">Everything Included — One Price</div>
            <div className="price-tier">Pest Control Scheduling Software — One Plan</div>
            <div className="price-amount"><sup>$</sup>129</div>
            <div className="price-period">per month — cancel anytime</div>
            <ul className="price-features">
              <li>Quarterly, Bi-Monthly &amp; Monthly Program Auto-Rescheduling</li>
              <li>Revenue-Visible Waiting List Organized by Program Type</li>
              <li>Lasso Circle Map Route Builder — Build Pest Routes in Minutes</li>
              <li>EPA Reg Number &amp; Application Rate Logging on Every Job</li>
              <li>Treatment Area, Target Pest &amp; Applicator License In-Field Logging</li>
              <li>Re-Entry Interval Captured &amp; Used to Trigger Auto-SMS</li>
              <li>Compliance Reports — Print by Date, Product, or Applicator</li>
              <li>Day-Before, On-the-Way &amp; Service Complete SMS Alerts</li>
              <li>10+ Pre-Built Pest Control SMS Templates — Ready Out of the Box</li>
              <li>Two-Way SMS Customer Inbox</li>
              <li>Mosquito Add-On Program Support Under Same Customer Account</li>
              <li>Mobile App for Technicians — Route, Log &amp; Complete</li>
              <li>Card-on-File Payments — Charge Automatically on Completion</li>
              <li>Unlimited Technicians — No Per-User Fees Ever</li>
              <li>14-Day Free Trial — No Credit Card Required</li>
            </ul>
            <button onClick={(e) => openSignupModal(2, e.currentTarget as HTMLElement)} className="price-btn price-btn-primary">
              Start Your 14-Day Free Trial
            </button>
          </div>
        </div>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'13px', marginTop:'32px'}}>No contracts. No add-ons. No per-technician fees. Cancel anytime.</p>
      </section>

      {/* FAQ */}
      <section style={{background:'#fff'}}>
        <div style={{maxWidth:'860px', margin:'0 auto', padding:'80px 40px'}}>
          <span className="section-label">FAQ</span>
          <h2 className="section-title" style={{marginBottom:'48px'}}>Pest Control Scheduling Software — Common Questions</h2>
          {[
            {q:'Does SprayBossPro handle recurring pest control scheduling?', a:'Yes. SprayBossPro manages quarterly, bi-monthly, monthly, and custom-interval pest control programs. When a treatment is completed, the next one is automatically placed back on the waiting list at the correct interval — no manual rebooking, no calendar entry.'},
            {q:'How does the dispatch board work for pest control?', a:'The dispatch board shows all accounts due for service in a waiting list sorted by due date. When you\'re building routes, you lasso a geographic area on the map and all pest control accounts due inside are added to your route. You see stop count and revenue totals before committing to the route.'},
            {q:'Can I manage both residential and commercial pest control accounts?', a:'Yes. SprayBossPro stores property details, service notes, and treatment history for any account type. Commercial accounts can have separate service areas with independent treatment logs, and their program intervals can differ from residential customers.'},
            {q:'Does it send automated service notifications?', a:'Yes. SprayBossPro sends automated SMS alerts at each step: appointment reminders, on-the-way notifications, and completion messages including re-entry interval if needed. Alerts are configured once per service type and fire automatically on every job.'},
            {q:'Can I track renewals and know which customers are coming up for renewal?', a:'Yes. SprayBossPro shows treatments remaining on each customer\'s program. You can run a report to identify renewal candidates approaching the end of their contract — so you can initiate renewal conversations before the program lapses.'},
            {q:'What does SprayBossPro cost?', a:'$129/month for everything. No per-user fees, no SMS add-ons, no extra charge for compliance logs or route tools. 14-day free trial, no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>SprayBossPro is pest control scheduling software built for recurring programs — <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full platform overview</a> to learn what's included.</p>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <div className="cta-band">
        <h2>Pest Control Scheduling Software That Runs<br /><span style={{color:'var(--orange)'}}>Your Recurring Programs Without the Manual Work.</span></h2>
        <p>$129/month covers quarterly, bi-monthly, and monthly program auto-scheduling, compliance logs, Lasso circle route building, and automated SMS alerts — everything built for pest control companies running recurring programs. No add-ons. No contracts.</p>
        <div className="hero-btns" style={{justifyContent:'center'}}>
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(3, e.currentTarget as HTMLElement); }} className="btn-primary" style={{fontSize:'17px', padding:'18px 44px'}}>
            Start Your 14-Day Free Trial
          </a>
        </div>
      </div>

      {/* ════ MODALS ════ */}
      <div id="sbp-backdrop" className="sbp-backdrop" onClick={() => closeAllModals()}></div>
      <SignupForm n={1} />
      <SignupForm n={2} />
      <SignupForm n={3} />
    </>
  );
}
