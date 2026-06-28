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
          <input id={`sbp${n}-company`} type="text" placeholder="Smith Mosquito Control" className="sbp-input" />
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

export default function MosquitoControlSoftware() {
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
        <div className="hero-badge">Mosquito Control Software</div>
        <h1>Software Built for<br /><span>Mosquito Control Companies.</span></h1>
        <p>Manage seasonal mosquito programs, build circle routes with Lasso, track sq ft or linear ft waiting lists by program type, send automated customer alerts before and after every treatment, and log every chemical application for compliance — $129/month, everything included.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial — $129/Month</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Per month — everything included</div></div>
          <div><div className="hero-stat-val">Unlimited</div><div className="hero-stat-lbl">Technicians and users</div></div>
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
          alt="SprayBossPro mosquito control software dashboard showing route scheduling, waiting list, and technician mobile app"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* PROGRAM MANAGEMENT */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Seasonal Program Management</span>
            <h2>Run Your Entire Mosquito Control Season Without Dropping a Program.</h2>
            <p>Most mosquito control companies run the same customers on a recurring schedule — monthly, every 21 days, every 3 weeks — from spring through fall. SprayBossPro is built around that model. When a treatment is complete, the next one automatically goes back on the waiting list at the right interval. No manual rescheduling. No customers falling off the program.</p>
            <p>Sell seasonal mosquito control packages and track exactly how many treatments each customer has left. SprayBossPro alerts you before a program expires so you can renew before the season ends — not after.</p>
            <ul className="check-list">
              <li>Recurring programs at any interval — monthly, 21-day, seasonal, custom</li>
              <li>Auto-rescheduling after every completed treatment</li>
              <li>Seasonal package plans with treatment count tracking</li>
              <li>Program expiration alerts before the season ends</li>
              <li>Multiple program types on separate waiting lists — mosquito, tick, perimeter, all in one view</li>
              <li>Year-over-year renewal tracking — see which customers came back</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Active Mosquito Programs — Season View</div>
            {[
              {name:'Johnson — 122 Elmwood Cir', detail:'Mosquito Control · Every 21 days · 9,400 ft²', badge:'Due Now', active:true},
              {name:'Martinez — 415 Sycamore Blvd', detail:'Mosquito + Tick · Monthly · 7,200 ft²', badge:'Due Now', active:true},
              {name:'Williams — 308 Ridgecrest Ln', detail:'Mosquito Control · Every 21 days · 11,600 ft²', badge:'Jun 22', active:false},
              {name:'Thompson — 501 Maple Dr', detail:'Mosquito Control · Monthly · 8,800 ft²', badge:'Jun 28', active:false},
              {name:'Davis — 77 Birchwood Ct', detail:'Perimeter Pest · Monthly · 620 ln ft', badge:'Jul 1', active:false},
            ].map(({name, detail, badge, active}) => (
              <div key={name} style={{background: active ? 'rgba(224,120,32,.07)' : 'rgba(255,255,255,.06)', border: `1px solid ${active ? 'rgba(224,120,32,.35)' : 'rgba(255,255,255,.09)'}`, borderRadius:'8px', padding:'11px 14px', marginBottom:'7px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div>
                  <div style={{color:'rgba(255,255,255,.8)', fontSize:'13px', fontWeight:600}}>{name}</div>
                  <div style={{color:'rgba(255,255,255,.38)', fontSize:'11px', marginTop:'2px'}}>{detail}</div>
                </div>
                <div style={{fontSize:'10px', fontWeight:700, padding:'3px 9px', borderRadius:'10px', background: active ? 'rgba(224,120,32,.2)' : 'rgba(255,255,255,.06)', border: `1px solid ${active ? 'rgba(224,120,32,.4)' : 'rgba(255,255,255,.12)'}`, color: active ? 'var(--orange)' : 'rgba(255,255,255,.4)'}}>{badge}</div>
              </div>
            ))}
            <div style={{marginTop:'10px', background:'rgba(224,120,32,.08)', border:'1px solid rgba(224,120,32,.2)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.4)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Season Total</div>
              <div style={{color:'var(--orange)', fontSize:'12px', fontWeight:700}}>147 active programs · 83 due this week</div>
            </div>
          </div>
        </div>
      </section>

      {/* LASSO */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Lasso — Circle Map Route Builder</span>
            <h2>Draw a Circle. See Every Mosquito Control Stop Due Inside. Build the Route in Minutes.</h2>
            <p>Stop pulling up addresses one at a time. Open Lasso, draw a circle over any neighborhood or service zone, and SprayBossPro instantly shows you every property with a mosquito control treatment due inside that boundary — customer name, sq ft or linear ft, program type, and route revenue. All of them.</p>
            <p>Select all with one click, let SprayBossPro optimize the drive order, and push the route directly to your technician&apos;s phone. A full day of mosquito control routes in minutes — not the first hour of your morning.</p>
            <ul className="check-list">
              <li>Draw a circle on any neighborhood or service zone</li>
              <li>See every mosquito control stop due inside — instantly</li>
              <li>Filter by program type — mosquito only, tick add-on, perimeter, any mix</li>
              <li>Route revenue and total sq ft or linear ft shown before you commit</li>
              <li>Drive order optimized automatically to cut windshield time</li>
              <li>Route pushed to tech&apos;s phone — they see stops, notes, and application log</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'10px'}}>Lasso — Northside Mosquito Route</div>
            <div style={{display:'flex', flexDirection:'column', gap:'7px'}}>
              {[
                {n:1, name:'Johnson — 122 Elmwood Cir', detail:'Mosquito Control · Every 21 days', sqft:'9,400 ft²'},
                {n:2, name:'Martinez — 415 Sycamore Blvd', detail:'Mosquito + Tick · Monthly', sqft:'7,200 ft²'},
                {n:3, name:'Williams — 308 Ridgecrest Ln', detail:'Mosquito Control · Every 21 days', sqft:'11,600 ft²'},
              ].map(({n, name, detail, sqft}) => (
                <div key={n} style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px'}}>
                  <div style={{background:'rgba(224,120,32,.2)', border:'1px solid rgba(224,120,32,.4)', color:'var(--orange)', fontSize:'10px', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>{n}</div>
                  <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.8)', fontSize:'12px', fontWeight:600}}>{name}</div><div style={{color:'rgba(255,255,255,.35)', fontSize:'10px'}}>{detail}</div></div>
                  <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', fontWeight:600}}>{sqft}</div>
                </div>
              ))}
              <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'10px 12px', display:'flex', alignItems:'center', gap:'10px', opacity:.5}}>
                <div style={{background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', color:'rgba(255,255,255,.3)', fontSize:'10px', fontWeight:700, width:'22px', height:'22px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>+</div>
                <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.3)', fontSize:'12px'}}>11 more stops selected…</div></div>
                <div style={{color:'rgba(255,255,255,.3)', fontSize:'11px', fontWeight:600}}>96,400 ft²</div>
              </div>
            </div>
            <div style={{marginTop:'10px', background:'rgba(224,120,32,.1)', border:'1px solid rgba(224,120,32,.25)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Route Total</div>
              <div style={{color:'var(--orange)', fontSize:'13px', fontWeight:700}}>14 stops · 124,600 ft² · $1,960</div>
            </div>
          </div>
        </div>
      </section>

      {/* SMS ALERTS */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Automated SMS Alerts</span>
            <h2>Customers Know You&apos;re Coming, When You&apos;re Done, and When It&apos;s Safe to Go Back Outside.</h2>
            <p>Mosquito control customers have specific questions — when is my technician coming, how long before kids and pets can go back in the yard, was the treatment done today? SprayBossPro sends the right message automatically at every step so you never have to field those calls.</p>
            <p>Pre-built alert templates go out the day before the treatment, when your tech is on the way, and when the job is complete — including re-entry interval information. Every message is sent automatically the moment it&apos;s triggered.</p>
            <ul className="check-list">
              <li>Day-before reminder with appointment window</li>
              <li>On-the-way alert when tech is heading to the property</li>
              <li>Service complete notification with re-entry interval reminder</li>
              <li>Next treatment date included automatically in the complete alert</li>
              <li>Two-way SMS inbox — customers can reply and you see it instantly</li>
              <li>10+ pre-built mosquito control alert templates — ready to use on day one</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'14px'}}>SMS Thread — Johnson Residence</div>
            <div style={{fontSize:'9px', textTransform:'uppercase', letterSpacing:'.6px', color:'rgba(255,255,255,.3)', marginBottom:'4px', textAlign:'right'}}>Yesterday · Day-Before Alert</div>
            <div className="sms-bubble sms-out">Hi Linda! This is Smith Mosquito Control. Just a reminder your mosquito treatment is scheduled for tomorrow between 8am–12pm. We&apos;ll text when we&apos;re on the way.</div>
            <div style={{fontSize:'9px', textTransform:'uppercase', letterSpacing:'.6px', color:'rgba(255,255,255,.3)', marginBottom:'4px'}}>Today · On-the-Way Alert</div>
            <div className="sms-bubble sms-out">Hi Linda! Your tech Jake is headed to 122 Elmwood Cir now — estimated arrival in about 15 minutes.</div>
            <div style={{fontSize:'9px', textTransform:'uppercase', letterSpacing:'.6px', color:'rgba(255,255,255,.3)', marginBottom:'4px', textAlign:'right'}}>Customer Reply</div>
            <div className="sms-bubble sms-in">Perfect, thank you! Dog is inside.</div>
            <div style={{fontSize:'9px', textTransform:'uppercase', letterSpacing:'.6px', color:'rgba(255,255,255,.3)', marginBottom:'4px'}}>Service Complete Alert</div>
            <div className="sms-bubble sms-out">Hi Linda! Your mosquito treatment is complete. Please keep pets and children off treated areas for 30 minutes while it dries. Your next treatment is scheduled for Jul 7. — Smith Mosquito Control</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 64px'}}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">From Waiting List to Treated Properties — Same Morning</h2>
          <p className="section-sub">SprayBossPro is built around the way mosquito control companies actually work — recurring programs, zone-based routes, and customers who want to know what&apos;s happening at every step. For a closer look at how 21-day interval scheduling runs automatically all season, read <a href="/blogs/schedule-mosquito-control-treatments-seasonal-intervals" style={{color:'var(--orange)', fontWeight:600}}>How to Schedule Mosquito Control Treatments at the Right Seasonal Intervals</a>.</p>
        </div>
        <div className="steps-grid">
          <div className="step-box"><div className="step-circle">1</div><h3>Check the Program Waiting List</h3><p>Every morning, see every mosquito control treatment due today — organized by program type, with total sq ft or linear ft and stops waiting. Know your full day instantly.</p></div>
          <div className="step-box"><div className="step-circle">2</div><h3>Lasso a Treatment Zone</h3><p>Draw a circle on any neighborhood. SprayBossPro shows every mosquito control stop due inside — service type, sq ft or linear ft, revenue. Add them all to a route in one click.</p></div>
          <div className="step-box"><div className="step-circle">3</div><h3>Dispatch — Alerts Fire Automatically</h3><p>Push the optimized route to your tech&apos;s phone. Day-before and on-the-way SMS alerts fire automatically — no one on your team has to send anything.</p></div>
          <div className="step-box"><div className="step-circle">4</div><h3>Complete, Log &amp; Auto-Reschedule</h3><p>Tech completes the job and logs the application on their phone. Service complete SMS goes out automatically. Next treatment auto-schedules back onto the waiting list.</p></div>
        </div>
      </section>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Everything a Mosquito Control Company Needs.<br /><span>$129/Month. All In.</span></h2>
        <p>SprayBossPro isn&apos;t generic field service software patched to work for mosquito control. It&apos;s built for recurring treatment programs, zone-based routing, compliance logging, and the customer communication that mosquito control companies deal with every single season.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">🗺️</div><h4>Lasso Circle Map Route Builder</h4><p>Draw a circle on any neighborhood and instantly see every mosquito control stop due inside. Build a full day of optimized routes in minutes — not an hour.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📋</div><h4>Sq Ft or Linear Ft Waiting List</h4><p>Waiting list organized by program type — mosquito, tick, perimeter, or any service you run. See total sq ft or linear ft and stops before you build a single route.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔄</div><h4>Recurring Program Auto-Scheduling</h4><p>Monthly, every 21 days, seasonal, or any interval. Treatments reschedule automatically when complete. Customers never fall off the program.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Automated SMS Alerts</h4><p>Day-before, on-the-way, service complete, and re-entry interval alerts — sent automatically on every job. 10+ pre-built mosquito control templates included.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🧪</div><h4>Chemical Application Logs</h4><p>Log product, EPA reg number, rate, gallons, sq ft or linear ft treated, weather, and applicator license on every job. Print compliance reports on demand.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Seasonal Package Plans</h4><p>Sell seasonal mosquito control packages with treatment count tracking. SprayBossPro alerts you before programs expire so you can renew before the season ends.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Technicians</h4><p>Techs see their optimized route, customer notes, gate codes, pet warnings, and the application log form on their phone. No paper, no calls back to the office.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Card-on-File Payments</h4><p>Charge cards automatically after each mosquito control treatment. No invoice chasing, no payment add-on fee — included in the $129/month flat rate.</p></div>
          <div className="premium-card"><div className="premium-card-icon">👥</div><h4>Unlimited Technicians</h4><p>Run one mosquito control truck or a full fleet. SprayBossPro doesn&apos;t charge per user — add every tech in your company, the price stays $129/month.</p></div>
        </div>
      </div>

      {/* PRICING */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">$129/Month. Every Feature. One Flat Price.</h2>
          <p className="section-sub">No per-technician fees. No add-ons for SMS alerts or compliance logs. No contracts. One price — every feature a mosquito control company needs.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="lc-price-card featured">
            <div className="featured-badge">Everything Included — One Price</div>
            <div className="price-tier">Mosquito Control Software — One Plan</div>
            <div style={{fontSize:'48px', fontWeight:800, color:'var(--text)', lineHeight:1}}><sup style={{fontSize:'22px', verticalAlign:'super'}}>$</sup>129</div>
            <div style={{color:'var(--muted)', fontSize:'13px', marginBottom:'24px', marginTop:'4px'}}>per month — cancel anytime</div>
            <ul className="price-features">
              <li>Lasso Circle Map Route Builder</li>
              <li>Sq Ft or Linear Ft Waiting List by Program Type</li>
              <li>Recurring Program Auto-Scheduling</li>
              <li>Seasonal Package Plans &amp; Renewal Tracking</li>
              <li>Automated SMS Alerts — 10+ pre-built types</li>
              <li>Two-Way SMS Customer Inbox</li>
              <li>Chemical Application Compliance Logs</li>
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
          <h2 className="section-title" style={{marginBottom:'48px'}}>Mosquito Control Software — Common Questions</h2>
          {[
            {q:'Does SprayBossPro work for mosquito control businesses?', a:'Yes. SprayBossPro is built for recurring spray programs including mosquito control. It handles 21-day auto-interval scheduling, sq ft waiting list routing, chemical compliance logs, and automated SMS — specifically designed for the mosquito control model.'},
            {q:'How does auto-interval scheduling work?', a:'When a mosquito control treatment is logged as complete, SprayBossPro automatically adds the next treatment to the waiting list with the correct due date — 21 days later by default. No calendar entry, no rebooking. The account reappears on the waiting list when it\'s due, with all property details pre-populated.'},
            {q:'Can I add mosquito control to an existing lawn care or pest control business?', a:'Yes. SprayBossPro manages multiple service types from one account. You can run lawn care, pest control, and mosquito control routes simultaneously, with separate waiting lists by service type and service-specific SMS alert templates.'},
            {q:'Does it handle chemical compliance logs for mosquito control?', a:'Yes. Every mosquito treatment logs the product, EPA registration number, application rate, target pest, and applicator license. The chemical tracking report exports a formatted compliance log for state inspector requirements — no paper records needed.'},
            {q:'Can I track treatments remaining on a seasonal mosquito package?', a:'Yes. SprayBossPro tracks treatments remaining per customer on package programs. When a package is nearing completion, you\'re notified so you can initiate the renewal conversation before the season ends.'},
            {q:'How much does SprayBossPro cost?', a:'$129/month, flat. Every feature — routes, compliance logs, SMS alerts, card-on-file payments — is included at one price. No per-user fees, no add-ons. 14-day free trial, no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>SprayBossPro handles mosquito control alongside lawn care, pest control, and every other spray service from one platform — <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full platform overview</a>.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>The Mosquito Control Software<br /><span style={{color:'var(--orange)'}}>Built for Recurring Programs and Real Routes.</span></h2>
        <p>$129/month gets you Lasso routing, program auto-scheduling, compliance logs, automated SMS alerts, and card-on-file payments. No add-ons. No contracts. No per-user fees.</p>
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
