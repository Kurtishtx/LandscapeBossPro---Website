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
async function sbpCreateAccount(n: number) { const err = document.getElementById('sbp' + n + '-err2')!; const btn = document.getElementById('sbp' + n + '-create-btn') as HTMLButtonElement; err.style.display = 'none'; const email = (document.getElementById('sbp' + n + '-login-email') as HTMLInputElement).value.trim(); const password = (document.getElementById('sbp' + n + '-password') as HTMLInputElement).value; const confirm = (document.getElementById('sbp' + n + '-confirm') as HTMLInputElement).value; if (password.length < 8) return sbpShowErr(err as HTMLElement, 'Password must be at least 8 characters.'); if (password !== confirm) return sbpShowErr(err as HTMLElement, 'Passwords do not match.'); if (!(document.getElementById('sbp' + n + '-agree') as HTMLInputElement).checked) return sbpShowErr(err as HTMLElement, 'Please agree to the Terms of Service and Privacy Policy.'); btn.disabled = true; btn.textContent = 'Creating your account…'; try { const res = await fetch(SBP_URL + '/functions/v1/manage-users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SBP_ANON, 'apikey': SBP_ANON }, body: JSON.stringify({ action: 'create', email, password }) }); const result = await res.json(); if (result.error) throw new Error(result.error); const sb = getSbpClient(); const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password }); if (signInErr) throw new Error(signInErr.message); const uid = signInData.user.id; const first = (document.getElementById('sbp' + n + '-first') as HTMLInputElement).value.trim(); const last = (document.getElementById('sbp' + n + '-last') as HTMLInputElement).value.trim(); const comp = (document.getElementById('sbp' + n + '-company') as HTMLInputElement).value.trim(); await sb.auth.updateUser({ data: { full_name: first + ' ' + last } }); const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); await sb.from('user_profiles').upsert({ id: uid, email, role: 'full_access', is_primary_owner: true, tenant_id: null, trial_ends_at: trialEnd }, { onConflict: 'id' }); await sb.from('company_info').insert({ user_id: uid, company_name: comp, display_name: comp }); const reasons = ['Cancel Maintaining Self', 'Cancel Sold House', 'Cancel Too Expensive', 'Cancel Unknown', 'Dropping Customer', 'Sold House'].map(nm => ({ name: nm, active: true, user_id: uid })); await sb.from('cancellation_reasons').insert(reasons); document.getElementById('sbp' + n + '-step2')!.style.display = 'none'; document.getElementById('sbp' + n + '-success')!.style.display = 'block'; let secs = 4; const cd = document.getElementById('sbp' + n + '-countdown')!; cd.textContent = 'Redirecting in ' + secs + ' seconds…'; const iv = setInterval(() => { secs--; if (secs <= 0) { clearInterval(iv); window.location.href = 'https://my.spraybosspro.com/dashboard.html'; } else cd.textContent = 'Redirecting in ' + secs + ' second' + (secs === 1 ? '' : 's') + '…'; }, 1000); } catch (e: any) { sbpShowErr(err as HTMLElement, e.message || 'Something went wrong. Please try again.'); btn.disabled = false; btn.textContent = 'Create My Account'; } }
function sbpShowErr(el: HTMLElement, msg: string) { el.textContent = msg; el.style.display = 'block'; }

export default function VsGorillaDesk() {
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
        :root { --purple-dark:#080010; --purple-mid:#0d0318; --purple-deep:#130520; --orange:#e07820; --orange-dark:#c96a10; --text:#1a1a2e; --muted:#555; --light-bg:#f8f7fc; --border:#e4e0f0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: var(--text); background: #fff; line-height: 1.6; }
        .hero { background: linear-gradient(135deg, #080010 0%, #130520 60%, #1e0a35 100%); padding: 100px 40px 80px; text-align: center; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(224,120,32,.15) 0%, transparent 70%); pointer-events: none; }
        .hero-badge { display: inline-block; background: rgba(224,120,32,.15); border: 1px solid rgba(224,120,32,.4); color: var(--orange); font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px; }
        .hero h1 { color: #fff; font-size: clamp(32px, 5vw, 56px); font-weight: 800; line-height: 1.15; max-width: 860px; margin: 0 auto 20px; }
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
        .compare-table th.sbp-col { background: rgba(224,120,32,.08); color: var(--orange); }
        .compare-table td { padding: 13px 20px; font-size: 14px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
        .compare-table td.sbp-col { background: rgba(224,120,32,.04); }
        .compare-table tr:last-child td { border-bottom: none; }
        .feature-name { font-weight: 600; }
        .chk { color: #16a34a; font-size: 17px; font-weight: 700; }
        .crs { color: #dc2626; font-size: 17px; font-weight: 700; }
        .prt { color: #d97706; font-size: 13px; font-weight: 600; }
        .highlight-row { display: flex; align-items: center; gap: 60px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; }
        .highlight-row.reverse { flex-direction: row-reverse; }
        .highlight-text { flex: 1; min-width: 280px; }
        .highlight-text h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
        .highlight-text p { font-size: 16px; color: var(--muted); margin-bottom: 20px; }
        .highlight-visual { flex: 1; min-width: 280px; background: linear-gradient(135deg, var(--purple-deep) 0%, #1e0a35 100%); border-radius: 14px; padding: 36px 32px; border: 2px solid rgba(224,120,32,.3); }
        .check-list { list-style: none; margin-top: 16px; }
        .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: var(--muted); margin-bottom: 12px; }
        .check-list li::before { content: '✓'; background: var(--orange); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .mock-item { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 12px 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 12px; }
        .mock-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .mock-dot.orange { background: var(--orange); }
        .mock-dot.amber { background: #f59e0b; }
        .mock-dot.red { background: #ef4444; }
        .mock-label { color: rgba(255,255,255,.85); font-size: 13px; font-weight: 600; }
        .mock-sub { color: rgba(255,255,255,.45); font-size: 11px; margin-top: 1px; }
        .mock-badge { margin-left: auto; background: var(--orange); color: #fff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; flex-shrink: 0; }
        .mock-badge.amber-badge { background: #d97706; }
        .mock-badge.red-badge { background: #dc2626; }
        .mock-extra { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 12px 14px; margin-top: 14px; }
        .mock-extra-title { color: rgba(255,255,255,.5); font-size: 11px; margin-bottom: 8px; }
        .mock-extra-item { color: rgba(255,255,255,.65); font-size: 12px; padding: 3px 0; display: flex; align-items: center; gap: 6px; }
        .premium-band { background: linear-gradient(135deg, var(--purple-dark) 0%, #1a0530 100%); padding: 90px 40px; text-align: center; position: relative; overflow: hidden; }
        .premium-band::before { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(224,120,32,.1) 0%, transparent 65%); pointer-events: none; }
        .premium-band h2 { color: #fff; font-size: clamp(26px, 4vw, 44px); font-weight: 800; line-height: 1.2; max-width: 860px; margin: 0 auto 18px; }
        .premium-band h2 span { color: var(--orange); }
        .premium-band > p { color: rgba(255,255,255,.65); font-size: 17px; max-width: 700px; margin: 0 auto 52px; line-height: 1.8; }
        .premium-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 1100px; margin: 0 auto; }
        .premium-card { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); border-radius: 12px; padding: 28px 24px; text-align: left; transition: border-color .2s; }
        .premium-card:hover { border-color: var(--orange); }
        .premium-card-icon { font-size: 28px; margin-bottom: 14px; }
        .premium-card h4 { color: #fff; font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .premium-card p { color: rgba(255,255,255,.52); font-size: 13px; line-height: 1.6; }
        .dark-section { background: linear-gradient(135deg, var(--purple-dark) 0%, var(--purple-deep) 100%); color: #fff; }
        .lasso-map { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 20px; margin-bottom: 14px; position: relative; min-height: 130px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .lasso-ring { position: absolute; top: 14px; left: 18px; right: 18px; bottom: 14px; border: 2.5px dashed var(--orange); border-radius: 50%; opacity: .7; }
        .lasso-pins { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1; }
        .lpin { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
        .lpin.s { background: var(--orange); box-shadow: 0 0 0 3px rgba(224,120,32,.3); }
        .lpin.u { background: rgba(255,255,255,.2); }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .stat-cell { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 12px 14px; }
        .stat-val { color: var(--orange); font-size: 18px; font-weight: 800; }
        .stat-lbl { color: rgba(255,255,255,.42); font-size: 11px; margin-top: 1px; }
        .stat-cell.full { grid-column: span 2; }
        .stat-cell.full .stat-val { color: #fff; font-size: 13px; font-weight: 600; }
        .simple-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .simple-card { background: #fff; border: 1.5px solid var(--border); border-radius: 12px; padding: 30px 26px; transition: border-color .2s, box-shadow .2s, transform .15s; }
        .simple-card:hover { border-color: var(--orange); box-shadow: 0 6px 24px rgba(224,120,32,.1); transform: translateY(-2px); }
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
        .cta-band { background: linear-gradient(135deg, var(--purple-dark) 0%, #1e0a35 100%); text-align: center; padding: 100px 40px; position: relative; overflow: hidden; }
        .cta-band::before { content: ''; position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(224,120,32,.12) 0%, transparent 70%); pointer-events: none; }
        .cta-band h2 { color: #fff; font-size: clamp(28px, 4vw, 46px); font-weight: 800; margin-bottom: 16px; }
        .cta-band p { color: rgba(255,255,255,.7); font-size: 18px; margin-bottom: 40px; max-width: 560px; margin-left: auto; margin-right: auto; }
        @media (max-width: 700px) { section { padding: 60px 20px; } .hero { padding: 70px 20px 60px; } .hero-stats { gap: 30px; } .highlight-row, .highlight-row.reverse { flex-direction: column; } }
      `}</style>

      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      <div className="hero">
        <div className="hero-badge">GorillaDesk Alternative</div>
        <h1>GorillaDesk Charges Per Route.<br /><span>SprayBossPro Is $129 Flat — Unlimited Routes, Unlimited Stops.</span></h1>
        <p>GorillaDesk uses a per-route pricing model — the more trucks you run, the more you pay, every month. SprayBossPro is $129/month regardless of how many routes you schedule, how many trucks you run, or how many stops you dispatch. No per-route fees. Ever.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">Flat — vs GorillaDesk&apos;s per-route pricing</div></div>
          <div><div className="hero-stat-val">Unlimited</div><div className="hero-stat-lbl">Routes</div></div>
          <div><div className="hero-stat-val">Unlimited</div><div className="hero-stat-lbl">Stops — Basic caps at 25</div></div>
          <div><div className="hero-stat-val">Built</div><div className="hero-stat-lbl">For Spray Routes</div></div>
        </div>
      </div>

      <section>
        <div className="centered" style={{maxWidth:'960px', margin:'0 auto'}}>
          <span className="section-label">Side by Side</span>
          <h2 className="section-title">SprayBossPro vs GorillaDesk</h2>
          <p className="section-sub">Feature by feature — and the pricing model that matters most when you&apos;re running multiple routes.</p>
        </div>
        <div className="compare-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{width:'50%'}}>Feature</th>
                <th className="sbp-col" style={{width:'25%'}}>SprayBossPro</th>
                <th style={{width:'25%'}}>GorillaDesk</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="feature-name">Flat Monthly Pricing — No Per-Route Fees</td><td className="sbp-col"><span className="chk">✓ $129/mo</span></td><td><span className="crs">✗ Per-route model</span></td></tr>
              <tr><td className="feature-name">Unlimited Stops per Route</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Basic: 25 stop cap</span></td></tr>
              <tr><td className="feature-name">Sq Ft Waiting List by Service Type</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Lasso Circle Map Route Selector</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Chemical Compliance Logs</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Basic logs only</span></td></tr>
              <tr><td className="feature-name">Recurring Treatment Waiting List</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Two-Way SMS Inbox Included</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Pro plan only</span></td></tr>
              <tr><td className="feature-name">Package Plans &amp; Renewal Tracking</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Limited</span></td></tr>
              <tr><td className="feature-name">Estimates &amp; Online Acceptance</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Card-on-File Payments</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Mobile App for Technicians</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Automated SMS Alerts &amp; Follow-Ups</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Unlimited Users at Flat Price</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Price for 3 Routes</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129 flat</td><td style={{color:'var(--muted)'}}>$147/mo (Basic ×3)</td></tr>
              <tr><td className="feature-name">Price for 3 Routes — Pro Features</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129 flat</td><td style={{color:'var(--muted)'}}>$297/mo (Pro ×3)</td></tr>
              <tr><td className="feature-name">Price as You Scale to 5+ Routes</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>Still $129</td><td style={{color:'var(--muted)'}}>Keeps climbing</td></tr>
              <tr><td className="feature-name">No Annual Contract</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="premium-band">
        <h2>GorillaDesk Charges You More Every Time You Grow.<br /><span>SprayBossPro Is $129 No Matter How Many Routes You Run.</span></h2>
        <p>GorillaDesk&apos;s per-route model sounds fine until you&apos;re running three trucks. At Basic ×3, you&apos;re at $147/month with a 25-stop cap and no two-way SMS. At Pro ×3, you&apos;re at $297/month. SprayBossPro is $129/month for your entire operation — unlimited routes, unlimited stops, every feature included. The more you grow, the more SprayBossPro saves you.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">💰</div><h4>Price Doesn&apos;t Scale With Routes</h4><p>$129/month covers your entire operation regardless of route count. Run 1 truck or 10 — same price. GorillaDesk multiplies by your route count every single month. That math only gets worse as you grow.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📋</div><h4>Sq Ft Waiting List</h4><p>Before scheduling, see exactly how much square footage is waiting per service type. Know your lawn care 4, mosquito, and insect control backlog before you build a route. GorillaDesk doesn&apos;t have a sq ft waiting list model.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🗺️</div><h4>Lasso Circle Selector</h4><p>Draw a circle on the map, see every stop inside with a service due. GorillaDesk has route optimization. Not the same as drawing a geographic circle and instantly seeing all your due work inside it before you schedule.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🧪</div><h4>Chemical Compliance</h4><p>Full chemical application logs with product, mix rate, area, weather, and tech license. Pull compliance reports on demand. GorillaDesk has basic job notes — not a dedicated pesticide compliance logging system.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>SMS Inbox Included</h4><p>True two-way SMS inbox at $129/month. GorillaDesk locks SMS behind their Pro tier. Add up the per-route Pro pricing and you&apos;re paying more for less — and still missing spray-specific features.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔁</div><h4>Unlimited Stops</h4><p>GorillaDesk Basic caps routes at 25 stops. SprayBossPro has no stop limit. Schedule 50-stop routes, 100-stop routes — no restrictions. Spray businesses run dense routes. A 25-stop cap is a real operational problem.</p></div>
        </div>
      </div>

      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">The Real Cost</span>
            <h2>What GorillaDesk Actually Costs When You Run Multiple Routes</h2>
            <p>GorillaDesk pricing looks reasonable for one route. The problem is what happens at 2, 3, or 5 trucks. SprayBossPro is $129 no matter how many routes you run — and includes features GorillaDesk doesn&apos;t offer at any tier.</p>
            <ul className="check-list">
              <li>GorillaDesk Basic ×3 = $147/mo — still has 25-stop cap and no SMS</li>
              <li>GorillaDesk Pro ×3 = $297/mo — SMS unlocked, stop cap removed</li>
              <li>GorillaDesk Basic ×5 = $245/mo — missing lasso, sq ft list, compliance logs</li>
              <li>SprayBossPro = $129/mo — unlimited routes, all features, forever</li>
              <li>No sq ft waiting list at any GorillaDesk tier</li>
              <li>No lasso route selector at any GorillaDesk tier</li>
              <li>No dedicated chemical compliance logs at any GorillaDesk tier</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Monthly Cost — 3 Routes</div>
            <div className="mock-item">
              <div className="mock-dot orange"></div>
              <div><div className="mock-label">SprayBossPro</div><div className="mock-sub">Unlimited routes, all features, SMS included</div></div>
              <div className="mock-badge">$129/mo</div>
            </div>
            <div className="mock-item">
              <div className="mock-dot amber"></div>
              <div><div className="mock-label">GorillaDesk Basic ×3</div><div className="mock-sub">25-stop cap, no SMS, no compliance logs</div></div>
              <div className="mock-badge amber-badge">$147/mo</div>
            </div>
            <div className="mock-item">
              <div className="mock-dot red"></div>
              <div><div className="mock-label">GorillaDesk Pro ×3</div><div className="mock-sub">SMS unlocked, unlimited stops</div></div>
              <div className="mock-badge red-badge">$297/mo</div>
            </div>
            <div className="mock-extra">
              <div className="mock-extra-title">At every GorillaDesk tier, you still don&apos;t get:</div>
              <div className="mock-extra-item"><span style={{color:'#dc2626'}}>✗</span> Sq Ft Waiting List by Service Type</div>
              <div className="mock-extra-item"><span style={{color:'#dc2626'}}>✗</span> Lasso Circle Map Route Selector</div>
              <div className="mock-extra-item"><span style={{color:'#dc2626'}}>✗</span> Recurring Treatment Waiting List</div>
              <div className="mock-extra-item"><span style={{color:'#dc2626'}}>✗</span> Dedicated Chemical Compliance Logs</div>
            </div>
          </div>
        </div>
      </section>

      <section id="lasso" className="dark-section">
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Lasso — Circle Map Scheduling</span>
            <h2 style={{color:'#fff'}}>GorillaDesk Has Route Optimization. SprayBossPro Has Lasso.</h2>
            <p style={{color:'rgba(255,255,255,.65)'}}>They&apos;re not the same thing. Lasso lets you draw a circle on your map and instantly see every property inside with a service due — stops, sq ft, service types — all calculated before you schedule anything. No competitor has built this. GorillaDesk can optimize the order of stops you already selected. Lasso shows you which stops to select in the first place.</p>
            <ul className="check-list" style={{marginTop:'20px'}}>
              <li style={{color:'rgba(255,255,255,.75)'}}>Draw any size circle — instantly see all properties with services due inside</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Breaks down stops, sq ft, and service types in real time</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>One click to schedule all selected stops to a date and truck</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Tighten routes geographically — stop wasting fuel on scattered stops</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>Works across all service types simultaneously</li>
              <li style={{color:'rgba(255,255,255,.75)'}}>GorillaDesk doesn&apos;t have this at any price tier.</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>Lasso — Route Selector</div>
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
              <div className="stat-cell"><div className="stat-val">14</div><div className="stat-lbl">Stops Selected</div></div>
              <div className="stat-cell"><div className="stat-val">19</div><div className="stat-lbl">Total Services</div></div>
              <div className="stat-cell"><div className="stat-val">118,400</div><div className="stat-lbl">Sq Ft</div></div>
              <div className="stat-cell"><div className="stat-val">4,200</div><div className="stat-lbl">Linear Ft (Beds)</div></div>
              <div className="stat-cell full"><div className="stat-val">Lawn Care 4 · 8 &nbsp;|&nbsp; Mosquito · 6 &nbsp;|&nbsp; Insect · 5</div><div className="stat-lbl">Breakdown by Service Type</div></div>
            </div>
          </div>
        </div>
      </section>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Simplicity</span>
          <h2 className="section-title">Built for Spray Businesses. Not Generic Pest Control Software.</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>GorillaDesk is built for general pest control — termites, rodents, general bugs. SprayBossPro is built around lawn care and spray routes with recurring treatment schedules, sq ft tracking, and the specific way spray businesses manage their client base.</p>
        </div>
        <div className="simple-grid">
          <div className="simple-card"><div className="simple-num">01</div><h3>Sq Ft First — Not Just Stop Count</h3><p>SprayBossPro tracks everything in square feet — waiting list, route totals, property-level breakdown. Not just stop counts. Because lawn care and pest control pricing is based on sq ft, and your routing should be too.</p></div>
          <div className="simple-card"><div className="simple-num">02</div><h3>Recurring Spray Route Model</h3><p>Built around the way spray businesses work — recurring treatment schedules, waiting lists, package programs, chemical logs. GorillaDesk is built around one-off pest service calls. Different model entirely.</p></div>
          <div className="simple-card"><div className="simple-num">03</div><h3>Set Up in One Afternoon</h3><p>Add your services, import clients and properties, connect payments — fully operational same day. No onboarding call, no implementation timeline, no training manual. Self-serve from minute one.</p></div>
          <div className="simple-card"><div className="simple-num">04</div><h3>Price That Doesn&apos;t Scale Against You</h3><p>$129/month flat. Add routes, trucks, employees — price doesn&apos;t change. GorillaDesk&apos;s per-route model turns every growth decision into a cost increase. SprayBossPro doesn&apos;t do that.</p></div>
        </div>
      </section>

      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">$129/Month. No Matter How Many Routes You Run.</h2>
          <p className="section-sub">One price. Unlimited routes. Every feature. No per-route math.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="price-card featured" style={{width:'100%'}}>
            <div className="featured-badge">Everything Included</div>
            <div className="price-tier">One Plan. No Route Fees.</div>
            <div className="price-amount"><sup>$</sup>129</div>
            <div className="price-period">per month — flat, regardless of route count</div>
            <ul className="price-features">
              <li>Unlimited Routes — No Per-Route Fees Ever</li>
              <li>Unlimited Stops Per Route</li>
              <li>Unlimited Clients, Properties &amp; Leads</li>
              <li>Unlimited Employees &amp; Users</li>
              <li>Sq Ft Waiting List by Service Type</li>
              <li>Lasso Circle Map Route Selector</li>
              <li>Chemical Compliance Logs &amp; Reports</li>
              <li>Full Scheduling, Dispatch &amp; Route Map</li>
              <li>Estimates, Invoices &amp; Card-on-File Payments</li>
              <li>Two-Way SMS &amp; 10+ Automated Alerts</li>
              <li>Package Plans &amp; Renewal Tracking</li>
              <li>No per-route fees — ever</li>
            </ul>
            <button className="price-btn price-btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(2, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
          </div>
        </div>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'13px', marginTop:'32px'}}>No contracts. Cancel anytime. No hidden fees — ever.</p>
      </section>

      <div className="cta-band">
        <h2>Done Paying More Every Time You Add a Truck?<br />SprayBossPro Is $129. No Matter How Many Routes You Run.</h2>
        <p>Try SprayBossPro free for 14 days. No credit card required. Set up in an afternoon.</p>
        <div className="hero-btns">
          <button className="btn-primary" style={{fontSize:'17px', padding:'18px 44px'}} onClick={(e) => { e.preventDefault(); openSignupModal(3, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
      </div>

      <div id="sbp-backdrop" onClick={() => closeAllModals()} style={{display:'none', position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,.55)', zIndex:99997}}></div>
      {[1,2,3].map(n => (
        <div key={n} id={`sbp-form-${n}`} style={{display:'none', position:'fixed', zIndex:99999, width:'420px', maxWidth:'calc(100vw - 24px)', background:'#fff', borderRadius:'14px', border:'3px solid #e07820', boxShadow:'0 0 0 4px rgba(224,120,32,.35), 0 16px 60px rgba(0,0,0,.45)', maxHeight:'calc(100vh - 40px)', overflowY:'auto'}}>
          <div style={{background:'linear-gradient(135deg,#080010,#1e0a35)', padding:'28px 28px 22px', position:'relative'}}>
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
            <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Company Name</label><input id={`sbp${n}-company`} type="text" placeholder="Smith Lawn Care" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
            <div style={{marginBottom:'20px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Email Address</label><input id={`sbp${n}-email`} type="email" placeholder="you@yourcompany.com" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
            <button onClick={() => sbpStep2(n)} style={{width:'100%', background:'#e07820', color:'#fff', border:'none', borderRadius:'6px', padding:'13px', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Next: Create Password →</button>
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
            <div style={{marginBottom:'18px', display:'flex', alignItems:'flex-start', gap:'10px'}}><input type="checkbox" id={`sbp${n}-agree`} style={{width:'16px', height:'16px', accentColor:'#e07820', cursor:'pointer', flexShrink:0, marginTop:'3px'}} /><label htmlFor={`sbp${n}-agree`} style={{fontSize:'13px', color:'#555', cursor:'pointer', lineHeight:1.5}}>I agree to the <a href="https://spraybosspro.com/terms" target="_blank" style={{color:'#e07820'}}>Terms of Service</a> and <a href="https://spraybosspro.com/privacy-policy" target="_blank" style={{color:'#e07820'}}>Privacy Policy</a></label></div>
            <button id={`sbp${n}-create-btn`} onClick={() => sbpCreateAccount(n)} style={{width:'100%', background:'#e07820', color:'#fff', border:'none', borderRadius:'6px', padding:'13px', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Create My Account</button>
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
