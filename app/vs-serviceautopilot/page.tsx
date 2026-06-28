'use client';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';

const SBP_URL = 'https://knjdbgroiyhvqwrpqzcx.supabase.co';
const SBP_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuamRiZ3JvaXlodnF3cnBxemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTczMDMsImV4cCI6MjA5NTA3MzMwM30.zoExtkem-XZqU86S4yJjA_xOOaS1G0IPU2M9OAAza2g';
let sbpClient: any = null;
let sbpOpenForm = 0;

function getSbpClient() { if (!sbpClient) sbpClient = (window as any).supabase.createClient(SBP_URL, SBP_ANON); return sbpClient; }
function openSignupModal(n: number, btn: HTMLElement) { closeAllModals(); sbpOpenForm = n; const form = document.getElementById('sbp-form-' + n)!; const rect = btn.getBoundingClientRect(); const formW = Math.min(420, window.innerWidth - 24); const centerX = rect.left + rect.width / 2; let top = rect.bottom + 12; let left = centerX - formW / 2; if (top + 460 > window.innerHeight) { top = rect.top - 460 - 12; if (top < 12) top = 12; } top = Math.max(12, top); left = Math.max(12, Math.min(left, window.innerWidth - formW - 12)); (form as HTMLElement).style.top = top + 'px'; (form as HTMLElement).style.left = left + 'px'; (form as HTMLElement).style.display = 'block'; document.getElementById('sbp-backdrop')!.style.display = 'block'; document.body.style.overflow = 'hidden'; }
function closeSignupModal(n: number) { document.getElementById('sbp-form-' + n)!.style.display = 'none'; document.getElementById('sbp-backdrop')!.style.display = 'none'; document.body.style.overflow = ''; sbpOpenForm = 0; }
function closeAllModals() { [1,2,3].forEach(i => { const el = document.getElementById('sbp-form-' + i); if (el) el.style.display = 'none'; }); const bd = document.getElementById('sbp-backdrop'); if (bd) bd.style.display = 'none'; document.body.style.overflow = ''; sbpOpenForm = 0; }
function sbpStep2(n: number) { const err = document.getElementById('sbp' + n + '-err1')!; err.style.display = 'none'; const first = (document.getElementById('sbp' + n + '-first') as HTMLInputElement).value.trim(); const last = (document.getElementById('sbp' + n + '-last') as HTMLInputElement).value.trim(); const comp = (document.getElementById('sbp' + n + '-company') as HTMLInputElement).value.trim(); const email = (document.getElementById('sbp' + n + '-email') as HTMLInputElement).value.trim(); if (!first || !last) return sbpShowErr(err as HTMLElement, 'Please enter your first and last name.'); if (!comp) return sbpShowErr(err as HTMLElement, 'Please enter your company name.'); if (!email || !email.includes('@')) return sbpShowErr(err as HTMLElement, 'Please enter a valid email address.'); (document.getElementById('sbp' + n + '-login-email') as HTMLInputElement).value = email; document.getElementById('sbp' + n + '-step1')!.style.display = 'none'; document.getElementById('sbp' + n + '-step2')!.style.display = 'block'; (document.getElementById('sbp' + n + '-password') as HTMLInputElement).focus(); }
function sbpBackToStep1(n: number) { document.getElementById('sbp' + n + '-step2')!.style.display = 'none'; document.getElementById('sbp' + n + '-step1')!.style.display = 'block'; document.getElementById('sbp' + n + '-err2')!.style.display = 'none'; }
async function sbpCreateAccount(n: number) { const err = document.getElementById('sbp' + n + '-err2')!; const btn = document.getElementById('sbp' + n + '-create-btn') as HTMLButtonElement; err.style.display = 'none'; const email = (document.getElementById('sbp' + n + '-login-email') as HTMLInputElement).value.trim(); const password = (document.getElementById('sbp' + n + '-password') as HTMLInputElement).value; const confirm = (document.getElementById('sbp' + n + '-confirm') as HTMLInputElement).value; if (password.length < 8) return sbpShowErr(err as HTMLElement, 'Password must be at least 8 characters.'); if (password !== confirm) return sbpShowErr(err as HTMLElement, 'Passwords do not match.'); if (!(document.getElementById('sbp' + n + '-agree') as HTMLInputElement).checked) return sbpShowErr(err as HTMLElement, 'Please agree to the Terms of Service and Privacy Policy.'); btn.disabled = true; btn.textContent = 'Creating your account…'; try { const res = await fetch(SBP_URL + '/functions/v1/manage-users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SBP_ANON, 'apikey': SBP_ANON }, body: JSON.stringify({ action: 'create', email, password }) }); const result = await res.json(); if (result.error) throw new Error(result.error); const sb = getSbpClient(); const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password }); if (signInErr) throw new Error(signInErr.message); const uid = signInData.user.id; const first = (document.getElementById('sbp' + n + '-first') as HTMLInputElement).value.trim(); const last = (document.getElementById('sbp' + n + '-last') as HTMLInputElement).value.trim(); const comp = (document.getElementById('sbp' + n + '-company') as HTMLInputElement).value.trim(); await sb.auth.updateUser({ data: { full_name: first + ' ' + last } }); const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); await sb.from('user_profiles').upsert({ id: uid, email, role: 'full_access', is_primary_owner: true, tenant_id: null, trial_ends_at: trialEnd }, { onConflict: 'id' }); await sb.from('company_info').insert({ user_id: uid, company_name: comp, display_name: comp }); const reasons = ['Cancel Maintaining Self', 'Cancel Sold House', 'Cancel Too Expensive', 'Cancel Unknown', 'Dropping Customer', 'Sold House'].map(nm => ({ name: nm, active: true, user_id: uid })); await sb.from('cancellation_reasons').insert(reasons); document.getElementById('sbp' + n + '-step2')!.style.display = 'none'; document.getElementById('sbp' + n + '-success')!.style.display = 'block'; let secs = 4; const cd = document.getElementById('sbp' + n + '-countdown')!; cd.textContent = 'Redirecting in ' + secs + ' seconds…'; const iv = setInterval(() => { secs--; if (secs <= 0) { clearInterval(iv); window.location.href = 'https://my.landscapebosspro.com/dashboard.html'; } else cd.textContent = 'Redirecting in ' + secs + ' second' + (secs === 1 ? '' : 's') + '…'; }, 1000); } catch (e: any) { sbpShowErr(err as HTMLElement, e.message || 'Something went wrong. Please try again.'); btn.disabled = false; btn.textContent = 'Create My Account'; } }
function sbpShowErr(el: HTMLElement, msg: string) { el.textContent = msg; el.style.display = 'block'; }

export default function VsServiceAutopilot() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !sbpOpenForm) return;
      const n = sbpOpenForm;
      const form = document.getElementById('sbp-form-' + n);
      if (!form || form.style.display !== 'block') return;
      const step2 = document.getElementById('sbp' + n + '-step2');
      if (step2 && step2.style.display === 'block') sbpCreateAccount(n); else sbpStep2(n);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --purple-dark:#08140d; --purple-mid:#0a1510; --purple-deep:#0f2417; --orange:#1b6e3b; --orange-dark:#14542d; --text:#1a1a2e; --muted:#555; --light-bg:#f8f7fc; --border:#e4e0f0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: var(--text); background: #fff; line-height: 1.6; }
        .hero { background: linear-gradient(135deg, #08140d 0%, #0f2417 60%, #15321f 100%); padding: 100px 40px 80px; text-align: center; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(27,110,59,.15) 0%, transparent 70%); pointer-events: none; }
        .hero-badge { display: inline-block; background: rgba(27,110,59,.15); border: 1px solid rgba(27,110,59,.4); color: var(--orange); font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px; }
        .hero h1 { color: #fff; font-size: clamp(28px, 4vw, 50px); font-weight: 800; line-height: 1.15; max-width: 900px; margin: 0 auto 20px; }
        .hero h1 span { color: var(--orange); }
        .hero p { color: rgba(255,255,255,.75); font-size: clamp(16px, 2vw, 19px); max-width: 660px; margin: 0 auto 40px; }
        .hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: var(--orange); color: #fff !important; padding: 16px 36px; border-radius: 6px; font-size: 16px; font-weight: 700; text-decoration: none; transition: background .2s, transform .1s; display: inline-block; cursor: pointer; border: none; }
        .btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); }
        .hero-stats { display: flex; justify-content: center; gap: 50px; margin-top: 64px; flex-wrap: wrap; }
        .hero-stat-val { color: var(--orange); font-size: 36px; font-weight: 800; }
        .hero-stat-lbl { color: rgba(255,255,255,.6); font-size: 13px; margin-top: 2px; }
        section { padding: 90px 40px; }
        .section-label { display: inline-block; color: var(--orange); font-size: 12px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; margin-bottom: 12px; }
        .section-title { font-size: clamp(26px, 4vw, 40px); font-weight: 800; line-height: 1.2; margin-bottom: 16px; color: var(--text); }
        .section-sub { color: var(--muted); font-size: 17px; max-width: 600px; margin-bottom: 56px; }
        .centered { text-align: center; }
        .centered .section-sub { margin-left: auto; margin-right: auto; }
        .compare-wrap { max-width: 960px; margin: 0 auto; overflow-x: auto; }
        .compare-table { width: 100%; border-collapse: collapse; }
        .compare-table th { padding: 16px 20px; text-align: left; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: var(--light-bg); border-bottom: 2px solid var(--border); }
        .compare-table th.sbp-col { background: rgba(27,110,59,.08); color: var(--orange); }
        .compare-table td { padding: 13px 20px; font-size: 14px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
        .compare-table td.sbp-col { background: rgba(27,110,59,.04); }
        .compare-table tr:last-child td { border-bottom: none; }
        .feature-name { font-weight: 600; }
        .chk { color: #16a34a; font-size: 17px; font-weight: 700; }
        .crs { color: #dc2626; font-size: 17px; font-weight: 700; }
        .prt { color: #18682c; font-size: 13px; font-weight: 600; }
        .highlight-row { display: flex; align-items: center; gap: 60px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; }
        .highlight-row.reverse { flex-direction: row-reverse; }
        .highlight-text { flex: 1; min-width: 280px; }
        .highlight-text h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
        .highlight-text p { font-size: 16px; color: var(--muted); margin-bottom: 20px; }
        .highlight-visual { flex: 1; min-width: 280px; }
        .highlight-visual-dark { flex: 1; min-width: 280px; background: linear-gradient(135deg, var(--purple-deep) 0%, #15321f 100%); border-radius: 14px; padding: 36px 32px; border: 2px solid rgba(27,110,59,.3); }
        .check-list { list-style: none; margin-top: 16px; }
        .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: var(--muted); margin-bottom: 12px; }
        .check-list li::before { content: '✓'; background: var(--orange); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .sa-tier-visual { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
        .sa-tier { border: 1.5px solid var(--border); border-radius: 8px; padding: 12px 10px; background: #fff; text-align: center; }
        .sa-tier.active { border-color: var(--orange); background: linear-gradient(180deg, #fff 0%, #fff8f2 100%); }
        .sa-tier-name { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 4px; }
        .sa-tier-price { font-size: 18px; font-weight: 800; color: var(--text); }
        .sa-tier-note { font-size: 10px; color: var(--muted); margin-top: 3px; line-height: 1.3; }
        .sa-tier.active .sa-tier-name { color: var(--orange); }
        .mock-item { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; }
        .mock-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .mock-dot.orange { background: var(--orange); }
        .mock-dot.red { background: #ef4444; }
        .mock-label { color: rgba(255,255,255,.85); font-size: 13px; font-weight: 600; }
        .mock-sub { color: rgba(255,255,255,.45); font-size: 11px; margin-top: 1px; }
        .mock-badge { margin-left: auto; background: var(--orange); color: #fff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; flex-shrink: 0; }
        .mock-badge.red-badge { background: #dc2626; }
        .dark-section { background: linear-gradient(135deg, var(--purple-dark) 0%, var(--purple-deep) 100%); color: #fff; }
        .lasso-map { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 20px; margin-bottom: 14px; position: relative; min-height: 130px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .lasso-ring { position: absolute; top: 14px; left: 18px; right: 18px; bottom: 14px; border: 2.5px dashed var(--orange); border-radius: 50%; opacity: .7; }
        .lasso-pins { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; }
        .lpin { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
        .lpin.s { background: var(--orange); box-shadow: 0 0 0 3px rgba(27,110,59,.3); }
        .lpin.u { background: rgba(255,255,255,.2); }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .stat-cell { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 12px 14px; }
        .stat-cell.warn { border-color: rgba(239,68,68,.4); background: rgba(239,68,68,.1); }
        .stat-cell.warn .stat-val { color: #f87171; }
        .stat-val { color: var(--orange); font-size: 18px; font-weight: 800; }
        .stat-lbl { color: rgba(255,255,255,.42); font-size: 11px; margin-top: 1px; }
        .stat-cell.full { grid-column: span 2; }
        .stat-cell.full .stat-val { color: #fff; font-size: 13px; font-weight: 600; }
        .premium-band { background: linear-gradient(135deg, var(--purple-dark) 0%, #11281a 100%); padding: 90px 40px; text-align: center; position: relative; overflow: hidden; }
        .premium-band::before { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(27,110,59,.1) 0%, transparent 65%); pointer-events: none; }
        .premium-band h2 { color: #fff; font-size: clamp(26px, 4vw, 44px); font-weight: 800; line-height: 1.2; max-width: 860px; margin: 0 auto 18px; }
        .premium-band h2 span { color: var(--orange); }
        .premium-band > p { color: rgba(255,255,255,.65); font-size: 17px; max-width: 700px; margin: 0 auto 52px; line-height: 1.8; }
        .premium-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .premium-card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 28px 24px; text-align: left; transition: border-color .2s; }
        .premium-card:hover { border-color: var(--orange); }
        .premium-card-icon { font-size: 28px; margin-bottom: 14px; }
        .premium-card h4 { color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .premium-card p { color: rgba(255,255,255,.52); font-size: 13px; line-height: 1.6; }
        .simple-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .simple-card { background: #fff; border: 1.5px solid var(--border); border-radius: 12px; padding: 30px 26px; transition: border-color .2s, box-shadow .2s, transform .15s; }
        .simple-card:hover { border-color: var(--orange); box-shadow: 0 6px 24px rgba(27,110,59,.1); transform: translateY(-2px); }
        .simple-num { font-size: 40px; font-weight: 800; color: var(--orange); opacity: .25; line-height: 1; margin-bottom: 12px; }
        .simple-card h3 { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .simple-card p { color: var(--muted); font-size: 14px; line-height: 1.6; }
        .price-card { background: #fff; border: 2px solid var(--border); border-radius: 14px; padding: 36px 32px; position: relative; }
        .price-card.featured { border-color: var(--orange); background: linear-gradient(180deg, #fff 0%, #fff8f2 100%); }
        .featured-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--orange); color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; white-space: nowrap; }
        .price-tier { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .price-amount { font-size: 48px; font-weight: 800; color: var(--text); line-height: 1; }
        .price-amount sup { font-size: 22px; vertical-align: super; }
        .price-period { color: var(--muted); font-size: 13px; margin-bottom: 24px; margin-top: 4px; }
        .price-features { list-style: none; margin-bottom: 32px; }
        .price-features li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text); padding: 6px 0; border-bottom: 1px solid var(--border); }
        .price-features li:last-child { border-bottom: none; }
        .price-features li::before { content: '✓'; color: var(--orange); font-weight: 700; flex-shrink: 0; }
        .price-btn { display: block; text-align: center; padding: 13px; border-radius: 6px; font-weight: 700; font-size: 15px; text-decoration: none; transition: background .2s; cursor: pointer; border: none; }
        .price-btn-primary { background: var(--orange); color: #fff !important; }
        .price-btn-primary:hover { background: var(--orange-dark); }
        .cta-band { background: linear-gradient(135deg, var(--purple-dark) 0%, #15321f 100%); text-align: center; padding: 100px 40px; position: relative; overflow: hidden; }
        .cta-band::before { content: ''; position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(27,110,59,.12) 0%, transparent 70%); pointer-events: none; }
        .cta-band h2 { color: #fff; font-size: clamp(28px, 4vw, 46px); font-weight: 800; margin-bottom: 16px; }
        .cta-band h2 span { color: var(--orange); display: block; }
        .cta-band p { color: rgba(255,255,255,.7); font-size: 18px; margin-bottom: 40px; max-width: 560px; margin-left: auto; margin-right: auto; }
        @media (max-width: 700px) { section { padding: 60px 20px; } .hero { padding: 70px 20px 60px; } .hero-stats { gap: 30px; } .highlight-row, .highlight-row.reverse { flex-direction: column; } .sa-tier-visual { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      <div className="hero">
        <div className="hero-badge">Service Autopilot Alternative</div>
        <h1>SA Costs $500+/Month to Get Close to What LandscapeBossPro Offers.<br /><span>And Even Then, It Still Isn&apos;t Built for Landscaping.</span></h1>
        <p>Service Autopilot has tiers. Route optimization is $199/month. Automations are $499/month. Two-way texting costs even more. LandscapeBossPro is $129/month with everything included — line-item estimates, materials tracking, crew dispatch, and recurring maintenance plans built for landscaping, not bolted on.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">LandscapeBossPro — Everything Included</div></div>
          <div><div className="hero-stat-val">$0</div><div className="hero-stat-lbl">Sign-Up Fee for LandscapeBossPro</div></div>
          <div><div className="hero-stat-val">Unlimited</div><div className="hero-stat-lbl">Users — No Per-Seat Fees</div></div>
          <div><div className="hero-stat-val">Built</div><div className="hero-stat-lbl">For Landscaping — Not Generic</div></div>
        </div>
      </div>

      <section>
        <div className="centered" style={{maxWidth:'960px', margin:'0 auto'}}>
          <span className="section-label">Side by Side</span>
          <h2 className="section-title">LandscapeBossPro vs Service Autopilot</h2>
          <p className="section-sub">18 features compared — and the pricing reality that SA&apos;s website doesn&apos;t make easy to see.</p>
        </div>
        <div className="compare-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{width:'50%'}}>Feature</th>
                <th className="sbp-col" style={{width:'25%'}}>LandscapeBossPro</th>
                <th style={{width:'25%'}}>Service Autopilot</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="feature-name">Line-Item Estimates &amp; Bids</td><td className="sbp-col"><span className="chk">✓ Built in</span></td><td><span className="prt">Add-on / higher tier</span></td></tr>
              <tr><td className="feature-name">Materials &amp; Products Tracking</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Job &amp; Project Scheduling</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Crew Dispatch &amp; Routing</td><td className="sbp-col"><span className="chk">✓ Included</span></td><td><span className="prt">Pro tier — $199/mo</span></td></tr>
              <tr><td className="feature-name">Automations &amp; Workflows</td><td className="sbp-col"><span className="chk">✓ Included</span></td><td><span className="prt">Pro Plus — $499/mo</span></td></tr>
              <tr><td className="feature-name">Two-Way SMS Texting</td><td className="sbp-col"><span className="chk">✓ Included</span></td><td><span className="prt">Elite tier — call for pricing</span></td></tr>
              <tr><td className="feature-name">No Sign-Up Fee</td><td className="sbp-col"><span className="chk">✓ $0</span></td><td><span className="crs">✗ Sign-up fee required</span></td></tr>
              <tr><td className="feature-name">Unlimited Users at Flat Price</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Per-user pricing applies</span></td></tr>
              <tr><td className="feature-name">Job Board for Open Projects</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Limited</span></td></tr>
              <tr><td className="feature-name">Recurring Maintenance Plans</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Package Plans &amp; Renewal Tracking</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Estimates &amp; Online Acceptance</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Card-on-File Payments</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Mobile App for Crews</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">No Annual Contract</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Varies by tier</span></td></tr>
              <tr><td className="feature-name">Entry Price (basic features)</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129/month</td><td style={{color:'var(--muted)'}}>$49/month (very limited)</td></tr>
              <tr><td className="feature-name">Price with Crew Routing</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129/month</td><td style={{color:'var(--muted)'}}>$199/month (Pro)</td></tr>
              <tr><td className="feature-name">Price with Automations + SMS</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129/month</td><td style={{color:'var(--muted)'}}>$499+/month (Pro Plus / Elite)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="lasso" className="dark-section">
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Estimates — Built for Project Work</span>
            <h2 style={{color:'#fff'}}>Service Autopilot Schedules Visits.<br />LandscapeBossPro Builds the Whole Project.</h2>
            <p style={{color:'rgba(255,255,255,.65)'}}>Service Autopilot was built around recurring visit routes. Landscaping is project and material heavy — a single design-build or hardscape job has dozens of line items, material quantities, and labor stages. LandscapeBossPro builds line-item estimates with materials and products attached, then turns the accepted bid straight into a scheduled project with crews assigned. SA makes you bolt that workflow on.</p>
            <ul className="check-list" style={{marginTop:'20px'}}>
              <li style={{color:'rgba(255,255,255,.75)'}}>Line-item estimates with materials, products, and labor per stage</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Accepted bid becomes a scheduled project — no re-entry</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Track materials and products against every job</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Crews dispatched and routed to the right project each day</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Available at $129/month — not locked behind SA&apos;s $199 Pro tier</li>
            </ul>
          </div>
          <div className="highlight-visual-dark">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>Estimate — Line Items &amp; Materials</div>
            <div className="lasso-map">
              <div className="lasso-ring"></div>
              <div className="lasso-pins">
                <div className="lpin s"></div><div className="lpin s"></div><div className="lpin u"></div><div className="lpin s"></div><div className="lpin s"></div>
                <div className="lpin s"></div><div className="lpin u"></div><div className="lpin s"></div><div className="lpin s"></div><div className="lpin u"></div>
                <div className="lpin s"></div><div className="lpin s"></div><div className="lpin s"></div><div className="lpin u"></div><div className="lpin s"></div>
                <div className="lpin s"></div><div className="lpin s"></div><div className="lpin u"></div><div className="lpin s"></div>
              </div>
            </div>
            <div className="stat-grid">
              <div className="stat-cell warn"><div className="stat-val">Add-on</div><div className="stat-lbl">SA — detailed material estimates not built in</div></div>
              <div className="stat-cell"><div className="stat-val">Built in</div><div className="stat-lbl">LandscapeBossPro — line-item estimates with materials</div></div>
              <div className="stat-cell"><div className="stat-val">24</div><div className="stat-lbl">Line Items on Bid</div></div>
              <div className="stat-cell"><div className="stat-val">$18,400</div><div className="stat-lbl">Project Total</div></div>
              <div className="stat-cell full"><div className="stat-val">Plantings · 9 &nbsp;|&nbsp; Hardscape · 8 &nbsp;|&nbsp; Sod &amp; Grading · 7</div><div className="stat-lbl">LandscapeBossPro Breakdown — Materials by Project Stage</div></div>
            </div>
          </div>
        </div>
      </section>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">The Real SA Pricing Ladder</span>
          <h2 className="section-title">SA Starts at $49. But You&apos;ll Need $499+ to Get What LandscapeBossPro Gives You at $129.</h2>
          <p className="section-sub" style={{maxWidth:'720px', marginLeft:'auto', marginRight:'auto'}}>Service Autopilot&apos;s pricing looks affordable at the Startup tier — but that tier has very limited functionality. Every major feature that makes SA worth using for a landscaping crew is locked behind a higher tier.</p>
        </div>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="highlight-row">
            <div className="highlight-visual" style={{flex:1.5, minWidth:'280px'}}>
              <div className="sa-tier-visual">
                <div className="sa-tier">
                  <div className="sa-tier-name">Startup</div>
                  <div className="sa-tier-price">$49</div>
                  <div className="sa-tier-note">Basic scheduling only</div>
                </div>
                <div className="sa-tier">
                  <div className="sa-tier-name">Pro</div>
                  <div className="sa-tier-price">$199</div>
                  <div className="sa-tier-note">Crew routing unlocked</div>
                </div>
                <div className="sa-tier">
                  <div className="sa-tier-name">Pro Plus</div>
                  <div className="sa-tier-price">$499</div>
                  <div className="sa-tier-note">Automations + workflows</div>
                </div>
                <div className="sa-tier active">
                  <div className="sa-tier-name">Elite</div>
                  <div className="sa-tier-price">Call</div>
                  <div className="sa-tier-note">Two-way SMS + premium features</div>
                </div>
              </div>
              <div style={{background:'linear-gradient(135deg, var(--purple-deep) 0%, #15321f 100%)', borderRadius:'10px', padding:'18px', border:'2px solid rgba(27,110,59,.3)'}}>
                <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>What it costs to match LandscapeBossPro at SA</div>
                <div className="mock-item"><div className="mock-dot red"></div><div><div className="mock-label">Crew Routing</div><div className="mock-sub">SA Pro tier required</div></div><div className="mock-badge red-badge">$199/mo</div></div>
                <div className="mock-item"><div className="mock-dot red"></div><div><div className="mock-label">Automations</div><div className="mock-sub">SA Pro Plus tier required</div></div><div className="mock-badge red-badge">$499/mo</div></div>
                <div className="mock-item"><div className="mock-dot red"></div><div><div className="mock-label">Two-Way Texting</div><div className="mock-sub">SA Elite tier required</div></div><div className="mock-badge red-badge">Call</div></div>
                <div className="mock-item"><div className="mock-dot orange"></div><div><div className="mock-label">LandscapeBossPro</div><div className="mock-sub">Everything included — plus estimates &amp; materials tracking</div></div><div className="mock-badge">$129/mo</div></div>
              </div>
            </div>
            <div className="highlight-text" style={{flex:1, minWidth:'280px'}}>
              <span className="section-label">The Real Cost</span>
              <h2>$499+/Month at SA Still Doesn&apos;t Get You Everything LandscapeBossPro Includes at $129.</h2>
              <p>Even at SA&apos;s top published tier ($499/month for Pro Plus), you&apos;re still missing the landscaping-first workflow: line-item estimates with materials attached, products tracking by job, and a job board for open projects. LandscapeBossPro includes everything at $129/month with no sign-up fee.</p>
              <ul className="check-list">
                <li>Line-item estimates with materials — built for project work</li>
                <li>Materials &amp; products tracking by job — not SA&apos;s focus</li>
                <li>Job board for open projects — assign crews fast</li>
                <li>Automations included at $129 — SA charges $499 for these</li>
                <li>Two-way SMS included — SA charges Elite pricing (custom quote)</li>
                <li>No sign-up fee at LandscapeBossPro — SA charges one</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="premium-band">
        <h2>SA Costs 4x More to Get Close to LandscapeBossPro.<br /><span>And Close Isn&apos;t the Same as Built for Landscaping.</span></h2>
        <p>The features that matter most to landscaping and design-build businesses — line-item estimates, materials and products tracking, crew dispatch on real projects — are exactly what LandscapeBossPro was built around. You can climb SA from Startup to Elite and still be working around a platform that wasn&apos;t designed for project and material heavy work.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">📝</div><h4>Line-Item Estimates &amp; Bids</h4><p>Build detailed bids with materials, products, and labor broken out by stage — plantings, hardscape, grading, sod. The accepted estimate becomes a scheduled project automatically, so nothing gets re-keyed.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Materials &amp; Products Tracking</h4><p>Track every material and product against the job it belongs to. Know what was quoted, what was used, and what each project really cost. This kind of material tracking simply isn&apos;t Service Autopilot&apos;s focus.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🚚</div><h4>Crew Dispatch &amp; Routing</h4><p>Assign crews to projects, route their day, and dispatch from one board. Your install, hardscape, and maintenance crews each see their own schedule. SA charges $199/month for routing — LandscapeBossPro includes it.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💰</div><h4>$129 — Not $499+</h4><p>Getting crew routing, automations, and SMS at SA costs $499+/month. LandscapeBossPro includes all of these at $129/month — plus the estimating and materials workflow built for landscaping. It&apos;s not even close on value.</p></div>
          <div className="premium-card"><div className="premium-card-icon">⚡</div><h4>No Sign-Up Fee</h4><p>SA charges a sign-up fee to get started. LandscapeBossPro charges $0 to sign up and offers a 14-day free trial with no credit card required. You can start today and be scheduling projects this afternoon.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>SMS Included at $129</h4><p>Two-way customer texting, automated alerts, estimate follow-ups — all included at $129/month. SA locks two-way texting behind their Elite tier. At SA, SMS alone can cost more than LandscapeBossPro&apos;s entire platform.</p></div>
        </div>
      </div>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Built Different</span>
          <h2 className="section-title">SA Is a General Service Platform. LandscapeBossPro Is Built Around Landscaping Projects.</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>Service Autopilot serves a wide range of service businesses. LandscapeBossPro was built specifically around line-item estimates, materials tracking, and crew dispatch on real projects — the things that make install, design-build, and hardscape work different from generic recurring visits.</p>
        </div>
        <div className="simple-grid">
          <div className="simple-card"><div className="simple-num">01</div><h3>Projects &amp; Materials First</h3><p>LandscapeBossPro tracks everything around the project — line-item estimates, materials and products used, labor by stage. SA tracks visit durations and stop counts. For landscaping, the project and its materials are what drive pricing and profit.</p></div>
          <div className="simple-card"><div className="simple-num">02</div><h3>No Tier-Climbing Required</h3><p>LandscapeBossPro gives you crew routing, automations, two-way SMS, and full estimating at $129/month. SA starts at $49 and charges you more for each major feature until you&apos;re at $499+/month before you have what LandscapeBossPro includes at the entry level.</p></div>
          <div className="simple-card"><div className="simple-num">03</div><h3>No Sign-Up Fee. No Lock-In.</h3><p>Start a free trial right now — no credit card required, no sign-up fee. SA charges to get started and has an onboarding process. LandscapeBossPro is self-serve and you can be building estimates and scheduling crews today.</p></div>
          <div className="simple-card"><div className="simple-num">04</div><h3>Estimate to Invoice in One Flow</h3><p>An accepted bid becomes a scheduled project, the project becomes an invoice with card-on-file payment — no double entry. SA makes you stitch that together across tiers and add-ons. LandscapeBossPro runs the whole job in one place.</p></div>
        </div>
      </section>

      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">$129/Month. Everything Included. No Tiers.</h2>
          <p className="section-sub">No sign-up fee. No tier-climbing. No add-ons. Just $129/month for your entire operation.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="price-card featured" style={{width:'100%'}}>
            <div className="featured-badge">Everything Included — No Tiers</div>
            <div className="price-tier">One Plan. One Price. No Sign-Up Fee.</div>
            <div className="price-amount"><sup>$</sup>129</div>
            <div className="price-period">per month — cancel anytime, no sign-up fee</div>
            <ul className="price-features">
              <li>Unlimited Clients, Properties &amp; Leads</li>
              <li>Unlimited Employees &amp; Users</li>
              <li>Line-Item Estimates &amp; Bids</li>
              <li>Materials &amp; Products Tracking</li>
              <li>Job &amp; Project Scheduling + Job Board</li>
              <li>Crew Dispatch &amp; Routing Included (not a $199 add-on)</li>
              <li>Automations Included (not a $499 add-on)</li>
              <li>Two-Way SMS Included (not a custom-quote add-on)</li>
              <li>Invoices &amp; Card-on-File Payments</li>
              <li>Recurring Maintenance &amp; Package Plans</li>
              <li>Mobile App for Crews</li>
              <li>500 Outbound SMS/month included</li>
            </ul>
            <button className="price-btn price-btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(2, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
          </div>
        </div>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'13px', marginTop:'32px'}}>No contracts. Cancel anytime. No hidden fees — ever.</p>
      </section>

      <div className="cta-band">
        <h2>SA at $500+/Month Still Isn&apos;t Built for Landscaping the Way LandscapeBossPro Is at $129.<span>Line-Item Estimates. Materials Tracking. Crew Dispatch. All Included.</span></h2>
        <p>Try LandscapeBossPro free for 14 days. No credit card required. No sign-up fee.</p>
        <div className="hero-btns">
          <button className="btn-primary" style={{fontSize:'17px', padding:'18px 44px'}} onClick={(e) => { e.preventDefault(); openSignupModal(3, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
      </div>
      <div id="sbp-backdrop" onClick={() => closeAllModals()} style={{display:'none', position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,.55)', zIndex:99997}}></div>
      {[1,2,3].map(n => (
        <div key={n} id={`sbp-form-${n}`} style={{display:'none', position:'fixed', zIndex:99999, width:'420px', maxWidth:'calc(100vw - 24px)', background:'#fff', borderRadius:'14px', border:'3px solid #1b6e3b', boxShadow:'0 0 0 4px rgba(27,110,59,.35), 0 16px 60px rgba(0,0,0,.45)', maxHeight:'calc(100vh - 40px)', overflowY:'auto'}}>
          <div style={{background:'linear-gradient(135deg,#08140d,#15321f)', padding:'28px 28px 22px', position:'relative'}}>
            <div style={{color:'#fff', fontSize:'20px', fontWeight:800, paddingRight:'36px'}}>Start Your 14-Day Free Trial</div>
            <div style={{color:'rgba(255,255,255,.6)', fontSize:'13px', marginTop:'5px'}}>No credit card required. Full access. Cancel anytime.</div>
            <button onClick={() => closeSignupModal(n)} style={{position:'absolute', top:'16px', right:'16px', background:'rgba(255,255,255,.12)', border:'none', color:'#fff', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'20px', display:'flex', alignItems:'center', justifyContent:'center'}}>×</button>
          </div>
          <div id={`sbp${n}-step1`} style={{padding:'24px 28px'}}>
            <div id={`sbp${n}-err1`} style={{background:'#fff0f0', border:'1px solid #f5c6c6', color:'#c0392b', borderRadius:'6px', padding:'10px 12px', fontSize:'13px', marginBottom:'14px', display:'none'}}></div>
            <div style={{display:'flex', gap:'12px', marginBottom:'14px'}}>
              <div style={{flex:1}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>First Name</label><input id={`sbp${n}-first`} type="text" placeholder="John" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
              <div style={{flex:1}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Last Name</label><input id={`sbp${n}-last`} type="text" placeholder="Smith" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
            </div>
            <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Company Name</label><input id={`sbp${n}-company`} type="text" placeholder="Smith Landscaping" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
            <div style={{marginBottom:'20px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Email Address</label><input id={`sbp${n}-email`} type="email" placeholder="you@yourcompany.com" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
            <button onClick={() => sbpStep2(n)} style={{width:'100%', background:'#1b6e3b', color:'#fff', border:'none', borderRadius:'6px', padding:'13px', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Next: Create Password →</button>
          </div>
          <div id={`sbp${n}-step2`} style={{padding:'24px 28px', display:'none'}}>
            <div id={`sbp${n}-err2`} style={{background:'#fff0f0', border:'1px solid #f5c6c6', color:'#c0392b', borderRadius:'6px', padding:'10px 12px', fontSize:'13px', marginBottom:'14px', display:'none'}}></div>
            <div style={{background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:'6px', padding:'10px 14px', marginBottom:'16px'}}>
              <div style={{fontSize:'12px', color:'#16a34a', fontWeight:700}}>14-Day Free Trial — No Credit Card Required</div>
              <div style={{fontSize:'12px', color:'#555', marginTop:'2px'}}>Full access to every feature. $129/month after trial.</div>
            </div>
            <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Login Email</label><input id={`sbp${n}-login-email`} type="email" readOnly style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', background:'#f8f8f8', color:'#333'}} /></div>
            <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Password</label><input id={`sbp${n}-password`} type="password" placeholder="At least 8 characters" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
            <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Confirm Password</label><input id={`sbp${n}-confirm`} type="password" placeholder="Repeat password" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
            <div style={{marginBottom:'18px', display:'flex', alignItems:'flex-start', gap:'10px'}}><input type="checkbox" id={`sbp${n}-agree`} style={{width:'16px', height:'16px', accentColor:'#1b6e3b', cursor:'pointer', flexShrink:0, marginTop:'3px'}} /><label htmlFor={`sbp${n}-agree`} style={{fontSize:'13px', color:'#555', cursor:'pointer', lineHeight:1.5}}>I agree to the <a href="https://landscapebosspro.com/terms" target="_blank" style={{color:'#1b6e3b'}}>Terms of Service</a> and <a href="https://landscapebosspro.com/privacy-policy" target="_blank" style={{color:'#1b6e3b'}}>Privacy Policy</a></label></div>
            <button id={`sbp${n}-create-btn`} onClick={() => sbpCreateAccount(n)} style={{width:'100%', background:'#1b6e3b', color:'#fff', border:'none', borderRadius:'6px', padding:'13px', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Create My Account</button>
            <button onClick={() => sbpBackToStep1(n)} style={{width:'100%', background:'none', border:'none', color:'#888', fontSize:'13px', cursor:'pointer', marginTop:'10px', padding:'6px', fontFamily:'inherit', textDecoration:'underline'}}>← Back</button>
          </div>
          <div id={`sbp${n}-success`} style={{padding:'48px 28px', textAlign:'center', display:'none'}}>
            <div style={{width:'64px', height:'64px', background:'#16a34a', borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'30px', color:'#fff', marginBottom:'16px'}}>✓</div>
            <div style={{fontSize:'22px', fontWeight:800, color:'#1a1a2e', marginBottom:'10px'}}>You&apos;re In!</div>
            <div style={{fontSize:'15px', color:'#555', lineHeight:1.6, marginBottom:'6px'}}>Your 14-day free trial has started.<br />Taking you to your dashboard…</div>
            <div id={`sbp${n}-countdown`} style={{fontSize:'12px', color:'#aaa', marginTop:'10px'}}></div>
          </div>
        </div>
      ))}
    </>
  );
}
