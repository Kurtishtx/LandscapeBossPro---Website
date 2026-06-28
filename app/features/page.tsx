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
  [1, 2].forEach(i => {
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
  if (!(document.getElementById(`sbp${n}-agree`) as HTMLInputElement).checked) return sbpShowErr(err, 'Please agree to the Terms of Service and Privacy Policy.');
  btn.disabled = true; btn.textContent = 'Creating your account…';
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
    const first = (document.getElementById(`sbp${n}-first`) as HTMLInputElement).value.trim();
    const last  = (document.getElementById(`sbp${n}-last`)  as HTMLInputElement).value.trim();
    const comp  = (document.getElementById(`sbp${n}-company`) as HTMLInputElement).value.trim();
    await sb.auth.updateUser({ data: { full_name: first + ' ' + last } });
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from('user_profiles').upsert({ id: uid, email, role: 'full_access', is_primary_owner: true, tenant_id: null, trial_ends_at: trialEnd }, { onConflict: 'id' });
    await sb.from('company_info').insert({ user_id: uid, company_name: comp, display_name: comp });
    const reasons = ['Cancel Maintaining Self','Cancel Sold House','Cancel Too Expensive','Cancel Unknown','Dropping Customer','Sold House'].map(nm => ({ name: nm, active: true, user_id: uid }));
    await sb.from('cancellation_reasons').insert(reasons);
    document.getElementById(`sbp${n}-step2`)!.style.display = 'none';
    document.getElementById(`sbp${n}-success`)!.style.display = 'block';
    let secs = 4;
    const cd = document.getElementById(`sbp${n}-countdown`)!;
    cd.textContent = `Redirecting in ${secs} seconds…`;
    const iv = setInterval(() => {
      secs--;
      if (secs <= 0) { clearInterval(iv); window.location.href = 'https://my.spraybosspro.com/dashboard.html'; }
      else cd.textContent = `Redirecting in ${secs} second${secs === 1 ? '' : 's'}…`;
    }, 1000);
  } catch(e: any) {
    sbpShowErr(err, e.message || 'Something went wrong. Please try again.');
    btn.disabled = false; btn.textContent = 'Create My Account';
  }
}

function sbpShowErr(el: HTMLElement, msg: string) { el.textContent = msg; el.style.display = 'block'; }

export default function Features() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !sbpOpenForm) return;
      const n = sbpOpenForm;
      const form = document.getElementById('sbp-form-' + n);
      if (!form || form.style.display !== 'block') return;
      const step2 = document.getElementById(`sbp${n}-step2`);
      if (step2 && step2.style.display === 'block') sbpCreateAccount(n);
      else sbpStep2(n);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      {/* HERO */}
      <div className="hero">
        <div className="hero-badge">Full Feature List</div>
        <h1>Everything You Need to Run<br /><span>Your Spray Business</span></h1>
        <p>SprayBossPro is built specifically for lawn care and pest control. Every feature listed here is included in your $129/month — nothing locked, nothing extra.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={(e) => openSignupModal(1, e.currentTarget as HTMLElement)}>Start Your 14-Day Free Trial</button>
        </div>
      </div>

      {/* LASSO SPOTLIGHT */}
      <div className="spotlight">
        <div className="spotlight-inner">
          <div className="spotlight-text">
            <div className="spotlight-label">Only in SprayBossPro</div>
            <div className="spotlight-title">Circle an Area on the Map.<br /><span>Instantly Know Everything Inside It.</span></div>
            <div className="spotlight-desc">On the waiting list map, draw a circle around any geographic area. SprayBossPro instantly shows you the total sq ft, linear ft, stop count, number of services, and a breakdown of every service type inside that circle — before you schedule a single stop.</div>
            <ul className="spotlight-checks">
              <li>Draw a lasso around any area on the map</li>
              <li>See total sq ft and linear ft for everything inside</li>
              <li>Total stops and total services in the selected area</li>
              <li>Breakdown by service type with totals for each</li>
              <li>Schedule all circled stops with one click</li>
              <li>They drop straight onto the dispatch board with a full route map</li>
              <li>No other lawn care or pest control software does this</li>
            </ul>
          </div>
          <div className="spotlight-visual">
            <div style={{color:'rgba(255,255,255,.5)',fontSize:'11px',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px'}}>Waiting List Map — Circle Selection</div>
            <div className="mock-map">
              <div className="mock-lasso"></div>
              <div className="mock-pins">
                {['sel','sel','unsel','sel','sel','unsel','sel','sel','unsel','sel','sel','sel'].map((c,i) => (
                  <div key={i} className={`mock-pin ${c}`}></div>
                ))}
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-box"><div className="stat-val">14</div><div className="stat-lbl">Stops Selected</div></div>
              <div className="stat-box"><div className="stat-val">19</div><div className="stat-lbl">Total Services</div></div>
              <div className="stat-box"><div className="stat-val">118,400</div><div className="stat-lbl">Sq Ft</div></div>
              <div className="stat-box"><div className="stat-val">4,200</div><div className="stat-lbl">Linear Ft</div></div>
              <div className="stat-box wide"><div className="stat-val">Lawn Care 4 · 8 &nbsp;|&nbsp; Mosquito · 6 &nbsp;|&nbsp; Insect · 5</div><div className="stat-lbl">Services by Type</div></div>
            </div>
            <button style={{width:'100%',marginTop:'14px',background:'var(--orange)',color:'#fff',border:'none',borderRadius:'8px',padding:'13px',fontSize:'14px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}
              onClick={(e) => openSignupModal(1, e.currentTarget as HTMLElement)}>Schedule These 14 Stops →</button>
          </div>
        </div>
      </div>

      {/* SCHEDULING & DISPATCH */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="cat-block">
          <div className="cat-header">
            <span className="cat-icon">📅</span>
            <div><div className="cat-title">Scheduling &amp; Dispatch</div><div className="cat-desc">Build routes, assign stops, and manage your full day from one board</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Sq Ft Waiting List by Service Type',d:'See total square footage waiting for each service type before you build a route. Know what you have before you make a call.'},
              {t:'Circle-to-Schedule Map Tool',d:'Draw a circle on the waiting list map. Get instant totals — sq ft, linear ft, stops, services by type — then schedule them all at once.'},
              {t:'One-Click Schedule from Waiting List',d:'Click any property and assign a date, tech, and truck in seconds. No extra screens, no copy-paste.'},
              {t:'Daily Dispatch Board',d:'All scheduled stops for any day in one view. Filter by tech, truck, or service. Print dispatch sheets for drivers.'},
              {t:'Technician & Truck Assignment',d:'Assign a tech and truck to every stop at scheduling time. Track who handled what and with which vehicle.'},
              {t:'Mark Complete, Skip, or Reschedule',d:'Update stop status from the board or mobile app. Skipped stops return to the waiting list automatically.'},
              {t:'Day Summary Bar',d:'Total stops, total sq ft, and total revenue for the day shown at the top of the dispatch board at a glance.'},
              {t:'Full Service History per Property',d:'Every completed stop logged to the property record with date, tech, notes, and chemicals used.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* ROUTE PLANNING */}
      <section>
        <div className="cat-block">
          <div className="cat-header">
            <span className="cat-icon">🗺️</span>
            <div><div className="cat-title">Route Planning &amp; Maps</div><div className="cat-desc">Cut drive time with geographic scheduling and a live route map</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Live Route Map',d:'Every scheduled stop for the day pinned on an interactive map. See your full route before anyone leaves the shop.'},
              {t:'Drag-and-Drop Stop Reordering',d:'Reorder stops on the map or dispatch board. Build tight geographic clusters to cut windshield time.'},
              {t:'GPS Coordinates per Property',d:'Every property stores GPS coordinates for accurate map pinning and turn-by-turn navigation links.'},
              {t:'Color-Coded Status Pins',d:"Map pins update color as stops are completed or skipped — see your crew's progress in real time from the office."},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* CHEMICAL TRACKING */}
      <div className="dark-cat">
        <div className="cat-block" style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="cat-header">
            <span className="cat-icon">🧪</span>
            <div><div className="cat-title">Chemical Tracking &amp; Compliance</div><div className="cat-desc">Every application logged automatically — print a compliance report in under 30 seconds</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Application Log per Stop',d:'Product, mix rate, gallons, area treated, and weather logged on every completed job — automatically.'},
              {t:'Technician & License Tracking',d:'Record which tech made the application and their license number — required for most state compliance records.'},
              {t:'Product Catalog with Mix Recipes',d:'Build your product library once. Techs select from your catalog in the field — no free-typing product names.'},
              {t:'Area Type Logging',d:'Log treatment area — lawn, shrubs, flower beds, perimeter, interior — per application for detailed records.'},
              {t:'Filter by Product, Property, Tech, or Date',d:'Pull any slice of your chemical history instantly. Find every application of a specific product across all properties.'},
              {t:'Print-Ready Compliance Reports',d:'Generate a formatted pesticide application report for any date range or property. Ready for any state inspector.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* ESTIMATES */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="cat-block">
          <div className="cat-header">
            <span className="cat-icon">💰</span>
            <div><div className="cat-title">Estimates</div><div className="cat-desc">Build, send, and close estimates without leaving SprayBossPro</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Service Catalog for Line Items',d:'Build your service catalog once. Add line items to any estimate by selecting from your list — no retyping prices.'},
              {t:'Email Estimate Directly',d:'Send a branded estimate to the client in one click. No downloading, no copy-paste into Gmail.'},
              {t:'Online Accept Link',d:'Clients click a link to view and accept. Accepted status updates in your dashboard immediately.'},
              {t:'3-Step Automated Follow-Up',d:"3 follow-up texts go out automatically if a client doesn't respond. SprayBossPro chases the deal so you don't have to."},
              {t:'Discount Codes & Sales Tax',d:'Apply percentage or flat discounts. Set tax rates and SprayBossPro calculates tax on every estimate automatically.'},
              {t:'Estimate Status Tracking',d:'Track every estimate as Draft, Sent, Accepted, or Declined with full history and timestamps.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* INVOICES & PAYMENTS */}
      <section>
        <div className="cat-block">
          <div className="cat-header">
            <span className="cat-icon">💳</span>
            <div><div className="cat-title">Invoices &amp; Payments</div><div className="cat-desc">Get paid faster with Stripe card-on-file and automated payment reminders</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Convert Estimate to Invoice',d:'Turn any accepted estimate into an invoice in one click. Line items, discounts, and tax carry over automatically.'},
              {t:'Stripe Card-on-File',d:'Store customer cards securely via Stripe. Charge after service without the customer needing to do anything.'},
              {t:'Invoice Status Dashboard',d:'Filter all invoices by Unpaid, Partial, Paid, or Overdue. See your total outstanding balance at a glance.'},
              {t:'Partial Payments',d:'Log partial payments against any invoice. Track remaining balance and full payment history per account.'},
              {t:'3-Step Payment Reminder Sequence',d:'Unpaid invoices trigger 3 automated text reminders. Stop making uncomfortable collection calls.'},
              {t:'Full Payment History',d:'Every payment logged with amount, method, and date. Full audit trail per invoice and per customer.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* SMS & ALERTS */}
      <div className="dark-cat">
        <div className="cat-block" style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="cat-header">
            <span className="cat-icon">💬</span>
            <div><div className="cat-title">SMS &amp; Automated Alerts</div><div className="cat-desc">Two-way texting plus 10+ automated alert types — all built in, all customizable</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Two-Way SMS Inbox',d:'Send and receive texts with customers inside SprayBossPro. Full conversation history organized by contact.'},
              {t:'Service Scheduled Alert',d:'Customer gets a text the moment a service is added to the schedule. Fully customizable message.'},
              {t:'Tech On the Way Alert',d:'Notify customers automatically when your technician is heading to their property.'},
              {t:'Service Completed Alert',d:'Text the customer when the job is marked done — what was done, no phone call needed.'},
              {t:'Service Skipped Alert',d:"If a stop is skipped, an alert goes out automatically so the customer isn't left in the dark."},
              {t:'Estimate Sent & Accepted Alerts',d:'Notify clients when their estimate is on the way, and get notified yourself when they accept.'},
              {t:'Google Review Request',d:'Automatically sent after every completed service. More 5-star reviews with zero extra effort.'},
              {t:'Payment & Estimate Follow-Up Sequences',d:'3-step automated sequences for both unpaid invoices and unanswered estimates — fully customizable timing and copy.'},
              {t:'500 SMS/Month Included',d:'500 outbound SMS messages included in the $129/month. Add more in blocks of 500 for $15 each.'},
              {t:'Customizable Alert Templates',d:'Edit the message for every alert type. Use your own voice and include details that matter to your customers.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* CLIENTS & PROPERTIES */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="cat-block">
          <div className="cat-header">
            <span className="cat-icon">🏠</span>
            <div><div className="cat-title">Clients, Leads &amp; Properties</div><div className="cat-desc">Full CRM built for spray businesses — everything tied to the address, not just the name</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Client Database',d:'Full searchable database of every customer — contact info, notes, service history, invoices, and estimates in one place.'},
              {t:'Lead Management',d:'Track open prospects separately from active clients. Manage estimates, follow-ups, and conversion all in one view.'},
              {t:'Property Profiles',d:'Every address has its own record — sq footage, GPS, photos, service history, chemical log, and notes.'},
              {t:'Multiple Properties per Client',d:'One client can own multiple service addresses. Each property is tracked independently with its own full history.'},
              {t:'Property Photos & Notes',d:'Attach photos and field notes to any property. Tech notes from the field show up in the office view instantly.'},
              {t:'Unlimited Clients & Properties',d:'No caps. 50 accounts or 5,000 — same flat price, no tiers.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section>
        <div className="cat-block">
          <div className="cat-header">
            <span className="cat-icon">📦</span>
            <div><div className="cat-title">Package Programs &amp; Renewals</div><div className="cat-desc">Manage recurring treatment packages and never miss a renewal</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Custom Package Plans',d:'Create any package — 6-app lawn care, quarterly pest, annual mosquito. Fully custom service types and counts.'},
              {t:'Assign Clients to Packages',d:'Link any client to any package. Track start date, treatments used, and treatments remaining automatically.'},
              {t:'Renewal Alerts',d:'Get alerted before a package expires so you can reach out before the client looks elsewhere.'},
              {t:'Treatment Count Tracking',d:'SprayBossPro counts down remaining applications automatically each time a service is marked complete.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* TEAM & ACCESS */}
      <div className="dark-cat">
        <div className="cat-block" style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="cat-header">
            <span className="cat-icon">👥</span>
            <div><div className="cat-title">Team Management &amp; Access Control</div><div className="cat-desc">Unlimited users with role-based permissions from full access down to field-only</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Unlimited Users',d:'Add every employee — techs, office staff, managers — at no extra cost. No per-user fees, ever.'},
              {t:'Role-Based Permissions',d:'Owner, Manager, Office, Technician, and Mobile roles — each with different access levels built in.'},
              {t:'Mobile Role for Field Techs',d:'Techs on the Mobile role only see their assigned stops — no billing, client info, or business settings.'},
              {t:'Truck Management',d:'Create vehicle profiles, assign trucks to routes, and track which vehicle handled each stop.'},
              {t:'Employee Hour Tracking',d:'Log hours per job per employee. Generate payroll-ready reports without a separate system.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE APP */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="cat-block">
          <div className="cat-header">
            <span className="cat-icon">📱</span>
            <div><div className="cat-title">Mobile App for Technicians</div><div className="cat-desc">Field-optimized for your techs — no office calls, no app store required</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Daily Stop List',d:'Techs see only their assigned stops for the day — optimized for mobile with clear status and large tap targets.'},
              {t:'Mark Complete from the Field',d:'Tap to mark complete, skip, or reschedule — all without calling the office. Syncs in real time.'},
              {t:'Chemical Log Entry',d:'Techs log the product, rate, gallons, and weather at each stop from their phone. Records are automatic.'},
              {t:'Property Notes & Photos',d:'Techs can add field notes and photos to any property from their device. Office sees them instantly.'},
              {t:'No App Download Required',d:"SprayBossPro's mobile experience runs in any browser. No app store, no install, no update prompts."},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD & REPORTS */}
      <section>
        <div className="cat-block">
          <div className="cat-header">
            <span className="cat-icon">📊</span>
            <div><div className="cat-title">Dashboard &amp; Reports</div><div className="cat-desc">See what matters the moment you log in — no digging through menus</div></div>
          </div>
          <div className="feat-grid">
            {[
              {t:'Custom Dashboard Stat Cards',d:"Today's revenue, stops completed, properties served, money owed — all on your dashboard when you log in."},
              {t:'Revenue Tracking',d:"Track revenue by day, week, or month. See what's been collected vs. what's still outstanding at any time."},
              {t:'Outstanding Balance View',d:'Total amount owed across all open invoices at a glance — drill into individual accounts in one click.'},
              {t:'Chemical Compliance Reports',d:'Pull a print-ready pesticide application report for any date range, product, property, or technician in seconds.'},
              {t:'Payroll Hour Reports',d:'Employee hour totals by date range — export-ready for your payroll process without a separate system.'},
            ].map((f,i) => (
              <div key={i} className="feat-item"><div className="feat-item-title">{f.t}</div><p>{f.d}</p></div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Every Feature. One Price.<br />$129/Month.</h2>
        <p>No tiers, no locked features, no per-user fees. Start free for 14 days — no credit card required.</p>
        <div className="hero-btns">
          <button className="btn-primary" style={{fontSize:'17px',padding:'18px 44px'}} onClick={(e) => openSignupModal(2, e.currentTarget as HTMLElement)}>Start Your 14-Day Free Trial</button>
        </div>
      </div>

      {/* BACKDROP */}
      <div id="sbp-backdrop" onClick={closeAllModals} style={{display:'none',position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,.55)',zIndex:99997}}></div>

      {/* FORM 1 */}
      <div id="sbp-form-1" style={{display:'none',position:'fixed',zIndex:99999,width:'420px',maxWidth:'calc(100vw - 24px)',background:'#fff',borderRadius:'14px',border:'3px solid #e07820',boxShadow:'0 0 0 4px rgba(224,120,32,.35), 0 16px 60px rgba(0,0,0,.45)',maxHeight:'calc(100vh - 40px)',overflowY:'auto'}}>
        <div style={{background:'linear-gradient(135deg,#080010,#1e0a35)',padding:'28px 28px 22px',position:'relative'}}>
          <div style={{color:'#fff',fontSize:'20px',fontWeight:800,paddingRight:'36px'}}>Start Your 14-Day Free Trial</div>
          <div style={{color:'rgba(255,255,255,.6)',fontSize:'13px',marginTop:'5px'}}>No credit card required. Full access. Cancel anytime.</div>
          <button onClick={() => closeSignupModal(1)} style={{position:'absolute',top:'16px',right:'16px',background:'rgba(255,255,255,.12)',border:'none',color:'#fff',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'20px',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>
        <div id="sbp1-step1" style={{padding:'24px 28px'}}>
          <div id="sbp1-err1" style={{background:'#fff0f0',border:'1px solid #f5c6c6',color:'#c0392b',borderRadius:'6px',padding:'10px 12px',fontSize:'13px',marginBottom:'14px',display:'none'}}></div>
          <div style={{display:'flex',gap:'12px',marginBottom:'14px'}}>
            <div style={{flex:1}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>First Name</label><input id="sbp1-first" type="text" placeholder="John" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
            <div style={{flex:1}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Last Name</label><input id="sbp1-last" type="text" placeholder="Smith" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          </div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Company Name</label><input id="sbp1-company" type="text" placeholder="Smith Lawn & Spray Co." style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'20px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Email Address</label><input id="sbp1-email" type="email" placeholder="you@yourcompany.com" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <button onClick={() => sbpStep2(1)} style={{width:'100%',background:'#e07820',color:'#fff',border:'none',borderRadius:'6px',padding:'13px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Next: Create Password →</button>
        </div>
        <div id="sbp1-step2" style={{padding:'24px 28px',display:'none'}}>
          <div id="sbp1-err2" style={{background:'#fff0f0',border:'1px solid #f5c6c6',color:'#c0392b',borderRadius:'6px',padding:'10px 12px',fontSize:'13px',marginBottom:'14px',display:'none'}}></div>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'6px',padding:'10px 14px',marginBottom:'16px'}}><div style={{fontSize:'12px',color:'#16a34a',fontWeight:700}}>14-Day Free Trial — No Credit Card Required</div><div style={{fontSize:'12px',color:'#555',marginTop:'2px'}}>Full access to every feature. $129/month after trial.</div></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Login Email</label><input id="sbp1-login-email" type="email" readOnly style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',background:'#f8f8f8',color:'#333'}} /></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Password</label><input id="sbp1-password" type="password" placeholder="At least 8 characters" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Confirm Password</label><input id="sbp1-confirm" type="password" placeholder="Repeat password" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'18px',display:'flex',alignItems:'flex-start',gap:'10px'}}>
            <input type="checkbox" id="sbp1-agree" style={{width:'16px',height:'16px',accentColor:'#e07820',cursor:'pointer',flexShrink:0,marginTop:'3px'}} />
            <label htmlFor="sbp1-agree" style={{fontSize:'13px',color:'#555',cursor:'pointer',lineHeight:1.5}}>I agree to the <a href="https://spraybosspro.com/terms" target="_blank" rel="noreferrer" style={{color:'#e07820'}}>Terms of Service</a> and <a href="https://spraybosspro.com/privacy-policy" target="_blank" rel="noreferrer" style={{color:'#e07820'}}>Privacy Policy</a></label>
          </div>
          <button id="sbp1-create-btn" onClick={() => sbpCreateAccount(1)} style={{width:'100%',background:'#e07820',color:'#fff',border:'none',borderRadius:'6px',padding:'13px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Create My Account</button>
          <button onClick={() => sbpBackToStep1(1)} style={{width:'100%',background:'none',border:'none',color:'#888',fontSize:'13px',cursor:'pointer',marginTop:'10px',padding:'6px',fontFamily:'inherit',textDecoration:'underline'}}>← Back</button>
        </div>
        <div id="sbp1-success" style={{padding:'48px 28px',textAlign:'center',display:'none'}}>
          <div style={{width:'64px',height:'64px',background:'#16a34a',borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'30px',color:'#fff',marginBottom:'16px'}}>✓</div>
          <div style={{fontSize:'22px',fontWeight:800,color:'#1a1a2e',marginBottom:'10px'}}>You&apos;re In!</div>
          <div style={{fontSize:'15px',color:'#555',lineHeight:1.6,marginBottom:'6px'}}>Your 14-day free trial has started.<br />Taking you to your dashboard…</div>
          <div id="sbp1-countdown" style={{fontSize:'12px',color:'#aaa',marginTop:'10px'}}></div>
        </div>
      </div>

      {/* FORM 2 */}
      <div id="sbp-form-2" style={{display:'none',position:'fixed',zIndex:99999,width:'420px',maxWidth:'calc(100vw - 24px)',background:'#fff',borderRadius:'14px',border:'3px solid #e07820',boxShadow:'0 0 0 4px rgba(224,120,32,.35), 0 16px 60px rgba(0,0,0,.45)',maxHeight:'calc(100vh - 40px)',overflowY:'auto'}}>
        <div style={{background:'linear-gradient(135deg,#080010,#1e0a35)',padding:'28px 28px 22px',position:'relative'}}>
          <div style={{color:'#fff',fontSize:'20px',fontWeight:800,paddingRight:'36px'}}>Start Your 14-Day Free Trial</div>
          <div style={{color:'rgba(255,255,255,.6)',fontSize:'13px',marginTop:'5px'}}>No credit card required. Full access. Cancel anytime.</div>
          <button onClick={() => closeSignupModal(2)} style={{position:'absolute',top:'16px',right:'16px',background:'rgba(255,255,255,.12)',border:'none',color:'#fff',width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',fontSize:'20px',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>
        <div id="sbp2-step1" style={{padding:'24px 28px'}}>
          <div id="sbp2-err1" style={{background:'#fff0f0',border:'1px solid #f5c6c6',color:'#c0392b',borderRadius:'6px',padding:'10px 12px',fontSize:'13px',marginBottom:'14px',display:'none'}}></div>
          <div style={{display:'flex',gap:'12px',marginBottom:'14px'}}>
            <div style={{flex:1}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>First Name</label><input id="sbp2-first" type="text" placeholder="John" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
            <div style={{flex:1}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Last Name</label><input id="sbp2-last" type="text" placeholder="Smith" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          </div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Company Name</label><input id="sbp2-company" type="text" placeholder="Smith Lawn & Spray Co." style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'20px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Email Address</label><input id="sbp2-email" type="email" placeholder="you@yourcompany.com" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <button onClick={() => sbpStep2(2)} style={{width:'100%',background:'#e07820',color:'#fff',border:'none',borderRadius:'6px',padding:'13px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Next: Create Password →</button>
        </div>
        <div id="sbp2-step2" style={{padding:'24px 28px',display:'none'}}>
          <div id="sbp2-err2" style={{background:'#fff0f0',border:'1px solid #f5c6c6',color:'#c0392b',borderRadius:'6px',padding:'10px 12px',fontSize:'13px',marginBottom:'14px',display:'none'}}></div>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'6px',padding:'10px 14px',marginBottom:'16px'}}><div style={{fontSize:'12px',color:'#16a34a',fontWeight:700}}>14-Day Free Trial — No Credit Card Required</div><div style={{fontSize:'12px',color:'#555',marginTop:'2px'}}>Full access to every feature. $129/month after trial.</div></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Login Email</label><input id="sbp2-login-email" type="email" readOnly style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',background:'#f8f8f8',color:'#333'}} /></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Password</label><input id="sbp2-password" type="password" placeholder="At least 8 characters" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Confirm Password</label><input id="sbp2-confirm" type="password" placeholder="Repeat password" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'18px',display:'flex',alignItems:'flex-start',gap:'10px'}}>
            <input type="checkbox" id="sbp2-agree" style={{width:'16px',height:'16px',accentColor:'#e07820',cursor:'pointer',flexShrink:0,marginTop:'3px'}} />
            <label htmlFor="sbp2-agree" style={{fontSize:'13px',color:'#555',cursor:'pointer',lineHeight:1.5}}>I agree to the <a href="https://spraybosspro.com/terms" target="_blank" rel="noreferrer" style={{color:'#e07820'}}>Terms of Service</a> and <a href="https://spraybosspro.com/privacy-policy" target="_blank" rel="noreferrer" style={{color:'#e07820'}}>Privacy Policy</a></label>
          </div>
          <button id="sbp2-create-btn" onClick={() => sbpCreateAccount(2)} style={{width:'100%',background:'#e07820',color:'#fff',border:'none',borderRadius:'6px',padding:'13px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Create My Account</button>
          <button onClick={() => sbpBackToStep1(2)} style={{width:'100%',background:'none',border:'none',color:'#888',fontSize:'13px',cursor:'pointer',marginTop:'10px',padding:'6px',fontFamily:'inherit',textDecoration:'underline'}}>← Back</button>
        </div>
        <div id="sbp2-success" style={{padding:'48px 28px',textAlign:'center',display:'none'}}>
          <div style={{width:'64px',height:'64px',background:'#16a34a',borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'30px',color:'#fff',marginBottom:'16px'}}>✓</div>
          <div style={{fontSize:'22px',fontWeight:800,color:'#1a1a2e',marginBottom:'10px'}}>You&apos;re In!</div>
          <div style={{fontSize:'15px',color:'#555',lineHeight:1.6,marginBottom:'6px'}}>Your 14-day free trial has started.<br />Taking you to your dashboard…</div>
          <div id="sbp2-countdown" style={{fontSize:'12px',color:'#aaa',marginTop:'10px'}}></div>
        </div>
      </div>

      <style>{`
        .spotlight { background: linear-gradient(135deg, #080010 0%, #130520 100%); padding: 90px 40px; }
        .spotlight-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 60px; flex-wrap: wrap; }
        .spotlight-text { flex: 1; min-width: 280px; }
        .spotlight-label { display: inline-block; color: var(--orange); font-size: 12px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; margin-bottom: 12px; }
        .spotlight-title { font-size: clamp(26px, 3.5vw, 40px); font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 16px; }
        .spotlight-title span { color: var(--orange); }
        .spotlight-desc { color: rgba(255,255,255,.7); font-size: 16px; line-height: 1.8; margin-bottom: 24px; }
        .spotlight-checks { list-style: none; }
        .spotlight-checks li { display: flex; align-items: flex-start; gap: 10px; color: rgba(255,255,255,.75); font-size: 15px; margin-bottom: 12px; }
        .spotlight-checks li::before { content: '✓'; background: var(--orange); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .spotlight-visual { flex: 1; min-width: 280px; background: rgba(255,255,255,.05); border: 2px solid rgba(224,120,32,.35); border-radius: 16px; padding: 32px 28px; }
        .mock-map { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 20px; margin-bottom: 16px; position: relative; min-height: 140px; display: flex; align-items: center; justify-content: center; }
        .mock-lasso { position: absolute; top: 18px; left: 22px; right: 22px; bottom: 18px; border: 2.5px dashed var(--orange); border-radius: 50%; opacity: .7; }
        .mock-pins { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; }
        .mock-pin { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
        .mock-pin.sel { background: var(--orange); box-shadow: 0 0 0 3px rgba(224,120,32,.3); }
        .mock-pin.unsel { background: rgba(255,255,255,.25); }
        .stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .stat-box { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 12px 14px; }
        .stat-val { color: var(--orange); font-size: 18px; font-weight: 800; }
        .stat-lbl { color: rgba(255,255,255,.45); font-size: 11px; margin-top: 1px; }
        .stat-box.wide { grid-column: span 2; }
        .stat-box.wide .stat-val { color: #fff; font-size: 15px; }
        .cat-block { max-width: 1200px; margin: 0 auto 80px; }
        .cat-block:last-child { margin-bottom: 0; }
        .cat-header { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; padding-bottom: 16px; border-bottom: 2px solid var(--border); }
        .cat-icon { font-size: 36px; flex-shrink: 0; }
        .cat-title { font-size: 22px; font-weight: 800; color: var(--text); }
        .cat-desc { color: var(--muted); font-size: 14px; margin-top: 2px; }
        .feat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .feat-item { background: #fff; border: 1.5px solid var(--border); border-radius: 10px; padding: 22px 20px; transition: border-color .2s, box-shadow .2s, transform .15s; }
        .feat-item:hover { border-color: var(--orange); box-shadow: 0 4px 20px rgba(224,120,32,.1); transform: translateY(-2px); }
        .feat-item-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
        .feat-item-title::before { content: '✓'; background: var(--orange); color: #fff; border-radius: 50%; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
        .feat-item p { color: var(--muted); font-size: 13px; line-height: 1.6; }
        .dark-cat { background: linear-gradient(135deg, #080010 0%, #130520 100%); padding: 80px 40px; }
        .dark-cat .cat-title { color: #fff; }
        .dark-cat .cat-desc { color: rgba(255,255,255,.55); }
        .dark-cat .cat-header { border-bottom-color: rgba(255,255,255,.1); }
        .dark-cat .feat-item { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.1); }
        .dark-cat .feat-item:hover { border-color: var(--orange); background: rgba(255,255,255,.08); }
        .dark-cat .feat-item-title { color: #fff; }
        .dark-cat .feat-item p { color: rgba(255,255,255,.55); }
        @media (max-width: 700px) {
          section, .dark-cat, .spotlight { padding: 60px 20px; }
          .cat-block { margin-bottom: 56px; }
          .spotlight-inner { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
