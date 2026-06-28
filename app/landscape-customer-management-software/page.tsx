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

export default function LandscapeCustomerManagementSoftware() {
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
        <h1>Landscape Customer Management Software<br /><span>That Runs the Whole Job, Not Just the Calendar</span></h1>
        <p>Most field service software was built for plumbers and HVAC techs. <a href="/" style={{color:'var(--orange)', fontWeight:700, textDecoration:'none'}}>LandscapeBossPro</a> is built from the ground up for landscaping companies &mdash; the way you bid an install, track materials, schedule a multi-day project, dispatch crews, and bill recurring maintenance is completely different, and your software should be too.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">Line-Item</div><div className="hero-stat-lbl">Estimates &amp; Bids by Material</div></div>
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
          alt="LandscapeBossPro landscape customer management software dashboard on laptop showing the job board, line-item estimate, and crew dispatch, with the mobile app on a phone"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Affordable Doesn&apos;t Mean Cheap.<br /><span>This Is Enterprise-Level Landscaping Software.</span></h2>
        <p>$129/month sounds modest. But what you&apos;re getting isn&apos;t modest at all. LandscapeBossPro is built to the same standard as software that costs 10 times more &mdash; the difference is we built it ourselves, for ourselves, and we don&apos;t have a sales team, investor overhead, or a $500/month add-on for every feature you actually need.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">📐</div><h4>Line-Item Estimating</h4><p>Build install, design-build, and hardscape bids line by line &mdash; labor, materials, and equipment all itemized. Save your products and pricing once, then drop them into any estimate and watch the total, margin, and tax calculate themselves.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Materials &amp; Products Tracking</h4><p>Track every yard of mulch, pallet of sod, ton of stone, and tray of plants tied to the job that needs it. Know what you ordered, what you used, and what each project actually cost you in materials &mdash; not just what you guessed.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Communication Suite</h4><p>Two-way SMS inbox, automated alert types, estimate follow-up sequences, payment reminders, and review requests &mdash; all built in at the flat price. No Twilio account, no Mailchimp, no third-party setup.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Stripe Payments</h4><p>Cards on file, deposits, progress billing, invoicing, and overdue reports &mdash; the full Stripe integration is wired in. Collect a deposit before the dirt moves and the balance the day you finish.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔐</div><h4>Role-Based Access</h4><p>Owner, Manager, Office Staff, Crew Lead, and Mobile-only roles. Granular permission control so your crews only see what they need and your office manager can&apos;t accidentally delete a client record.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Your Crews</h4><p>Your crew leads get a mobile-optimized view of the day&apos;s jobs. Pull up the property, the scope, the material list, and job photos &mdash; mark work complete and add notes from the truck without calling the office once.</p></div>
        </div>
      </div>

      {/* JOB BOARD */}
      <section className="dark-section">
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">The Job Board — Project Command Center</span>
            <h2 style={{color:'#fff'}}>Every Install, Cleanup, and Maintenance Stop on One Board</h2>
            <p style={{color:'rgba(255,255,255,.65)'}}>Landscaping isn&apos;t one tech on one job for two hours. You&apos;re juggling a three-day paver patio, a planting install, a sod job, and a route of recurring maintenance accounts &mdash; all in the same week. The LandscapeBossPro job board shows every project and every stop in one view, with status, crew, materials, and dollar value attached to each one.</p>
            <ul className="check-list" style={{marginTop:'20px'}}>
              <li style={{color:'rgba(255,255,255,.75)'}}>See every project and maintenance stop by status: bid, scheduled, in progress, done</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Multi-day projects stay grouped &mdash; no more one job spread across five calendar entries</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Assign a crew and a truck to any job in one click</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Material list rides along with each job so nothing shows up short</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Filter by crew, service type, or date to plan the whole week at once</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Drag a job to a new day and the crew&apos;s schedule updates instantly</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Job value and deposit status visible right on the card</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Recurring maintenance accounts auto-populate the board on their cycle</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>Job Board — This Week</div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Paver Patio &amp; Walkway — Install</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Crew A · Day 2 of 3 · Mon–Wed</div></div>
              <div style={{marginLeft:'auto', background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$18,400</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1b6e3b', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Planting &amp; Mulch Bed Install</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Crew B · Scheduled · Tue</div></div>
              <div style={{marginLeft:'auto', background:'#1b6e3b', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$4,260</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#d4a017', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Sod Replacement — 6,500 ft²</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Crew A · Bid Accepted · Thu</div></div>
              <div style={{marginLeft:'auto', background:'#d4a017', color:'#08140d', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$5,100</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Maintenance Route — 14 stops</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Crew C · Recurring · Fri</div></div>
              <div style={{marginLeft:'auto', background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$1,820</div>
            </div>
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'#1b6e3b', fontSize:'16px', fontWeight:700}}>One board. The whole week.</div>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'12px', marginTop:'4px'}}>Projects and maintenance, side by side.</div>
            </div>
          </div>
        </div>
      </section>

      {/* EASIER TO USE */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Simplicity</span>
          <h2 className="section-title">The Most Capable Landscaping Software Is Also the Easiest to Learn</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>Most powerful software is complicated. LandscapeBossPro is the exception. Every screen was designed by people who have actually bid jobs and run crews &mdash; not UX designers who&apos;ve never loaded a skid steer. Your team will be using it confidently on day one.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'24px', maxWidth:'1100px', margin:'0 auto'}}>
          {[
            {n:'01', title:'Set Up in One Afternoon', body:'Add your services, build your product and material catalog, import your clients and properties, set up your automated alerts, and connect Stripe — most owners are fully operational the same day they sign up. No implementation consultant, no 90-day setup timeline.'},
            {n:'02', title:'One Screen Does Everything', body:'Estimates, job board, dispatch, materials, and invoicing are all connected. You\'re not jumping between five different modules or browser tabs. Pull up the job board and everything you need for the week is right there in a single view.'},
            {n:'03', title:'Your Crews Learn It in Minutes', body:'The mobile app your crew leads use shows them exactly what they need and nothing they don\'t. The day\'s jobs, the property info, the scope, the material list, and the complete button. No training videos, no IT ticket, no frustrated crew members.'},
            {n:'04', title:'Automation Runs Without You', body:'Set up your SMS alerts, estimate follow-ups, and payment reminders once. After that, LandscapeBossPro handles every notification, every follow-up, and every review request automatically — whether you\'re on a job, in the office, or on vacation.'},
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
          <h2 className="section-title">Generic Software Wasn&apos;t Built for Landscaping</h2>
          <p className="section-sub">Landscaping is not plumbing. You&apos;re not sending one tech to one job for two hours. You&apos;re bidding multi-day installs by the line item, ordering materials by the pallet and the yard, scheduling crews around weather, and billing recurring maintenance accounts on a cycle.</p>
        </div>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <div style={{background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'36px 40px', borderLeft:'5px solid var(--orange)'}}>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8, marginBottom:'16px'}}>When we were running our own landscaping crews, we tried every piece of software out there. The big names, the small names, the ones built for &quot;field service.&quot; None of them understood what it meant to bid a <strong>$20,000 hardscape install line by line</strong>, track the stone and base material against it, schedule three days of crew time, collect a deposit, and then circle back to bill a route of maintenance accounts &mdash; all in the same tool.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8, marginBottom:'16px'}}>They don&apos;t do that. Because they weren&apos;t built by someone who runs a landscaping business. <strong>We were.</strong> We&apos;ve been in this industry since 2006, and LandscapeBossPro is the software we always wished existed.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8}}>Every feature in LandscapeBossPro exists because we needed it on a real job site &mdash; in the bid, on the board, or on the truck. Not because a product manager in a tech office decided it sounded good.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="centered" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <span className="section-label">Built for Landscaping</span>
          <h2 className="section-title">Features Designed Around Your Operation</h2>
          <p className="section-sub">Every tool in LandscapeBossPro was built with landscaping workflows in mind &mdash; the bid, the materials, the crews, and the billing &mdash; not adapted from a plumbing app and called good enough.</p>
        </div>
        <div className="feature-grid">
          {[
            {icon:'📐', title:'Line-Item Estimates &amp; Bids', body:'Build install and hardscape bids line by line — labor, materials, equipment, each itemized. Pull from your saved catalog, adjust quantities, and the total, margin, and tax calculate automatically.'},
            {icon:'📦', title:'Materials &amp; Products Tracking', body:'Track mulch, sod, stone, plants, soil, and edging tied to the job that needs them. Know what you ordered, what you used, and what each project actually cost in materials.'},
            {icon:'🗂️', title:'Job Board', body:'Every project and maintenance stop on one board, grouped by status and crew. Multi-day installs stay together instead of being scattered across calendar entries.'},
            {icon:'📅', title:'Project Scheduling', body:'Schedule multi-day projects and recurring maintenance side by side. Assign crews and trucks, block out the days a job needs, and reschedule around weather with a drag.'},
            {icon:'🚚', title:'Crew Dispatch &amp; Routing', body:'Assign crews to jobs, sequence the day\'s stops, and tighten your maintenance routes geographically so crews spend less time driving and more time working.'},
            {icon:'💬', title:'Automated Job Alerts', body:'Automatically text customers when a job is scheduled, when the crew is on the way, and when the work is done. Set it once — LandscapeBossPro handles the communication for every job.'},
            {icon:'💰', title:'Estimates That Close', body:'Send a professional, itemized estimate straight from the platform and let clients accept with one click. Automated follow-ups go out if they don\'t respond.'},
            {icon:'🏦', title:'Deposits &amp; Progress Billing', body:'Collect a deposit before a big install starts and bill the balance — or bill in stages — when the work is done. Every dollar tracked against the job.'},
            {icon:'💳', title:'Card-on-File Payments', body:'Store cards on file via Stripe. Charge after service, send invoices, and collect without chasing anyone down. Every payment tracked in one place.'},
            {icon:'🔁', title:'Recurring Maintenance Plans', body:'Set up recurring maintenance accounts on a weekly or biweekly cycle. The job board auto-populates each cycle and bills the client on schedule.'},
            {icon:'📱', title:'Mobile App for Crews', body:'Crew leads get a mobile view of the day\'s jobs — scope, materials, and property info. Mark work complete, add photos and notes, right from the truck.'},
            {icon:'🏠', title:'Client &amp; Property Profiles', body:'Every property has its own record — service and project history, material lists, notes, GPS coordinates, and photos. Everything tied to the address, not just the customer.'},
            {icon:'💬', title:'Two-Way SMS Inbox', body:'Send and receive texts with customers directly inside LandscapeBossPro. Full conversation history organized by contact — no more switching to your personal phone.'},
            {icon:'⭐', title:'Automated Review Requests', body:'After every completed job, LandscapeBossPro automatically sends a Google review request to the customer — on your schedule, every time, without you lifting a finger.'},
            {icon:'📄', title:'Invoice Management', body:'Convert accepted estimates to invoices instantly. Filter by unpaid, partial, paid, or overdue. Every dollar tracked with full payment history, method, and date.'},
            {icon:'🏷️', title:'Discount Codes &amp; Sales Tax', body:'Apply percentage or fixed-dollar discounts to any estimate. Set sales tax rates by jurisdiction and let LandscapeBossPro calculate and track tax on every invoice automatically.'},
            {icon:'👥', title:'Client &amp; Lead Management', body:'Manage existing clients and active prospects side by side. Track estimates, project history, and notes tied to each contact in a full searchable database.'},
            {icon:'👑', title:'Role-Based Access', body:'Owner, Manager, Office, Crew Lead, and Mobile roles. Control exactly what each person can see and do — from full access down to field-only.'},
            {icon:'🚛', title:'Truck &amp; Equipment Management', body:'Create truck profiles, assign vehicles and equipment to jobs, and track which truck handled each project. Know what\'s on every truck every day.'},
            {icon:'⏱️', title:'Employee Hour Tracking', body:'Track crew hours per job and generate payroll-ready reports. Know your labor cost per project and exactly what you owe before payday.'},
            {icon:'📊', title:'Dashboard &amp; Reports', body:'Custom stat cards show today\'s revenue, jobs completed, projects in progress, money owed, and more — all at a glance the moment you log in.'},
            {icon:'🔔', title:'Automated Alert Types', body:'Job scheduled, completed, rescheduled, estimate sent, estimate accepted, review request, payment declined, inbound text — all automated, all customizable.'},
            {icon:'👥', title:'Unlimited Users', body:'Add every crew member, office staff, and lead at no extra cost. No per-seat fees. Unlimited users are included in the flat $129/month rate.'},
            {icon:'🏢', title:'Unlimited Clients &amp; Properties', body:'No caps on clients, properties, or leads. Whether you have 50 accounts or 5,000 — LandscapeBossPro handles it all at the same flat price.'},
          ].map(({icon, title, body}) => (
            <div key={title} className="feature-card">
              <span className="feature-icon">{icon}</span>
              <h3 dangerouslySetInnerHTML={{__html: title}}></h3>
              <p dangerouslySetInnerHTML={{__html: body}}></p>
            </div>
          ))}
        </div>
      </section>

      {/* ESTIMATES & MATERIALS */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Estimates &amp; Materials</span>
            <h2>Bid the Job Line by Line. Track Every Yard, Pallet, and Plant.</h2>
            <p>This is where landscaping software lives or dies. LandscapeBossPro lets you build a bid line by line from your own product catalog &mdash; labor, mulch, sod, stone, plants, edging &mdash; with quantity, unit price, margin, and tax all calculating in real time. Then it tracks those materials against the job so you know what each project actually cost. For a deeper walkthrough of how customer profiles, bids, and billing tie together, read <a href="/blogs/landscape-customer-management-software-complete-guide" style={{color:'var(--orange)', fontWeight:600}}>Landscape Customer Management Software: The Complete Guide for Landscaping Companies</a>.</p>
            <ul className="check-list">
              <li>Saved product &amp; material catalog with unit pricing</li>
              <li>Line-item estimates with quantity, price, margin, and tax</li>
              <li>Materials tracked per job — ordered vs. used</li>
              <li>One-click convert accepted bid to a scheduled job</li>
              <li>Collect a deposit before the work starts</li>
              <li>Job costing: materials and labor against revenue</li>
              <li>Reusable templates for common installs</li>
              <li>Professional, branded estimates clients can accept online</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Estimate — Backyard Install</div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Hardwood Mulch — Installed</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>18 yd³ · $65 / yd³</div></div>
              <div style={{marginLeft:'auto', background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$1,170</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1b6e3b', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Shrubs &amp; Perennials</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>34 plants · installed</div></div>
              <div style={{marginLeft:'auto', background:'#1b6e3b', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$2,210</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#d4a017', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Crew Labor — Install</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>2 crew · 1.5 days</div></div>
              <div style={{marginLeft:'auto', background:'#d4a017', color:'#08140d', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$1,680</div>
            </div>
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Estimate Total · incl. tax</div><div style={{color:'#1b6e3b', fontSize:'20px', fontWeight:800}}>$5,492</div></div>
              <div style={{background:'#16a34a', color:'#fff', fontSize:'12px', fontWeight:700, padding:'8px 14px', borderRadius:'8px'}}>Accepted ✓</div>
            </div>
          </div>
        </div>
      </section>

      {/* DISPATCH & BILLING */}
      <section>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Dispatch &amp; Billing</span>
            <h2>Dispatch the Crew, Then Get Paid &mdash; All in One Place</h2>
            <p>Once a bid is accepted, LandscapeBossPro carries it all the way through. Schedule it on the board, dispatch the crew with the scope and material list attached, let them mark it complete from the truck, then convert it to an invoice and collect &mdash; with card-on-file billing for your recurring maintenance accounts running automatically in the background.</p>
            <ul className="check-list">
              <li>Assign crews and trucks to each job and route the day</li>
              <li>Crews see scope, materials, and photos on the mobile app</li>
              <li>Mark jobs complete, skipped, or rescheduled from the field</li>
              <li>Convert accepted bids and finished jobs to invoices instantly</li>
              <li>Card-on-file billing for recurring maintenance plans</li>
              <li>Automated payment reminder texts on overdue invoices</li>
              <li>Filter invoices by unpaid, partial, paid, or overdue</li>
              <li>Customer texts at every step — scheduled, on the way, done</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Dispatch &amp; Billing — Today</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px'}}>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>9</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Jobs Dispatched</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>3</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Crews Out</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#1b6e3b', fontSize:'20px', fontWeight:700}}>$7,140</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Invoiced Today</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#1b6e3b', fontSize:'20px', fontWeight:700}}>$2,300</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Deposits Collected</div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Maintenance Plan · Card on File</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>14 accounts · auto-billed</div></div>
              <div style={{background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>Paid</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#d4a017', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Patio Install · Balance Due</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Reminder text sent</div></div>
              <div style={{background:'#d4a017', color:'#08140d', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$9,200</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">One Flat Price. Everything Included.</h2>
          <p className="section-sub">We were paying $500–$700 a month for software that nickel-and-dimed us. We built LandscapeBossPro to be the pricing we always wished existed.</p>
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
              <li>Line-Item Estimates &amp; Bids</li>
              <li>Materials &amp; Products Tracking</li>
              <li>Job Board, Scheduling &amp; Crew Dispatch</li>
              <li>Estimates, Invoices &amp; Stripe Payments</li>
              <li>Deposits, Progress Billing &amp; Card-on-File</li>
              <li>Recurring Maintenance Plans</li>
              <li>Two-Way SMS &amp; Automated Alerts</li>
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
          <h2 className="section-title" style={{marginBottom:'48px'}}>Landscape Customer Management Software — Common Questions</h2>
          {[
            {q:'Is LandscapeBossPro built for landscaping businesses?', a:'Yes. LandscapeBossPro handles the full landscaping operation: line-item estimates for installs and hardscape, materials and products tracking, a job board for projects and maintenance, crew dispatch and routing, invoicing with deposits and progress billing, card-on-file recurring plans, and automated customer texts. It\'s designed for companies running real projects and crews, not general service businesses.'},
            {q:'Can I bid an install line by line and track the materials against it?', a:'Yes. Build a bid from your saved product and material catalog — mulch, sod, stone, plants, labor, equipment — each as its own line with quantity, unit price, margin, and tax. Once the job is running, LandscapeBossPro tracks those materials against it so you can see what each project actually cost versus what you bid.'},
            {q:'Does it handle both project work and recurring maintenance?', a:'Yes. The job board shows multi-day install projects and recurring maintenance accounts side by side. Maintenance plans auto-populate the board on their cycle and can bill the customer\'s card on file automatically, while project work flows from bid to deposit to scheduled job to final invoice.'},
            {q:'How does crew scheduling and dispatch work?', a:'You schedule jobs on the board, assign a crew and a truck, and the crew sees the scope, the material list, and the property info on the mobile app. They mark work complete and add photos from the truck. You can sequence the day\'s stops to keep routes tight and reschedule around weather with a drag.'},
            {q:'Does it replace spreadsheets and separate apps?', a:'Yes. LandscapeBossPro replaces spreadsheet bidding, job scheduling, materials tracking, customer management, invoicing, and SMS in one platform. Most owners are fully operational the same day they sign up — no onboarding consultant, no implementation timeline.'},
            {q:'How much does LandscapeBossPro cost?', a:'$129/month, all features included. No per-user fees, no add-ons for estimating or dispatch tools, no setup fees. 14-day free trial with no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>LandscapeBossPro manages your installs, hardscape, planting, sod, mulch, and recurring maintenance accounts &mdash; all from one platform &mdash; <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full platform overview</a>.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Stop Running Your Landscaping Business<br />on Software Built for Plumbers.</h2>
        <p>LandscapeBossPro is the only landscape customer management software built by someone who has actually bid the job and run the crew. Try it free for 14 days.</p>
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
