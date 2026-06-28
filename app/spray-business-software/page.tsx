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
          <input id={`sbp${n}-company`} type="text" placeholder="Smith Spray Services" className="sbp-input" />
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

export default function SprayBusinessSoftware() {
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
        <div className="hero-badge">Spray Business Software</div>
        <h1>Software Built for<br /><span>Spray Businesses. Not Everyone Else.</span></h1>
        <p>Schedule spray routes, manage recurring treatment programs, track sq ft or linear ft waiting lists by service type, log every chemical application, and send automated customer alerts — all in one platform designed specifically for lawn care and pest control companies that spray.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial — $129/Month</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Per month — everything included</div></div>
          <div><div className="hero-stat-val">Unlimited</div><div className="hero-stat-lbl">Technicians and users</div></div>
          <div><div className="hero-stat-val">14-Day</div><div className="hero-stat-lbl">Free trial — no credit card</div></div>
          <div><div className="hero-stat-val">0</div><div className="hero-stat-lbl">Add-ons required</div></div>
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
          alt="LandscapeBossPro spray business software dashboard showing circle-map routing, waiting list, and mobile dispatch on laptop and phone"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* WHO IT'S FOR */}
      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Built for Spray Businesses</span>
          <h2 className="section-title">If Your Business Sprays, LandscapeBossPro Was Built for You.</h2>
          <p className="section-sub" style={{maxWidth:'800px'}}>General field service software is built for plumbers, cleaners, and HVAC companies. LandscapeBossPro is built for businesses that apply chemical treatments — with sq ft or linear ft routing, compliance logging, and program management that spray companies actually need.</p>
        </div>
        <div className="audience-grid">
          <div className="audience-card">
            <div className="audience-tag">Lawn Care</div>
            <h3>Lawn Spray &amp; Fertilization</h3>
            <p>Manage fertilizer, weed control, and lawn treatment programs. Track sq ft or linear ft per property, build neighborhood routes with Lasso, and auto-schedule the next treatment when one is complete.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Mosquito Control</div>
            <h3>Mosquito Spray Programs</h3>
            <p>Manage recurring mosquito treatment programs — monthly, every 21 days, seasonal. Build routes by drawing a circle on the map, see all properties due inside, and send automated SMS alerts before every treatment.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Pest Control</div>
            <h3>Pest Control Applications</h3>
            <p>Schedule perimeter spray, interior pest treatments, and recurring pest programs. Log every application with product, rate, and area treated for full compliance documentation.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Multi-Service</div>
            <h3>Lawn + Mosquito + Pest</h3>
            <p>Run multiple spray service lines from one platform. LandscapeBossPro organizes your waiting list by service type — so your lawn crew and mosquito crew each see exactly what they need.</p>
          </div>
        </div>
      </section>

      {/* WAITING LIST */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Sq Ft or Linear Ft Waiting List</span>
            <h2>See Every Service Due Before You Build a Single Route.</h2>
            <p>Every morning before you build routes, LandscapeBossPro shows you a waiting list organized by service type — with total sq ft or linear ft and total stops waiting for each. Your lawn crew sees their list. Your mosquito crew sees theirs.</p>
            <p>You know instantly how big the day needs to be, how many routes to build, and which services to prioritize. No counting addresses manually. No digging through the schedule.</p>
            <ul className="check-list">
              <li>Waiting list organized by service type — any name you use</li>
              <li>Shows total sq ft or linear ft and stops per service</li>
              <li>Separate lists visible per service type or crew</li>
              <li>Updates live as treatments are completed and rescheduled</li>
              <li>Plan crew size before you open the route builder</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Waiting List — All Services Due</div>
            {[
              {name:'Lawn Care 4', count:'31 properties waiting', ft:'284,400 ft²', active:true},
              {name:'Mosquito 3', count:'14 properties waiting', ft:'127,400 ft²', active:true},
              {name:'Weed Control 3', count:'18 properties waiting', ft:'163,800 ft²', active:false},
              {name:'Lawn Insect 2', count:'9 properties waiting', ft:'79,200 ft²', active:false},
              {name:'Perimeter Pest 1', count:'6 properties waiting', ft:'1,800 ln ft', active:false},
              {name:'Flower Beds 3', count:'11 properties waiting', ft:'44,000 ft²', active:false},
            ].map(({name, count, ft, active}) => (
              <div key={name} className={`svc-row${active ? ' active' : ''}`} style={{marginBottom:'6px'}}>
                <div>
                  <div className="svc-name">{name}</div>
                  <div className="svc-count">{count}</div>
                </div>
                <div className="svc-ft" style={active ? {} : {color:'rgba(255,255,255,.4)'}}>{ft}</div>
              </div>
            ))}
            <div style={{marginTop:'12px', background:'rgba(27,110,59,.08)', border:'1px solid rgba(27,110,59,.2)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Total Due Today</div>
              <div style={{color:'var(--orange)', fontSize:'13px', fontWeight:700}}>89 stops across 6 services</div>
            </div>
          </div>
        </div>
      </section>

      {/* LASSO */}
      <section>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Lasso — Spray Route Builder</span>
            <h2>Draw a Circle on the Map. Every Spray Stop Due Inside — Instant.</h2>
            <p>Stop building spray routes one address at a time. Open your map, draw a circle around any neighborhood or service area, and LandscapeBossPro instantly shows you every property with a spray treatment due inside that boundary — service type, sq ft or linear ft, and route revenue.</p>
            <p>Select them all with one click, optimize the drive order, and push the route to your technician&apos;s phone. A full day of spray routes in minutes instead of an hour.</p>
            <ul className="check-list">
              <li>Draw any shape on the map — neighborhoods, zip codes, service zones</li>
              <li>See stops, sq ft or linear ft, and revenue inside the boundary</li>
              <li>Filter by service type — lawn only, mosquito only, or any mix</li>
              <li>Add all selected stops to a route in one click</li>
              <li>Drive order optimized automatically</li>
              <li>Route pushed to technician&apos;s mobile app instantly</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'10px'}}>Lasso Selection — Eastside Zone</div>
            <div style={{display:'flex', flexDirection:'column', gap:'7px'}}>
              {[
                {n:'1', addr:'308 Elmwood Cir', sub:'Lawn Care 4 · Due today', ft:'9,400 ft²'},
                {n:'2', addr:'415 Sycamore Blvd', sub:'Mosquito 3 · Due today', ft:'7,200 ft²'},
                {n:'3', addr:'122 Ridgecrest Ln', sub:'Weed Control 3 · Due today', ft:'11,600 ft²'},
              ].map(({n, addr, sub, ft}) => (
                <div key={n} style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{background:'rgba(27,110,59,.2)', border:'1px solid rgba(27,110,59,.4)', color:'var(--orange)', fontSize:'10px', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{n}</div>
                  <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.8)', fontSize:'12px', fontWeight:600}}>{addr}</div><div style={{color:'rgba(255,255,255,.35)', fontSize:'10px'}}>{sub}</div></div>
                  <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', fontWeight:600}}>{ft}</div>
                </div>
              ))}
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px', opacity:.5}}>
                <div style={{background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)', fontSize:'10px', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>+</div>
                <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.3)', fontSize:'12px'}}>9 more stops…</div></div>
                <div style={{color:'rgba(255,255,255,.3)', fontSize:'11px', fontWeight:600}}>82,400 ft²</div>
              </div>
            </div>
            <div style={{marginTop:'10px', background:'rgba(27,110,59,.1)', border:'1px solid rgba(27,110,59,.25)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Route Total</div>
              <div style={{color:'var(--orange)', fontSize:'13px', fontWeight:700}}>12 stops · 110,600 ft² · $1,640</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Chemical Application Logs</span>
            <h2>Log Every Spray Application. Print Compliance Reports. Stay Licensed.</h2>
            <p>Every state requires pesticide applicators to keep records of every chemical application — product name, EPA registration number, application rate, total area or linear ft treated, weather conditions, and applicator license number. LandscapeBossPro logs all of it on every job.</p>
            <p>Your technicians fill out the application log right on their phone when they finish a stop. No paper logs. No re-entering data at the office. Print-ready compliance reports whenever you need them.</p>
            <ul className="check-list">
              <li>Product name, EPA reg number, and application rate per stop</li>
              <li>Total sq ft or linear ft treated per application</li>
              <li>Weather conditions at time of application</li>
              <li>Applicator name and license number logged automatically</li>
              <li>Print-ready compliance reports on demand</li>
              <li>Full application history per property — every visit, every product</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Application Log — Today&apos;s Route</div>
            <div className="log-card" style={{background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.09)', borderRadius:'10px', padding:'14px 16px', marginBottom:'8px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                <div style={{color:'rgba(255,255,255,.8)', fontSize:'12px', fontWeight:600}}>308 Elmwood Cir</div>
                <div style={{background:'rgba(27,110,59,.2)', border:'1px solid rgba(27,110,59,.4)', color:'var(--orange)', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px'}}>Complete</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px'}}>
                {[['Product','Talstar P Pro'],['Rate','0.5 oz / gal'],['Area Treated','9,400 ft²'],['Gallons','3.2 gal'],['Temp / Wind','74°F · 6 mph'],['Applicator','J. Martinez #4821']].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div style={{color:'rgba(255,255,255,.3)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'.6px'}}>{lbl}</div>
                    <div style={{color:'rgba(255,255,255,.65)', fontSize:'11px', fontWeight:600, marginTop:'1px'}}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.09)', borderRadius:'10px', padding:'14px 16px', opacity:.65}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px'}}>
                <div style={{color:'rgba(255,255,255,.8)', fontSize:'12px', fontWeight:600}}>415 Sycamore Blvd</div>
                <div style={{background:'rgba(27,110,59,.2)', border:'1px solid rgba(27,110,59,.4)', color:'var(--orange)', fontSize:'10px', fontWeight:700, padding:'2px 8px', borderRadius:'10px'}}>Complete</div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px'}}>
                {[['Product','Bifen IT'],['Rate','1 oz / gal'],['Area Treated','7,200 ft²'],['Gallons','2.4 gal']].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div style={{color:'rgba(255,255,255,.3)', fontSize:'9px', textTransform:'uppercase', letterSpacing:'.6px'}}>{lbl}</div>
                    <div style={{color:'rgba(255,255,255,.65)', fontSize:'11px', fontWeight:600, marginTop:'1px'}}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 64px'}}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">From Waiting List to Completed Spray Routes — Same Morning</h2>
          <p className="section-sub">LandscapeBossPro is designed so that building and dispatching a full day of spray routes takes minutes, not an hour. For a closer look at how the waiting list and circle routing eliminate the morning dispatch bottleneck, read <a href="/blogs/run-spray-business-without-office-manager" style={{color:'var(--orange)', fontWeight:600}}>How to Run a Spray Business Without an Office Manager</a>.</p>
        </div>
        <div className="steps-grid">
          <div className="step-box"><div className="step-circle">1</div><h3>Check the Waiting List</h3><p>Open LandscapeBossPro and see every service due today — organized by service type with total sq ft or linear ft waiting. Know your day before you build anything.</p></div>
          <div className="step-box"><div className="step-circle">2</div><h3>Lasso a Service Zone</h3><p>Draw a circle on the map over any area. See every property with spray due inside — stops, sq ft or linear ft, revenue — filtered by service type. Add them to a route.</p></div>
          <div className="step-box"><div className="step-circle">3</div><h3>Dispatch to Your Tech</h3><p>Push the optimized route to your technician&apos;s mobile app. They see the stops in order, customer notes, gate codes, and the chemical application log form for each property.</p></div>
          <div className="step-box"><div className="step-circle">4</div><h3>Complete &amp; Auto-Reschedule</h3><p>When a treatment is complete, the tech logs the application on their phone. The next treatment auto-schedules and goes back on the waiting list. No manual rescheduling.</p></div>
        </div>
      </section>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Every Feature a Spray Business Needs.<br /><span>$129/Month. No Add-Ons. No Per-User Fees.</span></h2>
        <p>LandscapeBossPro isn&apos;t a generic field service app with a spray-business skin. It&apos;s built from the ground up for businesses that apply chemical treatments — with the routing, compliance logging, and program management that spray companies actually use every day.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">🗺️</div><h4>Lasso Circle Map Route Builder</h4><p>Draw a circle on any area and see every spray stop due inside. Build a full day of routes in minutes. Filter by service type — lawn, mosquito, pest, or any mix.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📋</div><h4>Sq Ft or Linear Ft Waiting List</h4><p>See how many sq ft or linear ft of each service type is waiting to be scheduled. Know your workload before you build a single route.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔄</div><h4>Auto-Rescheduling Programs</h4><p>When a spray treatment is complete, the next one automatically goes on the waiting list. Recurring programs manage themselves.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🧪</div><h4>Chemical Application Logs</h4><p>Log product, EPA number, rate, gallons, area treated, weather, and applicator license on every job. Print-ready compliance reports on demand.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Automated SMS Alerts</h4><p>Day-before reminders, on-the-way alerts, and service complete notifications sent automatically on every spray job. 10+ pre-built alert types included.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Package Plans &amp; Programs</h4><p>Sell seasonal spray packages and multi-treatment programs. LandscapeBossPro tracks treatments remaining and notifies you before programs expire.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Technicians</h4><p>Your techs see their route, property notes, access info, and the application log form on their phone. No paper, no clipboard, no back-and-forth.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Card-on-File Payments</h4><p>Charge cards automatically after each spray treatment. Card-on-file payments are included at $129/month — no payment add-on needed.</p></div>
          <div className="premium-card"><div className="premium-card-icon">👥</div><h4>Unlimited Technicians</h4><p>Run 1 spray truck or 10. LandscapeBossPro doesn&apos;t charge per user. Add every technician in your company — the price stays $129/month.</p></div>
        </div>
      </div>

      {/* PRICING */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">$129/Month. Every Feature. No Add-Ons.</h2>
          <p className="section-sub">One flat price. No add-ons for SMS, compliance logs, or route building. No user caps. No per-technician fees. Cancel anytime.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="lc-price-card featured">
            <div className="featured-badge">Everything Included — One Price</div>
            <div className="price-tier">Spray Business Software — One Plan</div>
            <div style={{fontSize:'48px', fontWeight:800, color:'var(--text)', lineHeight:1}}><sup style={{fontSize:'22px', verticalAlign:'super'}}>$</sup>129</div>
            <div style={{color:'var(--muted)', fontSize:'13px', marginBottom:'24px', marginTop:'4px'}}>per month — cancel anytime</div>
            <ul className="price-features">
              <li>Lasso Circle Map Route Builder</li>
              <li>Sq Ft or Linear Ft Waiting List by Service Type</li>
              <li>Recurring Program Auto-Rescheduling</li>
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
          <h2 className="section-title" style={{marginBottom:'48px'}}>Spray Business Software — Common Questions</h2>
          {[
            {q:'What types of spray businesses does LandscapeBossPro work for?', a:'LandscapeBossPro is built for any business that applies chemical treatments on recurring routes — mosquito spray, lawn care, weed control, fertilizer, and pest control. It handles multi-service scheduling, compliance logging, route building by sq ft, and automated SMS across all service types from one platform.'},
            {q:'Does LandscapeBossPro handle chemical compliance for spray businesses?', a:'Yes. Every treatment logs the product, EPA registration number, application rate, target pest or weed, treatment area, weather, and applicator license. The chemical tracking report generates a print-ready compliance log for state inspection — no paper records needed.'},
            {q:'Can I manage multiple service types in one account?', a:'Yes. LandscapeBossPro manages mosquito spray, lawn care, weed control, fertilizer, and pest control from one account. The waiting list filters by service type, each service has its own SMS alert configuration, and circle-map routing shows only the service type you\'re scheduling.'},
            {q:'Does LandscapeBossPro send automated customer communication?', a:'Yes. Pre-built SMS alert templates cover every touchpoint: day-before appointment reminders, on-the-way notifications, completion messages, and re-entry interval notices. Alerts fire automatically from dispatch and completion events — configured once, sent on every job.'},
            {q:'Can I run multiple technicians and trucks?', a:'Yes. LandscapeBossPro supports unlimited technicians at $129/month — no per-user fees regardless of crew size. The dispatch board assigns routes to specific technicians, and each uses the mobile app for their stops, property details, and chemical log.'},
            {q:'How much does LandscapeBossPro cost?', a:'$129/month, flat. Every feature — route scheduling, chemical compliance logs, SMS alerts, card-on-file payments, estimates — is included. No per-user fees, no add-ons. 14-day free trial, no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>LandscapeBossPro is the all-in-one platform for spray businesses — <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full platform overview</a> to learn everything that's included.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>The Only Spray Business Software<br /><span style={{color:'var(--orange)'}}>Built for Companies That Spray.</span></h2>
        <p>$129/month gets you Lasso routing, sq ft or linear ft waiting lists, chemical compliance logs, recurring program management, and automated SMS alerts. No add-ons. No per-user fees.</p>
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
