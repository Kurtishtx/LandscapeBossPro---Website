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

export default function WeedControlSoftware() {
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
        <div className="hero-badge">Weed Control Software for Lawn Care Companies</div>
        <h1>Weed Control Software with Pre-Emergent Programs,<br /><span>Compliance Logs, and Auto Re-Entry SMS.</span></h1>
        <p>LandscapeBossPro manages pre-emergent and post-emergent weed control programs for lawn care companies. Set up your timing windows once — pre-emergent rounds schedule at the right seasonal dates, post-emergent rounds reschedule at your interval after completion. Log EPA reg numbers and re-entry intervals on every application. Re-entry SMS fires automatically to every customer. $129/month, everything included.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial — $129/Month</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Per month — everything included</div></div>
          <div><div className="hero-stat-val">Pre &amp; Post</div><div className="hero-stat-lbl">Emergent programs — both handled</div></div>
          <div><div className="hero-stat-val">14-Day</div><div className="hero-stat-lbl">Free trial — no credit card</div></div>
          <div><div className="hero-stat-val">Auto</div><div className="hero-stat-lbl">Re-entry SMS on every application</div></div>
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
          alt="LandscapeBossPro weed control software showing pre-emergent and post-emergent scheduling, circle-map routing, and mobile app for technicians"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* PROGRAM TYPES */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">Built for Every Weed Control Program Type</span>
          <h2 className="section-title">Pre-Emergent, Post-Emergent, Broadleaf, and Multi-Service Combo — All in One Platform.</h2>
          <p className="section-sub">LandscapeBossPro handles the scheduling, routing, compliance logging, and re-entry SMS for every weed control program your lawn care company runs — alongside fertilizer, insect, and any other service you offer. One platform. One price.</p>
        </div>
        <div className="audience-grid">
          <div className="audience-card">
            <div className="audience-tag">Pre-Emergent Programs</div>
            <h3>Seasonal Pre-Emergent Scheduling with Timing Windows</h3>
            <p>Pre-emergent rounds need to hit the right soil temperature window — LandscapeBossPro lets you schedule them at your target seasonal date and shows them on the waiting list when they&apos;re due. Early spring and fall pre-emergent rounds tracked separately with their own compliance logs and re-entry SMS.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Post-Emergent Programs</div>
            <h3>Post-Emergent Weed Control on Auto-Reschedule</h3>
            <p>Post-emergent rounds reschedule automatically at your set interval when the previous round is completed. 4-week, 6-week, or 8-week cycles — LandscapeBossPro manages the timing between rounds so your team never manually reschedules a weed control visit between applications.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Broadleaf Control</div>
            <h3>Broadleaf Weed, Sedge &amp; Specialty Programs</h3>
            <p>Track broadleaf weed programs, nutsedge control, and specialty weed treatments alongside your main weed control rounds. Each service type has its own line on the waiting list, its own route filter in Lasso, its own compliance log, and its own re-entry interval SMS template.</p>
          </div>
          <div className="audience-card">
            <div className="audience-tag">Multi-Service Combo</div>
            <h3>Weed Control + Fertilizer Combo Programs</h3>
            <p>Run weed control and fertilizer on the same route? LandscapeBossPro lets you mix service types on any Lasso route or keep them on separate routes. All services share one waiting list, one map, and one dispatch flow — your tech sees all services for each stop in one place on their phone.</p>
          </div>
        </div>
      </section>

      {/* SCHEDULING */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Pre-Emergent &amp; Post-Emergent Program Scheduling</span>
            <h2>Pre-Emergent Hits the Right Timing Window. Post-Emergent Reschedules Itself. You Manage Neither.</h2>
            <p>LandscapeBossPro handles the timing differences between pre-emergent and post-emergent weed control automatically. Pre-emergent rounds appear on the waiting list when they hit your set seasonal date — spring pre-emergent at the right soil temp window, fall pre-emergent before the window closes.</p>
            <p>Post-emergent rounds reschedule at your set interval — 4 weeks, 6 weeks, 8 weeks — whenever the previous round is completed. No manual scheduling between rounds.</p>
            <ul className="check-list">
              <li>Pre-emergent rounds schedule at your seasonal timing window — set once per program</li>
              <li>Post-emergent rounds auto-reschedule at your interval when the previous completes</li>
              <li>Waiting list separates pre-emergent and post-emergent for easy filtering and routing</li>
              <li>Early spring and fall pre-emergent tracked as separate rounds on each property</li>
              <li>Mix weed control rounds with fertilizer and insect on the same Lasso route</li>
              <li>Overdue weed control rounds highlighted — nothing slips through between seasons</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Waiting List — Weed Control Queue by Program Type</div>
            {[
              {name:'Pre-Emergent Round 2 — Fall', sub:'28 properties · seasonal window open', ft:'249,600 ft²', active:true},
              {name:'Post-Emergent Broadleaf 4', sub:'19 properties waiting', ft:'168,800 ft²', active:true},
              {name:'Weed Control Round 3', sub:'14 properties waiting', ft:'124,200 ft²', active:false},
              {name:'Nutsedge / Sedge Control 2', sub:'8 properties waiting', ft:'71,400 ft²', active:false},
              {name:'Pre-Emergent Round 2 — Overdue', sub:'5 properties — past window', ft:'44,600 ft²', overdue:true},
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
              <div style={{color:'var(--orange)', fontSize:'12px', fontWeight:700}}>74 stops across 5 weed control programs</div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE LOGS */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Chemical Compliance Logs — EPA Reg Numbers on Every Weed Control Application</span>
            <h2>Product, EPA Reg Number, Re-Entry Interval, and Sq Ft Treated — Logged at the Property on Every Visit.</h2>
            <p>Your technician logs the full weed control application record on their phone before leaving the property — product name, EPA registration number, application rate per 1,000 sq ft or per linear ft, total area treated, re-entry interval, wind speed, temperature, and applicator license.</p>
            <p>Weed control products often have specific re-entry interval requirements that vary by product formulation. LandscapeBossPro captures the re-entry interval from the application log and uses it to trigger the right re-entry SMS to the customer automatically.</p>
            <ul className="check-list">
              <li>Product name and EPA reg number required on every weed control application</li>
              <li>Re-entry interval captured from the log and used to trigger the SMS automatically</li>
              <li>Rate per 1,000 sq ft or per linear ft — log exactly what your tech applied</li>
              <li>Wind speed, temperature, and conditions at time of application — all logged in-field</li>
              <li>Applicator license number and certification type captured for compliance</li>
              <li>Print or export compliance records by date, product, property, or applicator on demand</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'12px'}}>Weed Control Application Log — Logged In-Field on Tech&apos;s Phone</div>
            {[
              {lbl:'Property', val:'319 Birchwood Dr — 8,800 ft²', highlight:true},
              {lbl:'Service', val:'Pre-Emergent Round 2 — Fall Application'},
              {lbl:'Product Applied', val:'Dimension 2EW Pre-Emergent Herbicide'},
              {lbl:'EPA Reg Number', val:'62719-527'},
              {lbl:'Rate Applied', val:'0.5 oz / 1,000 ft² — 4.4 oz total'},
              {lbl:'Re-Entry Interval', val:'4 hours — SMS queued to customer'},
              {lbl:'Conditions', val:'Wind: 5 mph · Temp: 61°F · Partly Cloudy'},
            ].map(({lbl, val, highlight}) => (
              <div key={lbl} className="log-row" style={{marginBottom:'6px', ...(highlight ? {borderColor:'rgba(27,110,59,.35)', background:'rgba(27,110,59,.07)'} : {})}}>
                <div className="log-label">{lbl}</div>
                <div className="log-value">{val}</div>
              </div>
            ))}
            <div style={{marginTop:'12px', background:'rgba(34,197,94,.08)', border:'1px solid rgba(34,197,94,.25)', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'rgba(255,255,255,.4)', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px'}}>Log Status</div>
              <div style={{color:'#22c55e', fontSize:'12px', fontWeight:700}}>✓ Saved — Re-Entry SMS Queued</div>
            </div>
          </div>
        </div>
      </section>

      {/* SMS */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Automated Re-Entry Interval SMS on Every Weed Control Visit</span>
            <h2>Re-Entry Interval Texts Fire Automatically After Every Weed Control Application. Specific to the Product. Sent Without Your Team.</h2>
            <p>When the compliance log is saved after a weed control application, LandscapeBossPro uses the re-entry interval from the log to build the right customer SMS — &quot;please stay off the lawn for 4 hours&quot; or &quot;24 hours&quot; depending on what your tech actually applied. The text goes out automatically.</p>
            <p>Pre-emergent and post-emergent applications often have different re-entry intervals. LandscapeBossPro captures the correct interval from the application log and sends the matching SMS — not a generic template that&apos;s wrong for half your products.</p>
            <ul className="check-list">
              <li>Re-entry interval pulled from the compliance log — sends the right interval, not a generic one</li>
              <li>Service complete SMS fires automatically when the application log is saved</li>
              <li>Day-before reminder fires the evening before every weed control visit</li>
              <li>On-the-way alert fires when tech marks the job started on their phone</li>
              <li>Pre-built SMS templates for pre-emergent, post-emergent, and broadleaf control</li>
              <li>Two-way SMS inbox — all customer replies go into one organized inbox for your team</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:'14px'}}>Weed Control SMS Thread — Sent Automatically by LandscapeBossPro</div>
            <div className="sms-bubble sms-out">Hi Karen! Your fall pre-emergent weed control service is scheduled for tomorrow between 9am–12pm. No watering needed for 24 hours after. We&apos;ll text when the tech is on the way. — Green Valley Lawn</div>
            <div className="sms-label right">Day before · Sent automatically · 6:00 PM</div>
            <div className="sms-bubble sms-in">Perfect, thank you! Gate will be unlocked.</div>
            <div className="sms-label">Karen · 6:17 PM</div>
            <div className="sms-bubble sms-out">Your lawn tech is on the way — about 10 minutes. — Green Valley Lawn</div>
            <div className="sms-label right">On the way · Fires automatically · 9:44 AM</div>
            <div className="sms-bubble sms-out">Pre-emergent weed control is complete! Please keep people and pets off the lawn for 4 hours. Safe to water after that. Your next weed control visit is in approximately 6 weeks. — Green Valley Lawn</div>
            <div className="sms-label right">Complete · Re-entry interval from log · Auto-sent</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 64px'}}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">From Waiting List to Re-Entry SMS — Every Weed Control Round, Every Customer</h2>
          <p className="section-sub">LandscapeBossPro manages pre-emergent and post-emergent weed control programs from first application to compliance log to automatic re-entry SMS — with no manual scheduling between rounds ever. For a closer look at how the two program types are scheduled differently, read <a href="/blogs/pre-emergent-vs-post-emergent-weed-control-scheduling" style={{color:'var(--orange)', fontWeight:600}}>Pre-Emergent vs. Post-Emergent Weed Control: How to Schedule Both Correctly</a>.</p>
        </div>
        <div className="steps-grid">
          <div className="step-box"><div className="step-circle">1</div><h3>Check the Waiting List</h3><p>See every weed control treatment due today — pre-emergent, post-emergent, broadleaf — organized by program type with sq ft totals and stop count. Know the day&apos;s scope before you build any routes.</p></div>
          <div className="step-box"><div className="step-circle">2</div><h3>Lasso the Neighborhood</h3><p>Draw a circle on any area of the map. See every weed control stop due inside. Filter by program type — pull only pre-emergent, only post-emergent, or mix. Dispatch to your tech in one click.</p></div>
          <div className="step-box"><div className="step-circle">3</div><h3>Log the Application In-Field</h3><p>Tech logs product, EPA reg number, rate, re-entry interval, conditions, and applicator license at the property. Re-entry SMS fires to the customer automatically when the log is saved.</p></div>
          <div className="step-box"><div className="step-circle">4</div><h3>Auto-Schedule the Next Round</h3><p>Post-emergent rounds auto-reschedule at your set interval on completion. Pre-emergent rounds schedule at your seasonal timing window. Neither requires your team to touch anything between rounds.</p></div>
        </div>
      </section>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Weed Control Software Built for Lawn Care Companies.<br /><span>$129/Month. Everything Included.</span></h2>
        <p>LandscapeBossPro isn&apos;t a generic scheduling app with a weed control tag. Pre-emergent timing windows, post-emergent auto-rescheduling, EPA compliance logs, re-entry interval SMS, and Lasso routing are built specifically for companies running recurring weed control programs on residential and commercial lawns.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">🌱</div><h4>Pre-Emergent Timing Windows</h4><p>Pre-emergent rounds schedule at your seasonal target date and appear on the waiting list when due. Spring and fall rounds tracked separately per property, each with its own compliance log.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔄</div><h4>Post-Emergent Auto-Rescheduling</h4><p>Post-emergent rounds auto-reschedule at your interval when completed. 4, 6, or 8-week cycles — the waiting list handles them automatically all season without your team touching anything.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📋</div><h4>EPA Compliance Logs</h4><p>Product, EPA reg number, rate per 1,000 sq ft, re-entry interval, applicator license — all logged in-field on every application. Print compliance reports by date, product, or property on demand.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Re-Entry Interval SMS</h4><p>Re-entry interval pulled from the compliance log and used to send the right customer SMS automatically. Not a generic template — the actual interval for the product your tech applied.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🗺️</div><h4>Lasso Circle Map Routing</h4><p>Draw a circle on any neighborhood and see every weed control stop due inside. Filter by program type. Pull all stops into a route and dispatch to your tech in minutes from one map view.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📊</div><h4>Sq Ft Waiting List by Program</h4><p>Every weed control program due today in one list — pre-emergent, post-emergent, broadleaf all separated with sq ft totals. Know your full scope before you build the first route.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Technicians</h4><p>Techs see their route in order, property notes, gate codes, service history, and compliance log form on their phone. No paper. No calls to the office asking what product to use.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Card-on-File Payments</h4><p>Charge cards automatically when each weed control round is completed. Included in $129/month flat — no separate billing module and no extra transaction percentage.</p></div>
          <div className="premium-card"><div className="premium-card-icon">👥</div><h4>Unlimited Technicians</h4><p>Run one weed control truck or multiple crews. Every tech is included in the $129/month price. No per-user fee ever — the price stays flat no matter how many people use it.</p></div>
        </div>
      </div>

      {/* PRICING */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">$129/Month. Every Feature. No Add-Ons.</h2>
          <p className="section-sub">One flat price covers pre-emergent and post-emergent scheduling, compliance logs, re-entry interval SMS, Lasso routing, and unlimited technicians. No per-user fees. No contracts. No surprises.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="lc-price-card featured">
            <div className="featured-badge">Everything Included — One Price</div>
            <div className="price-tier">Weed Control Software — One Plan</div>
            <div style={{fontSize:'48px', fontWeight:800, color:'var(--text)', lineHeight:1}}><sup style={{fontSize:'22px', verticalAlign:'super'}}>$</sup>129</div>
            <div style={{color:'var(--muted)', fontSize:'13px', marginBottom:'24px', marginTop:'4px'}}>per month — cancel anytime</div>
            <ul className="price-features">
              <li>Pre-Emergent Seasonal Timing Window Scheduling</li>
              <li>Post-Emergent Auto-Rescheduling at Your Set Interval</li>
              <li>EPA Reg Number &amp; Rate Logging on Every Application</li>
              <li>Re-Entry Interval Captured &amp; Used to Trigger Auto-SMS</li>
              <li>Applicator License &amp; Conditions Logged In-Field</li>
              <li>Compliance Reports — Print by Date, Product, or Applicator</li>
              <li>Sq Ft or Linear Ft Waiting List by Weed Control Program</li>
              <li>Lasso Circle Map Route Builder</li>
              <li>Day-Before, On-the-Way &amp; Re-Entry Interval SMS Alerts</li>
              <li>10+ Pre-Built Weed Control SMS Templates</li>
              <li>Two-Way SMS Customer Inbox</li>
              <li>Mobile App for Technicians — Route, Log &amp; Complete</li>
              <li>Card-on-File Payments — Charge on Completion</li>
              <li>Unlimited Technicians — No Per-User Fees Ever</li>
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
          <h2 className="section-title" style={{marginBottom:'48px'}}>Weed Control Software — Common Questions</h2>
          {[
            {q:'Does LandscapeBossPro work for weed control businesses?', a:'Yes. LandscapeBossPro manages pre-emergent and post-emergent scheduling, sq ft-based routing, chemical compliance logs, and automated SMS — including re-entry interval messages. It handles recurring weed control programs across a full season with automatic rescheduling after each treatment.'},
            {q:'Can I schedule pre-emergent and post-emergent treatments separately?', a:'Yes. LandscapeBossPro manages multiple service types simultaneously. Pre-emergent and post-emergent appear as separate entries on the waiting list, with independent intervals, pricing, and chemical product assignments. You can route one without affecting the other.'},
            {q:'Does it handle chemical compliance logs for weed control?', a:'Yes. Every weed control treatment logs the product, EPA registration number, application rate, target weed, area treated, and applicator license. The compliance report generates a formatted log for state inspection — no paper records needed.'},
            {q:'Can LandscapeBossPro manage weed control alongside lawn care or fertilizer?', a:'Yes. LandscapeBossPro handles lawn care, fertilizer, pest control, and weed control from one account. The waiting list filters by service type, and SMS alerts are configured independently per service — so weed control customers get weed control-specific messaging.'},
            {q:'Does it send re-entry interval messages after weed control applications?', a:'Yes. Post-service SMS alerts can include re-entry timing — "Please keep people and pets off treated areas for [X time] while the product dries." Alerts fire automatically at treatment completion, specific to the weed control service type.'},
            {q:'How much does LandscapeBossPro cost for a weed control business?', a:'$129/month, flat. All features included. No per-user fees, no SMS add-ons, no extra charge for compliance logs. 14-day free trial, no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>LandscapeBossPro handles weed control alongside lawn care, fertilizer, pest control, and mosquito spray — all from one platform — <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full platform overview</a>.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Weed Control Software That Handles Pre-Emergent Timing,<br /><span style={{color:'var(--orange)'}}>Post-Emergent Auto-Scheduling, and Re-Entry SMS.</span></h2>
        <p>$129/month gets you pre-emergent seasonal scheduling, post-emergent auto-rescheduling, compliance logs, re-entry interval SMS, and Lasso routing — all built for lawn care companies running recurring weed control programs. No add-ons. No contracts.</p>
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
