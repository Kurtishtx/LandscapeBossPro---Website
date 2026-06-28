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

export default function LandscapingInvoicingSoftware() {
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
        <div className="hero-badge">Invoicing &amp; Billing for Landscapers</div>
        <h1>Landscaping Invoicing &amp; Billing Software<br /><span>Get Paid for Every Job, Every Material, Every Hour</span></h1>
        <p>Landscaping is project work and material work — a single install can carry a dozen line items, pallets of sod, yards of mulch, and a crew on the clock for three days. LandscapeBossPro turns your detailed bid into a clean invoice, stores cards on file, bills your recurring maintenance accounts automatically, and shows you exactly who still owes you.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">Line Items</div><div className="hero-stat-lbl">Detailed Estimates &amp; Bids</div></div>
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
          alt="LandscapeBossPro landscaping invoicing software dashboard on laptop showing a line-item estimate and invoice list, with the mobile app on a phone"
          style={{maxWidth:'1100px', width:'100%', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block', margin:'0 auto'}}
        />
      </div>

      {/* PREMIUM BAND */}
      <div className="premium-band">
        <h2>Affordable Doesn&apos;t Mean Cheap.<br /><span>This Is Enterprise-Level Landscaping Software.</span></h2>
        <p>$129/month sounds modest. But what you&apos;re getting isn&apos;t modest at all. LandscapeBossPro is built to the same standard as software that costs 10 times more — the difference is we built it ourselves, for ourselves, and we don&apos;t have a sales team, investor overhead, or a $500/month add-on for every feature you actually need.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">📝</div><h4>Line-Item Estimates</h4><p>Build a full install bid line by line — plants, sod, mulch, stone, labor, equipment, and disposal — with quantities, unit prices, and markups. Email it, let the client accept with one tap, and convert it to an invoice without retyping a thing.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Materials &amp; Products</h4><p>Keep a catalog of every product you install — by the yard, pallet, flat, or each. Pull saved prices straight into a bid, track what a job actually consumed, and protect your margin on material-heavy projects.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Communication Suite</h4><p>Two-way SMS inbox, automated alerts, estimate follow-up sequences, payment reminders, and review requests — all built in at the flat price. No Twilio account, no Mailchimp, no third-party setup.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Stripe Payments</h4><p>Cards on file, deposits, progress billing, charge after completion, and overdue reports — the full Stripe integration is wired in. Clients can pay instantly and you see every dollar collected in one place.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔁</div><h4>Recurring Maintenance Billing</h4><p>Put your maintenance and mowing accounts on monthly or per-visit plans and let LandscapeBossPro generate and charge the invoices automatically — no spreadsheet, no forgotten months, no chasing.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Mobile App for Your Crew</h4><p>Your crews get a mobile dashboard with their jobs for the day. Complete work, add materials used, snap photos, and trigger the invoice — all from the truck without calling the office once.</p></div>
        </div>
      </div>

      {/* ESTIMATES TO INVOICE */}
      <section className="dark-section">
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Estimate → Invoice</span>
            <h2 style={{color:'#fff'}}>Turn a Detailed Landscape Bid Into a Paid Invoice in One Click.</h2>
            <p style={{color:'rgba(255,255,255,.65)'}}>The slowest part of billing a landscaping job is rebuilding the numbers. You priced every plant, every pallet of sod, every yard of mulch, and every labor hour on the bid — then you type it all over again to invoice it. LandscapeBossPro skips that entirely. The instant a client accepts an estimate, it becomes an invoice with every line item, quantity, and price already in place.</p>
            <ul className="check-list" style={{marginTop:'20px'}}>
              <li style={{color:'rgba(255,255,255,.75)'}}>Build line-item bids with quantities, unit prices, and markups</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Pull saved materials and products straight from your catalog</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Email the bid and let clients accept with a single tap</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Accepted estimates convert to invoices instantly — no retyping</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Collect a deposit up front, bill the balance on completion</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Apply discounts and sales tax automatically on every invoice</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Auto follow-up texts go out if a bid sits unanswered</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Every dollar tracked to the job and the property it came from</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>Estimate #1042 — Backyard Install</div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Fescue Sod — 18 pallets</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>$185 / pallet</div></div>
              <div style={{marginLeft:'auto', background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$3,330</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Hardwood Mulch — 12 yd³</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>$42 / yd³</div></div>
              <div style={{marginLeft:'auto', background:'#1b6e3b', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$504</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Crew Labor — 36 hrs</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>3 crew · 2 days</div></div>
              <div style={{marginLeft:'auto', background:'#d4a017', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$2,160</div>
            </div>
            <div style={{marginTop:'14px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'#d4a017', fontSize:'16px', fontWeight:700}}>Accepted → Invoiced</div>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'12px', marginTop:'4px'}}>One tap. No numbers retyped.</div>
            </div>
          </div>
        </div>
      </section>

      {/* EASIER TO USE */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Simplicity</span>
          <h2 className="section-title">The Most Capable Landscaping Billing Software Is Also the Easiest to Learn</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>Most powerful software is complicated. LandscapeBossPro is the exception. Every screen was designed by people who actually bid, installed, and billed landscape jobs — not by UX designers who&apos;ve never loaded a pallet of sod. Your office and your crews will be using it confidently on day one.</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'24px', maxWidth:'1100px', margin:'0 auto'}}>
          {[
            {n:'01', title:'Set Up in One Afternoon', body:'Add your services, build your materials catalog, import your clients and properties, set your tax rates, and connect Stripe — most owners are billing the same day they sign up. No implementation consultant, no onboarding call, no 90-day setup timeline.'},
            {n:'02', title:'One Screen Does Everything', body:'Estimates, invoices, payments, materials, and the job board are all connected. You\'re not jumping between QuickBooks, a spreadsheet, and five browser tabs. Pull up a job and the bid, the invoice, and the balance owed are right there in one view.'},
            {n:'03', title:'Your Crews Learn It in Minutes', body:'The mobile app your crews use shows them their jobs for the day, the property details, and the line items to confirm. They mark work complete and add materials used — and the invoice is ready before they pull out of the driveway.'},
            {n:'04', title:'Billing Runs Without You', body:'Set up your recurring maintenance plans, payment reminders, and card-on-file billing once. After that, LandscapeBossPro generates the invoices, charges the cards, and chases the overdue balances automatically — whether you\'re on a job, at home, or on vacation.'},
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
          <h2 className="section-title">Generic Invoicing Wasn&apos;t Built for Landscaping</h2>
          <p className="section-sub">A landscape invoice isn&apos;t one line for one service. It&apos;s sod by the pallet, mulch by the yard, plants by the flat, stone by the ton, labor by the hour, and a deposit you already collected — all on the same job, plus a stack of recurring maintenance accounts to bill every month.</p>
        </div>
        <div style={{maxWidth:'900px', margin:'0 auto'}}>
          <div style={{background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'36px 40px', borderLeft:'5px solid var(--orange)'}}>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8, marginBottom:'16px'}}>When we were running our own landscape crews, we tried every billing tool out there. Generic invoicing apps, the big accounting suites, the ones built for &quot;any business.&quot; None of them understood what it meant to bid a <strong>design-build install with forty line items</strong>, collect a deposit, track the materials the crew actually used, then bill the balance — and still have monthly maintenance accounts to invoice on top of it.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8, marginBottom:'16px'}}>They don&apos;t have that. Because they weren&apos;t built by someone who runs a landscaping business. <strong>We were.</strong> We&apos;ve been in this industry since 2006, and LandscapeBossPro is the software we always wished existed.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:1.8}}>Every billing feature in LandscapeBossPro exists because we needed it on a real landscape job — not because a product manager in a tech office decided it sounded good.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section>
        <div className="centered" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <span className="section-label">Built for Landscaping</span>
          <h2 className="section-title">Billing Features Designed Around Project Work</h2>
          <p className="section-sub">Every tool in LandscapeBossPro was built with landscaping workflows in mind — material-heavy bids, multi-day installs, and recurring maintenance — not adapted from a generic accounting app and called good enough.</p>
        </div>
        <div className="feature-grid">
          {[
            {icon:'📝', title:'Line-Item Estimates & Bids', body:'Build a detailed install bid line by line — plants, sod, mulch, stone, labor, equipment, disposal — with quantities, unit prices, and markups. Email it and let clients accept with one tap.'},
            {icon:'📦', title:'Materials & Products Catalog', body:'Keep saved prices for everything you install, by the yard, pallet, flat, ton, or each. Drop them into any bid in seconds and track what each job actually consumed.'},
            {icon:'📄', title:'Estimate-to-Invoice Conversion', body:'Accepted bids convert to invoices instantly with every line item carried over. Filter invoices by unpaid, partial, paid, or overdue with full payment history attached.'},
            {icon:'💳', title:'Card-on-File & Deposits', body:'Store cards on file via Stripe, collect a deposit up front, charge the balance on completion, and run progress billing on big installs — all without chasing anyone down.'},
            {icon:'🔁', title:'Recurring Maintenance Billing', body:'Put maintenance and mowing accounts on monthly or per-visit plans. LandscapeBossPro generates and charges the invoices automatically so no account ever gets missed.'},
            {icon:'💬', title:'Payment Reminder Texts', body:'Unpaid invoices trigger automated payment reminder texts. Collect what you\'re owed without making uncomfortable calls or letting a balance go cold.'},
            {icon:'🔔', title:'Estimate Follow-Up Sequences', body:'Automated follow-up texts go out if a client doesn\'t respond to your bid. Let LandscapeBossPro chase the deal so you can stay on the job site.'},
            {icon:'🏷️', title:'Discounts & Sales Tax', body:'Apply percentage or fixed-dollar discounts to any bid. Set sales tax rates by jurisdiction and let LandscapeBossPro calculate and track tax on every invoice automatically.'},
            {icon:'🗓️', title:'Job & Project Scheduling', body:'Schedule multi-day installs and recurring maintenance visits, assign them to a crew and a date, and tie every job back to the estimate and invoice it belongs to.'},
            {icon:'📋', title:'The Job Board', body:'See every job waiting, scheduled, and in progress in one place — installs, hardscape, planting, sod, mulch, and maintenance — with the dollar value attached to each.'},
            {icon:'🚚', title:'Crew Dispatch & Routing', body:'Assign jobs to crews, order the day\'s stops on the map, and tighten routes so your trucks aren\'t burning fuel crisscrossing town between jobs.'},
            {icon:'🏠', title:'Client & Property Profiles', body:'Every property has its own record — job history, estimates, invoices, balances, notes, and photos. Everything tied to the address, not just the customer name.'},
            {icon:'💬', title:'Two-Way SMS Inbox', body:'Send and receive texts with clients directly inside LandscapeBossPro. Full conversation history organized by contact — no more switching to your personal phone.'},
            {icon:'⭐', title:'Automated Review Requests', body:'After a completed job, LandscapeBossPro automatically sends a Google review request — on your schedule, every time, without you lifting a finger.'},
            {icon:'⏱️', title:'Crew Hour Tracking', body:'Track crew hours per job and generate payroll-ready reports. Know your real labor cost on every install before you ever cut a paycheck.'},
            {icon:'📊', title:'Dashboard & Reports', body:'Custom stat cards show today\'s revenue, jobs completed, money owed, and outstanding balances — all at a glance the moment you log in.'},
            {icon:'👑', title:'Role-Based Access', body:'Owner, Manager, Office, Crew Lead, and Mobile roles. Control exactly what each person can see and do — from full billing access down to field-only.'},
            {icon:'👥', title:'Unlimited Users', body:'Add every office staff member, crew lead, and field worker at no extra cost. No per-seat fees. Unlimited users are included in the flat $129/month rate.'},
            {icon:'🏢', title:'Unlimited Clients & Properties', body:'No caps on clients, properties, estimates, or invoices. Whether you have 50 accounts or 5,000 — LandscapeBossPro handles it all at the same flat price.'},
          ].map(({icon, title, body}) => (
            <div key={title} className="feature-card">
              <span className="feature-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* INVOICES & PAYMENTS */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Invoices &amp; Payments</span>
            <h2>See Exactly Who Owes You — and Collect It Without Chasing.</h2>
            <p>The hardest part of landscaping isn&apos;t doing the work — it&apos;s getting paid for it. LandscapeBossPro keeps every invoice in one place, sorted by what&apos;s unpaid, partial, paid, or overdue, with the full payment history on each one. Cards on file mean you charge after completion, and automated reminders collect the rest. For a full walkthrough of how landscaping billing works end to end, read <a href="/blogs/landscaping-invoicing-billing-software-complete-guide" style={{color:'var(--orange)', fontWeight:600}}>Landscaping Invoicing &amp; Billing Software: The Complete Guide for Landscape Companies</a>.</p>
            <ul className="check-list">
              <li>Invoices filtered by unpaid, partial, paid, and overdue</li>
              <li>Cards on file — charge the moment a job is complete</li>
              <li>Deposits up front and progress billing on large installs</li>
              <li>Automated payment reminder texts on overdue balances</li>
              <li>Recurring maintenance accounts billed automatically</li>
              <li>Full payment history: amount, method, and date per invoice</li>
              <li>Outstanding-balance report so nothing slips through</li>
              <li>Every payment tied back to the job and property</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Invoices — This Month</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px'}}>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>$58,420</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Invoiced</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#1b6e3b', fontSize:'20px', fontWeight:700}}>$47,900</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Collected</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#d4a017', fontSize:'20px', fontWeight:700}}>$10,520</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Outstanding</div>
              </div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}>
                <div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>3</div>
                <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Overdue</div>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Patio &amp; Planting — Riverside</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Paid · card on file</div></div>
              <div style={{background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$8,940</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#d4a017', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Sod Install — Maple Ct.</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Overdue 9 days · reminder sent</div></div>
              <div style={{background:'#d4a017', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$3,330</div>
            </div>
          </div>
        </div>
      </section>

      {/* RECURRING & MATERIALS */}
      <section>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Recurring &amp; Materials</span>
            <h2>Bill Recurring Maintenance Automatically. Protect Margin on Materials.</h2>
            <p>Your maintenance and mowing accounts shouldn&apos;t take an afternoon to invoice every month — and your big installs shouldn&apos;t leak profit because nobody tracked the mulch. LandscapeBossPro bills recurring plans on autopilot and ties every material to the job it was used on, so your margin is protected on the projects that matter most.</p>
            <ul className="check-list">
              <li>Monthly or per-visit recurring maintenance plans</li>
              <li>Invoices generated and cards charged automatically</li>
              <li>Materials catalog priced by yard, pallet, flat, ton, or each</li>
              <li>Track materials used against the original bid per job</li>
              <li>Markups applied so every product carries its margin</li>
              <li>Card-on-file billing for every recurring account</li>
              <li>Renewal alerts so no maintenance contract lapses</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Recurring Plans — Auto-Billed</div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#22c55e', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Full Maintenance — 64 accounts</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Monthly · card on file</div></div>
              <div style={{marginLeft:'auto', background:'#16a34a', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$22,400</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#1b6e3b', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Mowing Crews — 38 accounts</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>Per visit · auto-charged</div></div>
              <div style={{marginLeft:'auto', background:'#1b6e3b', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$6,840</div>
            </div>
            <div style={{background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'8px', padding:'12px 14px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'12px'}}>
              <div style={{width:'10px', height:'10px', borderRadius:'50%', background:'#d4a017', flexShrink:0}}></div>
              <div style={{flex:1}}><div style={{color:'rgba(255,255,255,.85)', fontSize:'13px', fontWeight:600}}>Bed Refresh — Mulch by yd³</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', marginTop:'1px'}}>12 accounts · seasonal</div></div>
              <div style={{marginLeft:'auto', background:'#d4a017', color:'#fff', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'10px'}}>$4,180</div>
            </div>
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'#1b6e3b', fontSize:'16px', fontWeight:700}}>Billed while you sleep.</div>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'12px', marginTop:'4px'}}>No spreadsheet. No forgotten months.</div>
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
              <li>Materials &amp; Products Catalog</li>
              <li>Estimates, Invoices &amp; Stripe Payments</li>
              <li>Card-on-File &amp; Deposits</li>
              <li>Recurring Maintenance Billing</li>
              <li>Job Scheduling, Job Board &amp; Crew Dispatch</li>
              <li>Two-Way SMS &amp; Automated Reminders</li>
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
          <h2 className="section-title" style={{marginBottom:'48px'}}>Landscaping Invoicing &amp; Billing — Common Questions</h2>
          {[
            {q:'Is LandscapeBossPro built for landscaping invoicing?', a:'Yes. LandscapeBossPro handles the full billing side of a landscaping operation: line-item bids for installs and hardscape, a materials catalog priced by the yard, pallet, flat, or ton, deposits and progress billing, card-on-file payments, and recurring maintenance invoicing — all designed for project work, not one-line generic invoices.'},
            {q:'Can I build a detailed line-item estimate for an install?', a:'Yes. Build a bid line by line with plants, sod, mulch, stone, labor, equipment, and disposal, each with quantities, unit prices, and markups pulled from your saved materials catalog. Email it, let the client accept with one tap, and it converts straight to an invoice with nothing retyped.'},
            {q:'Does it bill recurring maintenance and mowing accounts automatically?', a:'Yes. Put your maintenance and mowing accounts on monthly or per-visit plans and LandscapeBossPro generates the invoices and charges the cards on file automatically. No spreadsheet, no forgotten months, no chasing accounts at the end of the month.'},
            {q:'Can I collect a deposit and bill the balance later?', a:'Yes. Collect a deposit up front, run progress billing on large installs, and charge the balance the moment the job is marked complete — all through the built-in Stripe integration with cards stored on file.'},
            {q:'Does it track materials used against the original bid?', a:'Yes. Your materials catalog stores saved prices, and every job tracks what was actually consumed against what you bid. That protects your margin on material-heavy projects where mulch, sod, and stone add up fast.'},
            {q:'How much does LandscapeBossPro cost?', a:'$129/month, all features included. No per-user fees, no add-ons for invoicing, payments, or estimates, no setup fees. 14-day free trial with no credit card required.'},
          ].map(({q, a}, i, arr) => (
            <div key={i} style={{padding:'28px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none'}}>
              <h3 style={{fontWeight:700, fontSize:'17px', color:'var(--text)', marginBottom:'10px', lineHeight:1.4}}>{q}</h3>
              <p style={{color:'var(--muted)', lineHeight:1.7, margin:0, fontSize:'15px'}}>{a}</p>
            </div>
          ))}
          <p style={{marginTop:'40px', color:'var(--muted)', fontSize:'15px', lineHeight:1.7}}>LandscapeBossPro handles invoicing and billing alongside estimating, scheduling, crew dispatch, and recurring maintenance — all from one platform — <a href="/" style={{color:'var(--orange)', fontWeight:600}}>see the full LandscapeBossPro platform overview</a>.</p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Stop Rebuilding Every Invoice by Hand<br />and Start Getting Paid Faster.</h2>
        <p>LandscapeBossPro is invoicing and billing software built by someone who has actually bid, installed, and collected on real landscape jobs. Try it free for 14 days.</p>
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
