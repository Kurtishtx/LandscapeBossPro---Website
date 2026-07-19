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
async function sbpCreateAccount(n: number) { const err = document.getElementById('sbp' + n + '-err2')!; const btn = document.getElementById('sbp' + n + '-create-btn') as HTMLButtonElement; err.style.display = 'none'; const email = (document.getElementById('sbp' + n + '-login-email') as HTMLInputElement).value.trim(); const password = (document.getElementById('sbp' + n + '-password') as HTMLInputElement).value; const confirm = (document.getElementById('sbp' + n + '-confirm') as HTMLInputElement).value; if (password.length < 8) return sbpShowErr(err as HTMLElement, 'Password must be at least 8 characters.'); if (password !== confirm) return sbpShowErr(err as HTMLElement, 'Passwords do not match.'); if (!(document.getElementById('sbp' + n + '-agree') as HTMLInputElement).checked) return sbpShowErr(err as HTMLElement, 'Please agree to the Terms of Service and Privacy Policy.'); btn.disabled = true; btn.textContent = 'Creating your account…'; try { const res = await fetch(SBP_URL + '/functions/v1/manage-users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SBP_ANON, 'apikey': SBP_ANON }, body: JSON.stringify({ action: 'create', email, password }) }); const result = await res.json(); if (result.error) throw new Error(result.error); const sb = getSbpClient(); const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password }); if (signInErr) throw new Error(signInErr.message); const uid = signInData.user.id; const first = (document.getElementById('sbp' + n + '-first') as HTMLInputElement).value.trim(); const last = (document.getElementById('sbp' + n + '-last') as HTMLInputElement).value.trim(); const comp = (document.getElementById('sbp' + n + '-company') as HTMLInputElement).value.trim(); await sb.auth.updateUser({ data: { full_name: first + ' ' + last } }); const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); await sb.from('user_profiles').upsert({ id: uid, email, role: 'full_access', is_primary_owner: true, tenant_id: null, trial_ends_at: trialEnd }, { onConflict: 'id' }); await sb.from('company_info').insert({ user_id: uid, company_name: comp, display_name: comp }); const reasons = ['Cancel Maintaining Self', 'Cancel Sold House', 'Cancel Too Expensive', 'Cancel Unknown', 'Dropping Customer', 'Sold House'].map(nm => ({ name: nm, active: true, user_id: uid })); await sb.from('cancellation_reasons').insert(reasons); document.getElementById('sbp' + n + '-step2')!.style.display = 'none'; document.getElementById('sbp' + n + '-success')!.style.display = 'block'; let secs = 4; const cd = document.getElementById('sbp' + n + '-countdown')!; cd.textContent = 'Redirecting in ' + secs + ' seconds…'; const iv = setInterval(() => { secs--; if (secs <= 0) { clearInterval(iv); window.location.href = 'https://my.landscapebosspro.com/dashboard.html' + (typeof signInData!=='undefined'&&signInData&&signInData.session?'#access_token='+encodeURIComponent(signInData.session.access_token)+'&refresh_token='+encodeURIComponent(signInData.session.refresh_token):''); } else cd.textContent = 'Redirecting in ' + secs + ' second' + (secs === 1 ? '' : 's') + '…'; }, 1000); } catch (e: any) { sbpShowErr(err as HTMLElement, e.message || 'Something went wrong. Please try again.'); btn.disabled = false; btn.textContent = 'Create My Account'; } }
function sbpShowErr(el: HTMLElement, msg: string) { el.textContent = msg; el.style.display = 'block'; }

export default function VsHousecallPro() {
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
        .check-list { list-style: none; margin-top: 16px; }
        .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; color: var(--muted); margin-bottom: 12px; }
        .check-list li::before { content: '✓'; background: var(--orange); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .hcp-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .hcp-tier { border: 1.5px solid var(--border); border-radius: 10px; padding: 16px 14px; background: #fff; }
        .hcp-tier-header { background: var(--light-bg); border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; }
        .hcp-tier-name { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); }
        .hcp-tier-users { font-size: 11px; color: #dc2626; font-weight: 600; margin-top: 2px; }
        .hcp-tier-price { font-size: 22px; font-weight: 800; color: var(--text); }
        .hcp-tier-note { font-size: 11px; color: var(--muted); margin-top: 4px; line-height: 1.4; }
        .sbp-contrast { background: linear-gradient(135deg, var(--purple-deep) 0%, #15321f 100%); border-radius: 10px; padding: 20px 18px; border: 2px solid rgba(27,110,59,.3); }
        .sbp-contrast-label { color: rgba(255,255,255,.5); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .sbp-contrast-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
        .sbp-contrast-row:last-child { border-bottom: none; }
        .sbp-contrast-row-label { color: rgba(255,255,255,.7); font-size: 13px; }
        .sbp-contrast-row-val { color: var(--orange); font-size: 13px; font-weight: 700; }
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
        .cta-band h2 span { display: block; }
        .cta-band p { color: rgba(255,255,255,.7); font-size: 18px; margin-bottom: 40px; max-width: 560px; margin-left: auto; margin-right: auto; }
        @media (max-width: 700px) { section { padding: 60px 20px; } .hero { padding: 70px 20px 60px; } .hero-stats { gap: 30px; } .highlight-row, .highlight-row.reverse { flex-direction: column; } .hcp-tiers { grid-template-columns: 1fr; } }
      `}</style>

      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      <div className="hero">
        <div className="hero-badge">Housecall Pro Alternative</div>
        <h1>Housecall Pro Is Built for Plumbers and HVAC.<br /><span>LandscapeBossPro Is Built for Landscaping.</span><br />$129 vs $149 — and No Comparison on Features.</h1>
        <p>Housecall Pro serves cleaning companies, plumbers, HVAC techs, and dozens of other trades. LandscapeBossPro is built specifically for landscaping — with the line-item estimates, materials &amp; products tracking, project scheduling, crew dispatch, and recurring maintenance plans that HCP doesn&apos;t do well at any price.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">1</div><div className="hero-stat-lbl">User on HCP Basic ($59/mo)</div></div>
          <div><div className="hero-stat-val">Unlimited</div><div className="hero-stat-lbl">Users on LandscapeBossPro ($129/mo)</div></div>
          <div><div className="hero-stat-val">$149</div><div className="hero-stat-lbl">HCP Essentials — 5-User Cap</div></div>
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">LandscapeBossPro — Unlimited Users</div></div>
        </div>
      </div>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">Housecall Pro Pricing Reality</span>
          <h2 className="section-title">HCP Charges More Per Tier. LandscapeBossPro Is $129 — Unlimited.</h2>
          <p className="section-sub" style={{marginLeft:'auto', marginRight:'auto'}}>Housecall Pro structures pricing around user count. The moment you need more than one user, your price jumps. LandscapeBossPro doesn&apos;t have user tiers — your whole crew is included at $129/month.</p>
        </div>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="highlight-row">
            <div className="highlight-visual" style={{flex:1.5, minWidth:'280px'}}>
              <div className="hcp-tiers">
                <div className="hcp-tier">
                  <div className="hcp-tier-header">
                    <div className="hcp-tier-name">Basic</div>
                    <div className="hcp-tier-users">1 user only</div>
                  </div>
                  <div className="hcp-tier-price">$59/mo</div>
                  <div className="hcp-tier-note">Solo operator only. Add a second user and you move to Essentials.</div>
                </div>
                <div className="hcp-tier">
                  <div className="hcp-tier-header">
                    <div className="hcp-tier-name">Essentials</div>
                    <div className="hcp-tier-users">Up to 5 users</div>
                  </div>
                  <div className="hcp-tier-price">$149/mo</div>
                  <div className="hcp-tier-note">Most landscaping crews need this tier. More than LBP — far fewer landscaping features.</div>
                </div>
                <div className="hcp-tier">
                  <div className="hcp-tier-header">
                    <div className="hcp-tier-name">MAX</div>
                    <div className="hcp-tier-users">Up to 8 users</div>
                  </div>
                  <div className="hcp-tier-price">$299/mo</div>
                  <div className="hcp-tier-note">Still no line-item landscaping estimates, materials tracking, or crew dispatch built for projects.</div>
                </div>
              </div>
              <div className="sbp-contrast">
                <div className="sbp-contrast-label">LandscapeBossPro — $129/month</div>
                <div className="sbp-contrast-row"><span className="sbp-contrast-row-label">Users</span><span className="sbp-contrast-row-val">Unlimited — no caps</span></div>
                <div className="sbp-contrast-row"><span className="sbp-contrast-row-label">Line-Item Estimates</span><span className="sbp-contrast-row-val">✓ Included</span></div>
                <div className="sbp-contrast-row"><span className="sbp-contrast-row-label">Materials &amp; Products Tracking</span><span className="sbp-contrast-row-val">✓ Included</span></div>
              </div>
            </div>
            <div className="highlight-text" style={{flex:1, minWidth:'280px'}}>
              <span className="section-label">The Math</span>
              <h2>For Less Than HCP Essentials, LandscapeBossPro Has Landscaping Tools HCP Doesn&apos;t Have at Any Price.</h2>
              <p>HCP Essentials is $149/month and covers up to 5 users. LandscapeBossPro is $129/month with unlimited users. But the bigger gap isn&apos;t price — it&apos;s features. HCP doesn&apos;t have detailed line-item landscaping estimates, materials &amp; products tracking, or crew dispatch built around multi-day projects. These aren&apos;t premium add-ons in LandscapeBossPro — they&apos;re in the base price.</p>
              <ul className="check-list">
                <li>Line-item estimates &amp; bids for install and design-build — built for landscaping</li>
                <li>Materials &amp; products tracking per job — doesn&apos;t exist in HCP</li>
                <li>Project scheduling across multi-day jobs — beyond HCP&apos;s one-visit model</li>
                <li>Recurring maintenance plans — purpose-built, not a generic recurring job</li>
                <li>Unlimited users at $129 — HCP needs MAX ($299) for 8 users</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="premium-band">
        <h2>Housecall Pro Was Designed for Cleaning Companies and Plumbers.<br /><span>Not for Landscaping Projects.</span></h2>
        <p>Housecall Pro is a capable general home service platform. But when your business runs on multi-day install and design-build projects with detailed material takeoffs, line-item bids, multiple crews, and recurring maintenance plans, "general home service" isn&apos;t what you need. LandscapeBossPro was built around the specific operational model of landscaping — and it shows in every feature.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">📋</div><h4>Line-Item Estimates &amp; Bids</h4><p>Build detailed, professional bids with line items for labor, materials, plants, hardscape, and sod. Send for online acceptance and turn the won bid into a scheduled project. HCP&apos;s quotes were built for quick repair jobs, not landscape installs.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📦</div><h4>Materials &amp; Products Tracking</h4><p>Track materials and products on every job — pavers, mulch, stone, plants, sod, soil. Tie quantities to estimates and know your job cost. HCP has line items on invoices, not real materials tracking built for material-heavy landscape work.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🗓️</div><h4>Project Scheduling &amp; Job Board</h4><p>Schedule multi-day projects across crews, drag jobs on a board, and keep every phase organized. HCP centers on one-visit appointments. LandscapeBossPro plans projects that run days or weeks with a true job board.</p></div>
          <div className="premium-card"><div className="premium-card-icon">👥</div><h4>Unlimited Users at $129</h4><p>HCP Basic is 1 user. HCP Essentials caps at 5 users for $149. LandscapeBossPro covers your entire crew at $129 — no user caps, no tier jumps, no per-seat math as you hire. Add your 10th employee at no extra cost.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🔁</div><h4>Recurring Maintenance Plans</h4><p>LandscapeBossPro is built around recurring maintenance programs — visit schedules, plan renewals, due-date flags, and route-ready crews. HCP handles recurring jobs for general trades. The landscape maintenance workflow is different, and HCP wasn&apos;t built for it.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Two-Way Customer Texts</h4><p>Full inbound/outbound text conversation history per contact, organized by customer. Automated appointment alerts, estimate follow-ups, payment reminders — all built in. Included at $129, not locked behind a premium tier.</p></div>
        </div>
      </div>

      <section>
        <div className="centered" style={{maxWidth:'960px', margin:'0 auto'}}>
          <span className="section-label">Side by Side</span>
          <h2 className="section-title">LandscapeBossPro vs Housecall Pro</h2>
          <p className="section-sub">The features that matter for landscaping businesses — not general home service.</p>
        </div>
        <div className="compare-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{width:'50%'}}>Feature</th>
                <th className="sbp-col" style={{width:'25%'}}>LandscapeBossPro</th>
                <th style={{width:'25%'}}>Housecall Pro</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="feature-name">Built Specifically for Landscaping</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Line-Item Estimates &amp; Bids for Installs</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Basic</span></td></tr>
              <tr><td className="feature-name">Materials &amp; Products Tracking per Job</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Multi-Day Project Scheduling &amp; Job Board</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Limited</span></td></tr>
              <tr><td className="feature-name">Recurring Maintenance Plans</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Limited</span></td></tr>
              <tr><td className="feature-name">Crew Dispatch &amp; Routing</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Client &amp; Property Profiles</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Two-Way Customer Texts Included</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Essentials+</span></td></tr>
              <tr><td className="feature-name">Estimates &amp; Online Acceptance</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Card-on-File Payments</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Mobile App for Crews</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Automated Review Requests</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Unlimited Users at Flat Price</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗ Capped by tier</span></td></tr>
              <tr><td className="feature-name">Price for a 5-Person Team</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129/month</td><td style={{color:'var(--muted)'}}>$149/month (Essentials)</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Right Tool</span>
          <h2 className="section-title">When You Need a Tool Built for Your Business — Not Every Business</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>Housecall Pro does many things well for general home service companies. LandscapeBossPro does fewer things — but all of them are the exact things a landscaping business needs, built deeper and better than any general platform.</p>
        </div>
        <div className="simple-grid">
          <div className="simple-card"><div className="simple-num">01</div><h3>Projects, Not Quick Appointments</h3><p>LandscapeBossPro is built around multi-day install and design-build projects — line-item bids, phased scheduling, multiple crews, and job-cost visibility. HCP centers on single-visit appointments. Landscaping work doesn&apos;t fit that mold.</p></div>
          <div className="simple-card"><div className="simple-num">02</div><h3>Landscaping Is Material-Heavy</h3><p>Pavers, mulch, stone, plants, sod, soil — your jobs run on materials. LandscapeBossPro tracks materials and products on every estimate and job so you know your real cost. HCP tracks job duration and invoices, not the materials a landscape job is built from.</p></div>
          <div className="simple-card"><div className="simple-num">03</div><h3>Estimates Win the Job</h3><p>Detailed, professional line-item bids close design-build and install work. LandscapeBossPro builds them fast, sends them for online acceptance, and turns the won bid into a scheduled project. HCP&apos;s quotes were built for quick repairs, not landscape installs.</p></div>
          <div className="simple-card"><div className="simple-num">04</div><h3>$20 Less — And More Included</h3><p>LandscapeBossPro is $129/month with unlimited users, line-item estimates, materials tracking, project scheduling, crew dispatch, recurring maintenance plans, and customer texts. HCP Essentials is $149 with a 5-user cap and none of those landscaping-specific tools. Less money. More landscaping.</p></div>
        </div>
      </section>

      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">Less Than HCP Essentials — More Landscaping Features</h2>
          <p className="section-sub">$129/month. Unlimited users. Every landscaping-specific feature included.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="price-card featured" style={{width:'100%'}}>
            <div className="featured-badge">Less Than HCP Essentials — More Landscaping Features</div>
            <div className="price-tier">One Plan. Built for Landscaping. Start Today.</div>
            <div className="price-amount"><sup>$</sup>129</div>
            <div className="price-period">per month — cancel anytime</div>
            <ul className="price-features">
              <li>Unlimited Clients, Properties &amp; Leads</li>
              <li>Unlimited Employees &amp; Users</li>
              <li>Line-Item Estimates &amp; Bids</li>
              <li>Materials &amp; Products Tracking</li>
              <li>Project Scheduling &amp; Job Board</li>
              <li>Crew Dispatch, Routing &amp; Route Map</li>
              <li>Invoicing &amp; Card-on-File Payments</li>
              <li>Two-Way Customer Texts &amp; 10+ Automated Alerts</li>
              <li>Recurring Maintenance Plans &amp; Renewal Tracking</li>
              <li>Mobile App for Crews</li>
              <li>500 Outbound Texts/month included</li>
              <li>14-day free trial — no credit card required</li>
            </ul>
            <button className="price-btn price-btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(2, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
          </div>
        </div>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'13px', marginTop:'32px'}}>No contracts. Cancel anytime. No hidden fees — ever.</p>
      </section>

      <div className="cta-band">
        <h2>Done Paying for General Home Service Software<span>That Doesn&apos;t Know What a Landscaping Business Needs?</span></h2>
        <p>Try LandscapeBossPro free for 14 days. No credit card required. Set up in an afternoon.</p>
        <div className="hero-btns">
          <button className="btn-primary" style={{fontSize:'17px', padding:'18px 44px'}} onClick={(e) => { e.preventDefault(); openSignupModal(3, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
      </div>

      <div id="sbp-backdrop" onClick={() => closeAllModals()} style={{display:'none', position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,.55)', zIndex:99997}}></div>
      {[1,2,3].map(n => (
        <div key={n} id={`sbp-form-${n}`} style={{display:'none', position:'fixed', zIndex:99999, width:'420px', maxWidth:'calc(100vw - 24px)', background:'#fff', borderRadius:'14px', border:'3px solid #1b6e3b', boxShadow:'0 0 0 4px rgba(27,110,59,.35), 0 16px 60px rgba(0,0,0,.45)', maxHeight:'calc(100vh - 40px)', overflowY:'auto'}}>
          <div style={{background:'linear-gradient(135deg,#08140d,#15321f)', padding:'28px 28px 22px', position:'relative'}}>
            <div style={{color:'#fff', fontSize:'20px', fontWeight:800, paddingRight:'36px'}}>Start Your 14-Day Free Trial</div>
            <div style={{color:'rgba(255,255,255,.6)', fontSize:'13px', marginTop:'5px'}}>No credit card required · Full access · $129/mo after your 14-day trial</div>
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
