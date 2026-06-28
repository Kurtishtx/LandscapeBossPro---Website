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

export default function VsAspire() {
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
        .compare-table th.sbp-col { background: rgba(224,120,32,.08); color: var(--orange); }
        .compare-table td { padding: 13px 20px; font-size: 14px; border-bottom: 1px solid var(--border); color: var(--text); vertical-align: middle; }
        .compare-table td.sbp-col { background: rgba(224,120,32,.04); }
        .compare-table tr:last-child td { border-bottom: none; }
        .feature-name { font-weight: 600; }
        .chk { color: #16a34a; font-size: 17px; font-weight: 700; }
        .crs { color: #dc2626; font-size: 17px; font-weight: 700; }
        .prt { color: #d97706; font-size: 13px; font-weight: 600; }
        .highlight-row { display: flex; align-items: flex-start; gap: 60px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; }
        .highlight-row.reverse { flex-direction: row-reverse; }
        .highlight-text { flex: 1; min-width: 280px; }
        .highlight-text h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
        .highlight-text p { font-size: 15px; color: var(--muted); margin-bottom: 16px; }
        .highlight-visual { flex: 1; min-width: 280px; }
        .check-list { list-style: none; margin-top: 12px; }
        .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--muted); margin-bottom: 10px; }
        .check-list li::before { content: '✓'; background: var(--orange); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .cost-compare { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
        .cost-box { flex: 1; min-width: 140px; border-radius: 12px; padding: 20px; text-align: center; }
        .cost-box.aspire { background: #fee2e2; border: 2px solid #fca5a5; }
        .cost-box.sbp { background: linear-gradient(135deg, var(--purple-deep) 0%, #1e0a35 100%); border: 2px solid rgba(224,120,32,.4); }
        .cost-box-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .cost-box.aspire .cost-box-label { color: #dc2626; }
        .cost-box.sbp .cost-box-label { color: rgba(255,255,255,.6); }
        .cost-box-price { font-size: 30px; font-weight: 800; line-height: 1; }
        .cost-box.aspire .cost-box-price { color: #dc2626; }
        .cost-box.sbp .cost-box-price { color: var(--orange); }
        .cost-box-period { font-size: 12px; margin-top: 4px; }
        .cost-box.aspire .cost-box-period { color: #b91c1c; }
        .cost-box.sbp .cost-box-period { color: rgba(255,255,255,.55); }
        .cost-box-note { font-size: 11px; margin-top: 6px; }
        .cost-box.aspire .cost-box-note { color: #b91c1c; }
        .cost-box.sbp .cost-box-note { color: rgba(255,255,255,.4); }
        .cost-rows { background: var(--light-bg); border: 1.5px solid var(--border); border-radius: 10px; overflow: hidden; }
        .cost-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border); }
        .cost-row:last-child { border-bottom: none; }
        .cost-row-label { font-size: 13px; font-weight: 600; color: var(--text); }
        .cost-divider { background: var(--border); height: 2px; }
        .cost-row-val { font-size: 13px; font-weight: 700; }
        .cost-row-val.red { color: #dc2626; }
        .cost-row-val.green { color: #16a34a; }
        .cost-row-val.orange { color: var(--orange); }
        .premium-band { background: linear-gradient(135deg, var(--purple-dark) 0%, #1a0530 100%); padding: 90px 40px; text-align: center; position: relative; overflow: hidden; }
        .premium-band::before { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(224,120,32,.1) 0%, transparent 65%); pointer-events: none; }
        .premium-band h2 { color: #fff; font-size: clamp(22px, 3.5vw, 40px); font-weight: 800; line-height: 1.2; max-width: 900px; margin: 0 auto 18px; }
        .premium-band h2 span { color: var(--orange); }
        .premium-band p { color: rgba(255,255,255,.65); font-size: 16px; max-width: 720px; margin: 0 auto; line-height: 1.8; }
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
        .price-note { color: var(--muted); font-size: 12px; margin-bottom: 20px; }
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
        .cta-band h2 span { color: var(--orange); display: block; }
        .cta-band p { color: rgba(255,255,255,.7); font-size: 18px; margin-bottom: 40px; max-width: 560px; margin-left: auto; margin-right: auto; }
        @media (max-width: 700px) { section { padding: 60px 20px; } .hero { padding: 70px 20px 60px; } .hero-stats { gap: 30px; } .highlight-row, .highlight-row.reverse { flex-direction: column; } .cost-compare { flex-direction: column; } }
      `}</style>

      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      <div className="hero">
        <div className="hero-badge">Aspire Software Alternative</div>
        <h1>Aspire Costs $1,299/Month on Average.<br /><span>SprayBossPro Is $129. That&apos;s 10x Less — With Features Aspire Doesn&apos;t Have.</span></h1>
        <p>Aspire is an enterprise ERP built for $5M+ landscaping companies with 100+ employees. If you&apos;re a spray business, you&apos;d pay 10x more for complexity you&apos;ll never use — and still miss the spray-specific features SprayBossPro has at $129.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">$1,299</div><div className="hero-stat-lbl">Aspire Monthly Average</div></div>
          <div><div className="hero-stat-val">$129</div><div className="hero-stat-lbl">SprayBossPro — Everything Included</div></div>
          <div><div className="hero-stat-val">10x</div><div className="hero-stat-lbl">Less Than Aspire</div></div>
          <div><div className="hero-stat-val">Grows</div><div className="hero-stat-lbl">With Your Spray Business</div></div>
        </div>
      </div>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 48px'}}>
          <span className="section-label">What Aspire Actually Costs</span>
          <h2 className="section-title">Aspire at $1,299/Month vs SprayBossPro at $129/Month — The 10x Difference</h2>
          <p className="section-sub" style={{maxWidth:'720px', marginLeft:'auto', marginRight:'auto'}}>Aspire is a full enterprise ERP — job costing, crew management, equipment tracking, multi-branch operations, CRM, and more. It&apos;s built for large landscaping companies with complex operational needs. For a spray business, you&apos;d pay $1,299/month on average for tools you&apos;ll never use, without the spray-specific features SprayBossPro has.</p>
        </div>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="highlight-row">
            <div className="highlight-visual" style={{flex:1.5, minWidth:'280px'}}>
              <div className="cost-compare">
                <div className="cost-box aspire">
                  <div className="cost-box-label">Aspire Software</div>
                  <div className="cost-box-price">$15,588</div>
                  <div className="cost-box-period">per year</div>
                  <div className="cost-box-note">~$1,299/month average</div>
                </div>
                <div className="cost-box sbp">
                  <div className="cost-box-label">SprayBossPro</div>
                  <div className="cost-box-price">$1,548</div>
                  <div className="cost-box-period">per year</div>
                  <div className="cost-box-note">$129/month flat — everything included</div>
                </div>
              </div>
              <div className="cost-rows">
                <div className="cost-row"><span className="cost-row-label">Year 1 Savings</span><span className="cost-row-val green">$14,040/year</span></div>
                <div className="cost-row"><span className="cost-row-label">3-Year Savings</span><span className="cost-row-val green">$42,120</span></div>
                <div className="cost-divider"></div>
                <div className="cost-row"><span className="cost-row-label">Aspire Pricing Model</span><span className="cost-row-val red">Custom quote, per-user</span></div>
                <div className="cost-row"><span className="cost-row-label">SprayBossPro Pricing</span><span className="cost-row-val orange">$129/mo flat — published</span></div>
                <div className="cost-row"><span className="cost-row-label">Aspire Public Pricing</span><span className="cost-row-val red">Not published</span></div>
                <div className="cost-row"><span className="cost-row-label">SprayBossPro Trial</span><span className="cost-row-val green">14 days free — no card</span></div>
              </div>
            </div>
            <div className="highlight-text" style={{flex:1, minWidth:'280px'}}>
              <span className="section-label">10x Less</span>
              <h2>Aspire Is an Enterprise ERP. SprayBossPro Is Built for Spray Routes. Those Aren&apos;t the Same Thing.</h2>
              <p>Aspire software is a full business management platform built for large landscaping operations with multi-million dollar revenue, dozens of crews, and complex job costing requirements. The average operator pays ~$1,299/month or more once licensing and implementation are factored in.</p>
              <p>SprayBossPro is $129/month — designed for spray businesses running recurring treatment schedules. Lasso routing, sq ft waiting lists by service type, chemical compliance logs — these are built into SprayBossPro. They don&apos;t exist in Aspire.</p>
              <ul className="check-list">
                <li>$129/month — 10x less than Aspire&apos;s average</li>
                <li>Sq ft waiting list by service type — not in Aspire</li>
                <li>Lasso circle route selector — not in Aspire</li>
                <li>Chemical compliance logs — not a core Aspire feature</li>
                <li>14-day free trial — no card required, start now</li>
                <li>Set up in hours — not months of onboarding</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="premium-band">
        <h2>Aspire Is an ERP for $5M Landscaping Companies.<span>You&apos;re a Spray Business. That&apos;s Not the Same Thing.</span></h2>
        <p>Aspire has job costing, equipment tracking, multi-branch management, proposal tools, and full crew management. It&apos;s powerful — for the right company. A spray business running recurring treatment routes doesn&apos;t need an enterprise ERP. It needs sq ft tracking, lasso routing, chemical logs, and a waiting list by service type. SprayBossPro has all of that at $129/month.</p>
      </div>

      <section>
        <div className="centered" style={{maxWidth:'960px', margin:'0 auto 48px'}}>
          <span className="section-label">Side by Side</span>
          <h2 className="section-title">SprayBossPro vs Aspire Software</h2>
          <p className="section-sub" style={{maxWidth:'720px', marginLeft:'auto', marginRight:'auto'}}>A complete feature comparison — including the spray-specific tools SprayBossPro has that Aspire doesn&apos;t, and the price difference that matters most.</p>
        </div>
        <div className="compare-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{width:'50%'}}>Feature</th>
                <th className="sbp-col" style={{width:'25%'}}>SprayBossPro $129</th>
                <th style={{width:'25%'}}>Aspire Software</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="feature-name">Monthly Price</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129/month flat</td><td style={{color:'#dc2626', fontWeight:700}}>~$1,299/month avg</td></tr>
              <tr><td className="feature-name">Published Pricing</td><td className="sbp-col"><span className="chk">✓ $129 — right here</span></td><td><span className="crs">✗ Custom quote only</span></td></tr>
              <tr><td className="feature-name">Sq Ft Waiting List by Service Type</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Lasso Circle Map Route Selector</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Chemical Compliance Logs</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Not a core feature</span></td></tr>
              <tr><td className="feature-name">Two-Way SMS Inbox</td><td className="sbp-col"><span className="chk">✓ Included</span></td><td><span className="prt">Add-on / integration</span></td></tr>
              <tr><td className="feature-name">14-Day Free Trial</td><td className="sbp-col"><span className="chk">✓ No card required</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Recurring Treatment Waiting List</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Setup Time</td><td className="sbp-col"><span className="chk">Hours — self-serve</span></td><td><span className="prt">Weeks of onboarding</span></td></tr>
              <tr><td className="feature-name">No Annual Contract</td><td className="sbp-col"><span className="chk">✓ Month-to-month</span></td><td><span className="crs">✗ Annual contract</span></td></tr>
              <tr><td className="feature-name">Package Plans &amp; Renewals</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Scheduling &amp; Dispatch</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Job Costing &amp; Crew Management</td><td className="sbp-col"><span className="prt">Not applicable — spray</span></td><td><span className="chk">✓ Enterprise-grade</span></td></tr>
              <tr><td className="feature-name">Mobile App for Technicians</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Right Fit</span>
          <h2 className="section-title">Aspire Is Built for Large Landscaping Operations. SprayBossPro Is Built for Spray Routes.</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>Aspire is a genuinely powerful platform — for the right company. It&apos;s overkill for a spray business and still misses the spray-specific features you need. SprayBossPro is purpose-built for how spray businesses actually work.</p>
        </div>
        <div className="simple-grid">
          <div className="simple-card"><div className="simple-num">01</div><h3>10x Less — $1,170 Saved Every Month</h3><p>Aspire averages ~$1,299/month. SprayBossPro is $129/month. That&apos;s $1,170 saved every single month — $14,040 per year — on software that was actually built for how spray businesses operate. The savings alone pay for significant business growth.</p></div>
          <div className="simple-card"><div className="simple-num">02</div><h3>Built for Spray — Not Landscaping ERPs</h3><p>Aspire was designed for multi-million dollar landscaping companies with complex crew management, equipment tracking, and multi-branch operations. Spray businesses need sq ft waiting lists, lasso routing, chemical compliance logs, and recurring treatment tracking. Those features don&apos;t exist in Aspire. They&apos;re built into SprayBossPro.</p></div>
          <div className="simple-card"><div className="simple-num">03</div><h3>Hours to Set Up — Not Months</h3><p>Aspire requires a significant implementation and onboarding process — weeks of setup, training, and configuration before you&apos;re operational. SprayBossPro is self-serve. Start your free trial, add your clients, build your routes, and send your first estimate in a single afternoon.</p></div>
          <div className="simple-card"><div className="simple-num">04</div><h3>Month-to-Month — No Lock-In</h3><p>SprayBossPro is month-to-month from day one with a 14-day free trial. No annual contract required. No implementation fees. No credit card to start your trial. Aspire requires an annual contract and a significant upfront commitment. SprayBossPro has to earn your business every month.</p></div>
        </div>
      </section>

      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">10x Less Than Aspire&apos;s Average</h2>
          <p className="section-sub">$129/month flat. Everything included. No enterprise pricing, no annual contract, no hidden fees.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="price-card featured" style={{width:'100%'}}>
            <div className="featured-badge">10x Less Than Aspire&apos;s Average</div>
            <div className="price-tier">One Plan. Flat Forever. Start Today.</div>
            <div className="price-amount"><sup>$</sup>129</div>
            <div className="price-period">per month — cancel anytime</div>
            <div className="price-note">No annual contract required</div>
            <ul className="price-features">
              <li>Unlimited Clients, Properties &amp; Leads</li>
              <li>Unlimited Employees &amp; Users</li>
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
        <h2>Why Pay $1,299/Month for Software<span>Built for a Different Industry? SprayBossPro Is $129.</span></h2>
        <p>Spray-specific features, $129/month flat, 14-day free trial. Start today — no demo required, no card needed.</p>
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
