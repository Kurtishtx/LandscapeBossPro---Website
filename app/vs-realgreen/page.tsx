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

export default function VsRealGreen() {
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
        .hero h1 { color: #fff; font-size: clamp(24px, 3.5vw, 46px); font-weight: 800; line-height: 1.15; max-width: 960px; margin: 0 auto 20px; }
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
        .check-list { list-style: none; margin-top: 16px; }
        .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: var(--muted); margin-bottom: 12px; }
        .check-list li::before { content: '✓'; background: var(--orange); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .steps-path { position: relative; }
        .step-item { display: flex; gap: 16px; margin-bottom: 20px; }
        .step-line-col { display: flex; flex-direction: column; align-items: center; }
        .step-dot { width: 28px; height: 28px; border-radius: 50%; background: var(--orange); color: #fff; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .step-connector { flex: 1; width: 2px; background: var(--border); margin: 4px 0; min-height: 20px; }
        .step-content { flex: 1; padding-top: 4px; }
        .step-title { font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 2px; }
        .step-desc { font-size: 13px; color: var(--muted); }
        .cost-path { }
        .cost-step { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 16px; padding: 14px; background: var(--light-bg); border-radius: 8px; border: 1px solid var(--border); }
        .cost-step-num { width: 28px; height: 28px; border-radius: 50%; background: #dc2626; color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cost-step-body { flex: 1; }
        .cost-step-title { font-size: 14px; font-weight: 700; color: var(--text); }
        .cost-step-note { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .cost-total { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
        .cost-total-label { font-size: 13px; font-weight: 700; color: #dc2626; }
        .cost-total-val { font-size: 22px; font-weight: 800; color: #dc2626; }
        .sbp-contrast { background: linear-gradient(135deg, var(--purple-deep) 0%, #15321f 100%); border-radius: 10px; padding: 18px; border: 2px solid rgba(27,110,59,.3); margin-top: 16px; }
        .sbp-contrast-label { color: rgba(255,255,255,.5); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .sbp-contrast-val { color: var(--orange); font-size: 24px; font-weight: 800; }
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
        @media (max-width: 700px) { section { padding: 60px 20px; } .hero { padding: 70px 20px 60px; } .hero-stats { gap: 30px; } .highlight-row, .highlight-row.reverse { flex-direction: column; } }
      `}</style>

      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      <div className="hero">
        <div className="hero-badge">RealGreen Alternative</div>
        <h1>RealGreen Starts at $199/Month — And Won&apos;t Tell You the Full Price Until You Talk to Sales.<br /><span>LandscapeBossPro Is $129. Right Now. No Demo Required.</span></h1>
        <p>RealGreen&apos;s pricing starts at $199/month but the real cost climbs fast once you add devices, routing modules, and marketing add-ons. LandscapeBossPro is $129/month — everything included, published price, start your free trial today without talking to anyone.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$199+</div><div className="hero-stat-lbl">RealGreen Base Price</div></div>
          <div><div className="hero-stat-val">$380</div><div className="hero-stat-lbl">RealGreen Average with Add-Ons</div></div>
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">LandscapeBossPro — Everything Included</div></div>
          <div><div className="hero-stat-val">Today</div><div className="hero-stat-lbl">When You Can Start with SBP</div></div>
        </div>
      </div>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">The Real Cost of RealGreen</span>
          <h2 className="section-title">Getting a Real Price from RealGreen Takes Multiple Steps. LandscapeBossPro Is $129.</h2>
          <p className="section-sub" style={{maxWidth:'720px', marginLeft:'auto', marginRight:'auto'}}>RealGreen requires you to contact sales, get a demo, discuss your account size, and wait for a custom quote. LandscapeBossPro has one price — $129/month — published right here. No steps, no waiting.</p>
        </div>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="highlight-row">
            <div className="highlight-visual" style={{flex:1.5, minWidth:'280px'}}>
              <div className="steps-path">
                <div className="step-item">
                  <div className="step-line-col"><div className="step-dot">1</div><div className="step-connector"></div></div>
                  <div className="step-content"><div className="step-title">Contact RealGreen Sales</div><div className="step-desc">No self-serve pricing available — you must request a demo or contact sales</div></div>
                </div>
                <div className="step-item">
                  <div className="step-line-col"><div className="step-dot">2</div><div className="step-connector"></div></div>
                  <div className="step-content"><div className="step-title">Wait for a Callback</div><div className="step-desc">A sales rep will reach out to schedule a demo of the platform</div></div>
                </div>
                <div className="step-item">
                  <div className="step-line-col"><div className="step-dot">3</div><div className="step-connector"></div></div>
                  <div className="step-content"><div className="step-title">Sit Through a Demo</div><div className="step-desc">Required before they&apos;ll discuss pricing with your account</div></div>
                </div>
                <div className="step-item">
                  <div className="step-line-col"><div className="step-dot" style={{background:'#dc2626'}}>4</div></div>
                  <div className="step-content"><div className="step-title">Receive a Custom Quote</div><div className="step-desc">Pricing based on your operation size — not a published rate</div></div>
                </div>
              </div>
              <div className="sbp-contrast">
                <div className="sbp-contrast-label">LandscapeBossPro — Starts Now</div>
                <div className="sbp-contrast-val">$129/month</div>
                <div style={{color:'rgba(255,255,255,.6)', fontSize:'12px', marginTop:'6px'}}>Published price. No demo. 14-day free trial. Start today.</div>
              </div>
            </div>
            <div className="highlight-text" style={{flex:1, minWidth:'280px'}}>
              <span className="section-label">No Demo Required</span>
              <h2>You Shouldn&apos;t Need 4 Steps to Find Out What Software Costs.</h2>
              <p>RealGreen is built for large lawn care operations and doesn&apos;t publish pricing because it varies significantly based on account size, device count, and modules selected. LandscapeBossPro is $129/month. You don&apos;t need to call anyone. You don&apos;t need to sit through a demo. You can start your free trial right now.</p>
              <ul className="check-list">
                <li>$129/month — published, no negotiation required</li>
                <li>14-day free trial — no credit card required</li>
                <li>Set up in one afternoon — no onboarding call</li>
                <li>No device fees, no module add-ons, no marketing packages</li>
                <li>Sq ft waiting list, lasso, chemical logs — RealGreen doesn&apos;t have these</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">The Real Cost of RealGreen</span>
          <h2 className="section-title">RealGreen Starts at $199. Add Devices, Modules, and Add-Ons and You&apos;re at $380+/Month.</h2>
          <p className="section-sub" style={{maxWidth:'720px', marginLeft:'auto', marginRight:'auto'}}>RealGreen&apos;s $199/month base price doesn&apos;t include everything you need. Routing modules, per-device licenses, marketing features, and payment processing add-ons push the real number significantly higher.</p>
        </div>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="highlight-row reverse">
            <div className="highlight-text" style={{flex:1, minWidth:'280px'}}>
              <span className="section-label">Add It Up</span>
              <h2>$199 Is Where RealGreen Starts. $380+ Is Where Most Operations Actually Land.</h2>
              <p>The base RealGreen price is $199/month for the core platform. Per-device licenses, routing optimization modules, email marketing, and payment processing each add to the total. Estimates from operators put the real average at $380+/month for a functioning operation.</p>
              <ul className="check-list">
                <li>Base price: ~$199/month — routing and some features</li>
                <li>Per-device fees scale with your truck count</li>
                <li>Routing module, marketing tools: additional monthly cost</li>
                <li>Payment processing: transaction or monthly add-on</li>
                <li>Real average with add-ons: ~$380+/month</li>
                <li>LandscapeBossPro: $129/month — everything included, one price</li>
              </ul>
            </div>
            <div className="highlight-visual" style={{flex:1.5, minWidth:'280px'}}>
              <div className="cost-path">
                <div className="cost-step"><div className="cost-step-num">1</div><div className="cost-step-body"><div className="cost-step-title">Base Platform — ~$199/month</div><div className="cost-step-note">Core scheduling and customer management. Routing and some features included.</div></div></div>
                <div className="cost-step"><div className="cost-step-num">2</div><div className="cost-step-body"><div className="cost-step-title">Per-Device Licensing</div><div className="cost-step-note">Additional cost per device/tablet as you add trucks and technicians to the field.</div></div></div>
                <div className="cost-step"><div className="cost-step-num">3</div><div className="cost-step-body"><div className="cost-step-title">Routing, Marketing &amp; Payment Add-Ons</div><div className="cost-step-note">Advanced routing, email marketing, and payment processing each carry additional monthly costs.</div></div></div>
              </div>
              <div className="cost-total"><span className="cost-total-label">RealGreen — Typical Monthly Total</span><span className="cost-total-val">~$380/mo</span></div>
              <div className="sbp-contrast" style={{marginTop:'12px'}}>
                <div className="sbp-contrast-label">LandscapeBossPro — Everything Included</div>
                <div className="sbp-contrast-val">$129/month</div>
                <div style={{color:'rgba(255,255,255,.6)', fontSize:'12px', marginTop:'4px'}}>No add-ons. No per-device fees. One price, forever.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'960px', margin:'0 auto'}}>
          <span className="section-label">Side by Side</span>
          <h2 className="section-title">LandscapeBossPro vs RealGreen</h2>
          <p className="section-sub">A complete comparison — including the features RealGreen doesn&apos;t have and the pricing that&apos;s rarely disclosed upfront.</p>
        </div>
        <div className="compare-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{width:'50%'}}>Feature</th>
                <th className="sbp-col" style={{width:'25%'}}>LandscapeBossPro</th>
                <th style={{width:'25%'}}>RealGreen</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="feature-name">Published, Transparent Pricing</td><td className="sbp-col"><span className="chk">✓ $129/mo</span></td><td><span className="crs">✗ Custom quote only</span></td></tr>
              <tr><td className="feature-name">Start Without a Demo</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗ Demo required</span></td></tr>
              <tr><td className="feature-name">Sq Ft Waiting List by Service Type</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Lasso Circle Map Route Selector</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Chemical Compliance Logs</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Basic records</span></td></tr>
              <tr><td className="feature-name">No Per-Device Fees</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗ Per-device licensing</span></td></tr>
              <tr><td className="feature-name">Two-Way SMS Inbox Included</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Add-on</span></td></tr>
              <tr><td className="feature-name">Recurring Treatment Waiting List</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Routing Included at Base Price</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Module add-on</span></td></tr>
              <tr><td className="feature-name">14-Day Free Trial</td><td className="sbp-col"><span className="chk">✓ No card required</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Package Plans &amp; Renewal Tracking</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Estimates &amp; Online Acceptance</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Card-on-File Payments</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Mobile App for Technicians</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">No Annual Contract Required</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Contract required</span></td></tr>
              <tr><td className="feature-name">All-In Monthly Cost</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129/month</td><td style={{color:'var(--muted)'}}>~$380+/month with add-ons</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Right Fit</span>
          <h2 className="section-title">RealGreen Is Built for Large Lawn Care Operations. LandscapeBossPro Fits Your Business Right Now.</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>RealGreen is a mature, enterprise-grade platform built for large lawn care companies with hundreds of routes. If you&apos;re a growing spray business, you&apos;d pay 3x more for complexity you don&apos;t need — and still miss the spray-specific features LandscapeBossPro includes at $129.</p>
        </div>
        <div className="simple-grid">
          <div className="simple-card"><div className="simple-num">01</div><h3>$129 vs $380+ — No Contest</h3><p>LandscapeBossPro is $129/month, all-in, no add-ons. RealGreen&apos;s published $199 base grows fast with per-device fees, module add-ons, and marketing tools. Most operators estimate $380+/month for a real working setup. LandscapeBossPro saves you $250/month from day one.</p></div>
          <div className="simple-card"><div className="simple-num">02</div><h3>Features RealGreen Doesn&apos;t Have</h3><p>Sq ft waiting list by service type, lasso circle route selector, dedicated chemical compliance logs — these don&apos;t exist in RealGreen at any price. They&apos;re core features in LandscapeBossPro, built specifically for how spray businesses manage recurring treatment schedules.</p></div>
          <div className="simple-card"><div className="simple-num">03</div><h3>Start Today — No Demo, No Waiting</h3><p>LandscapeBossPro has a 14-day free trial you can start right now. No demo required, no sales rep, no callback to wait for. RealGreen requires a full sales process before you can even see a price. LandscapeBossPro&apos;s price is $129. It&apos;s right here. Start now.</p></div>
          <div className="simple-card"><div className="simple-num">04</div><h3>Month-to-Month — No Lock-In</h3><p>No annual contract required. LandscapeBossPro is month-to-month from day one — the software has to earn your business every month. RealGreen typically requires annual agreements. If you decide to switch, you&apos;re not stuck.</p></div>
        </div>
      </section>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">Less Than RealGreen Basic — More Included</h2>
          <p className="section-sub">$129/month. Everything included. No add-ons, no per-device fees, no custom quote required.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="price-card featured" style={{width:'100%'}}>
            <div className="featured-badge">Less Than RealGreen Basic — More Included</div>
            <div className="price-tier">One Plan. Everything Included. No Add-Ons.</div>
            <div className="price-amount"><sup>$</sup>129</div>
            <div className="price-period">per month — cancel anytime</div>
            <ul className="price-features">
              <li>Unlimited Clients, Properties &amp; Leads</li>
              <li>Unlimited Employees &amp; Users — No Per-Device Fees</li>
              <li>Sq Ft Waiting List by Service Type</li>
              <li>Lasso Circle Map Route Selector</li>
              <li>Chemical Compliance Logs &amp; Reports</li>
              <li>Full Scheduling, Dispatch &amp; Route Map</li>
              <li>Estimates, Invoices &amp; Card-on-File Payments</li>
              <li>Two-Way SMS &amp; 10+ Automated Alerts</li>
              <li>Package Plans &amp; Renewal Tracking</li>
              <li>Mobile App for Technicians</li>
              <li>500 Outbound SMS/month included</li>
              <li>14-day free trial — no credit card required</li>
            </ul>
            <button className="price-btn price-btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(2, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
          </div>
        </div>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'13px', marginTop:'32px'}}>No contracts. Cancel anytime. No hidden fees — ever.</p>
      </section>

      <div className="cta-band">
        <h2>Done Waiting for a Custom Quote on Software<span>That Costs 2–3x What You Need to Pay?</span></h2>
        <p>LandscapeBossPro is $129/month. Start your free trial now — no demo, no credit card, no waiting.</p>
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
            <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Company Name</label><input id={`sbp${n}-company`} type="text" placeholder="Smith Lawn Care" style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
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
