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

export default function VsClip() {
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
        .hero h1 { color: #fff; font-size: clamp(22px, 3.2vw, 42px); font-weight: 800; line-height: 1.15; max-width: 960px; margin: 0 auto 20px; }
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
        .highlight-row { display: flex; align-items: flex-start; gap: 60px; max-width: 1100px; margin: 0 auto; flex-wrap: wrap; }
        .highlight-row.reverse { flex-direction: row-reverse; }
        .highlight-text { flex: 1; min-width: 280px; }
        .highlight-text h2 { font-size: clamp(24px, 3vw, 36px); font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
        .highlight-text p { font-size: 15px; color: var(--muted); margin-bottom: 16px; }
        .highlight-visual { flex: 1; min-width: 280px; }
        .check-list { list-style: none; margin-top: 12px; }
        .check-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--muted); margin-bottom: 10px; }
        .check-list li::before { content: '✓'; background: var(--orange); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .clip-tiers { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        .clip-tier { background: var(--light-bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 14px 16px; }
        .clip-tier-name { font-weight: 700; font-size: 14px; color: var(--text); margin-bottom: 4px; }
        .clip-tier-price { font-size: 20px; font-weight: 800; color: var(--orange); margin-bottom: 6px; }
        .clip-tier-limits { display: flex; flex-wrap: wrap; gap: 6px; }
        .clip-limit-tag { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; border-radius: 20px; font-size: 11px; font-weight: 600; padding: 2px 10px; }
        .clip-add-fee { background: var(--light-bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 14px; }
        .clip-add-fee-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 10px; }
        .clip-add-fee-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 13px; }
        .clip-add-fee-row:last-child { border-bottom: none; }
        .sbp-contrast { background: linear-gradient(135deg, var(--purple-deep) 0%, #15321f 100%); border-radius: 10px; padding: 16px 18px; border: 2px solid rgba(27,110,59,.3); }
        .sbp-contrast-label { color: rgba(255,255,255,.5); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .sbp-contrast-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,.08); }
        .sbp-contrast-row:last-child { border-bottom: none; }
        .sbp-contrast-row-label { color: rgba(255,255,255,.65); font-size: 13px; }
        .sbp-contrast-row-val { color: var(--orange); font-weight: 700; font-size: 13px; }
        .premium-band { background: linear-gradient(135deg, var(--purple-dark) 0%, #11281a 100%); padding: 90px 40px; text-align: center; position: relative; overflow: hidden; }
        .premium-band::before { content: ''; position: absolute; top: -80px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(27,110,59,.1) 0%, transparent 65%); pointer-events: none; }
        .premium-band h2 { color: #fff; font-size: clamp(24px, 3.5vw, 42px); font-weight: 800; line-height: 1.2; max-width: 860px; margin: 0 auto 18px; }
        .premium-band h2 span { color: var(--orange); }
        .premium-band p { color: rgba(255,255,255,.65); font-size: 16px; max-width: 720px; margin: 0 auto; }
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
        <div className="hero-badge">CLIP Lawn Software Alternative</div>
        <h1>CLIP Caps You at 40 Properties, Charges Extra Per User, and Still Doesn&apos;t Have Lasso, Chemical Logs, or a Sq Ft Waiting List.</h1>
        <p>CLIP Basic limits you to 40 properties and 1 user. Add users at $20/month each. Add payment processing separately. LandscapeBossPro is $129/month flat — unlimited properties, unlimited users, everything included.</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }}>Start Your 14-Day Free Trial</button>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">40</div><div className="hero-stat-lbl">CLIP Basic Property Cap</div></div>
          <div><div className="hero-stat-val">Unlimited</div><div className="hero-stat-lbl">LandscapeBossPro Properties</div></div>
          <div><div className="hero-stat-val">$20/mo</div><div className="hero-stat-lbl">CLIP Extra User Fee</div></div>
          <div><div className="hero-stat-val">$0</div><div className="hero-stat-lbl">LandscapeBossPro Extra User Fee</div></div>
        </div>
      </div>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'960px', margin:'0 auto 48px'}}>
          <span className="section-label">CLIP Pricing Reality</span>
          <h2 className="section-title">CLIP Has Three Tiers — All With Property Caps, Per-User Fees, and Add-On Charges.</h2>
          <p className="section-sub" style={{maxWidth:'760px', marginLeft:'auto', marginRight:'auto'}}>CLIP&apos;s pricing starts at $64.99/month but includes strict property and user limits. Add more users at $20/month each, add payment processing, and by the time you remove all the caps you&apos;re spending more than LandscapeBossPro&apos;s flat $129 — without the spray-specific features.</p>
        </div>
        <div style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="highlight-row">
            <div className="highlight-visual" style={{flex:1.5, minWidth:'280px'}}>
              <div className="clip-tiers">
                <div className="clip-tier">
                  <div className="clip-tier-name">CLIP Basic</div>
                  <div className="clip-tier-price">$64.99/mo</div>
                  <div className="clip-tier-limits"><span className="clip-limit-tag">Max 40 properties</span><span className="clip-limit-tag">1 user only</span></div>
                </div>
                <div className="clip-tier">
                  <div className="clip-tier-name">CLIP Plus</div>
                  <div className="clip-tier-price">$129.99/mo</div>
                  <div className="clip-tier-limits"><span className="clip-limit-tag">Max 400 properties</span><span className="clip-limit-tag">2 users included</span></div>
                </div>
                <div className="clip-tier">
                  <div className="clip-tier-name">CLIP Enterprise</div>
                  <div className="clip-tier-price">$196.99/mo</div>
                  <div className="clip-tier-limits"><span className="clip-limit-tag">Unlimited properties</span><span className="clip-limit-tag">4 users included</span></div>
                </div>
              </div>
              <div className="clip-add-fee">
                <div className="clip-add-fee-label">CLIP Add-On Fees — On Top of Plan Price</div>
                <div className="clip-add-fee-row"><span style={{color:'var(--text)'}}>Additional Users</span><span style={{color:'#dc2626', fontWeight:700}}>+$20/mo per user</span></div>
                <div className="clip-add-fee-row"><span style={{color:'var(--text)'}}>Payment Processing</span><span style={{color:'#dc2626', fontWeight:700}}>+$14.95/mo</span></div>
                <div className="clip-add-fee-row"><span style={{color:'var(--text)'}}>Card Swipe Fee</span><span style={{color:'#dc2626', fontWeight:700}}>+2.85% per transaction</span></div>
              </div>
              <div className="sbp-contrast">
                <div className="sbp-contrast-label">LandscapeBossPro — $129/month, No Add-Ons</div>
                <div className="sbp-contrast-row"><span className="sbp-contrast-row-label">Properties</span><span className="sbp-contrast-row-val">Unlimited</span></div>
                <div className="sbp-contrast-row"><span className="sbp-contrast-row-label">Users / Employees</span><span className="sbp-contrast-row-val">Unlimited, $0 each</span></div>
                <div className="sbp-contrast-row"><span className="sbp-contrast-row-label">All Add-Ons</span><span className="sbp-contrast-row-val">Included</span></div>
              </div>
            </div>
            <div className="highlight-text" style={{flex:1, minWidth:'280px'}}>
              <span className="section-label">No Caps. No Per-User Fees.</span>
              <h2>At the Same Price as CLIP Plus, LandscapeBossPro Has No Caps and 5 Features CLIP Doesn&apos;t Have at Any Price.</h2>
              <p>CLIP Plus is $129.99/month — a penny more than LandscapeBossPro — and it caps you at 400 properties and 2 users. Additional users are $20/month each. Payment processing is a separate add-on.</p>
              <p>LandscapeBossPro is $129/month with unlimited properties, unlimited users, payments included, lasso routing, sq ft waiting list, and chemical compliance logs. CLIP doesn&apos;t have any of those spray-specific features at any price tier.</p>
              <ul className="check-list">
                <li>No property caps — unlimited at $129</li>
                <li>No per-user fees — unlimited employees included</li>
                <li>Lasso circle route selector — CLIP doesn&apos;t have this</li>
                <li>Sq ft waiting list by service type — not in CLIP</li>
                <li>Chemical compliance logs — not in CLIP at any tier</li>
                <li>Two-way SMS included — CLIP doesn&apos;t offer this</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'960px', margin:'0 auto 48px'}}>
          <span className="section-label">Side by Side</span>
          <h2 className="section-title">LandscapeBossPro vs CLIP Lawn Software</h2>
          <p className="section-sub" style={{maxWidth:'720px', marginLeft:'auto', marginRight:'auto'}}>CLIP was designed for lawn maintenance and mowing. LandscapeBossPro was built for spray. Here&apos;s how the features compare.</p>
        </div>
        <div className="compare-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th style={{width:'50%'}}>Feature</th>
                <th className="sbp-col" style={{width:'25%'}}>LandscapeBossPro $129</th>
                <th style={{width:'25%'}}>CLIP (Any Tier)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="feature-name">Property Limit</td><td className="sbp-col"><span className="chk">Unlimited</span></td><td><span className="prt">40 / 400 / Unlimited by tier</span></td></tr>
              <tr><td className="feature-name">Users Included</td><td className="sbp-col"><span className="chk">Unlimited — $0 each</span></td><td><span className="prt">1–4 included; +$20/mo each</span></td></tr>
              <tr><td className="feature-name">Payment Processing Included</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗ $14.95/mo add-on</span></td></tr>
              <tr><td className="feature-name">Sq Ft Waiting List by Service Type</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗ Not available</span></td></tr>
              <tr><td className="feature-name">Lasso Circle Map Route Selector</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗ Not available</span></td></tr>
              <tr><td className="feature-name">Chemical Compliance Logs</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗ Not available</span></td></tr>
              <tr><td className="feature-name">Two-Way SMS Inbox</td><td className="sbp-col"><span className="chk">✓ Included</span></td><td><span className="crs">✗ Not available</span></td></tr>
              <tr><td className="feature-name">Automated SMS Alerts</td><td className="sbp-col"><span className="chk">✓ 10+ alerts</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Recurring Treatment Waiting List</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="crs">✗</span></td></tr>
              <tr><td className="feature-name">Estimates &amp; Online Acceptance</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Scheduling &amp; Dispatch</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="chk">✓</span></td></tr>
              <tr><td className="feature-name">Package Plans &amp; Renewals</td><td className="sbp-col"><span className="chk">✓</span></td><td><span className="prt">Limited</span></td></tr>
              <tr><td className="feature-name">All-In Monthly Price</td><td className="sbp-col" style={{color:'var(--orange)', fontWeight:800}}>$129/mo flat</td><td style={{color:'var(--muted)'}}>$65–$197 + add-ons</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <div className="premium-band">
        <h2>At the Same Price as CLIP Plus, LandscapeBossPro Has No Caps and<span>5 Features CLIP Doesn&apos;t Have at Any Price.</span></h2>
        <p>CLIP Plus is $129.99/month. LandscapeBossPro is $129/month with unlimited properties, unlimited users, lasso routing, sq ft waiting list, chemical logs, and two-way SMS — none of which exist in CLIP. You pay less and get more, built specifically for spray businesses.</p>
      </div>

      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto 56px'}}>
          <span className="section-label">Why It Matters</span>
          <h2 className="section-title">CLIP Was Built for Mowing. LandscapeBossPro Was Built for Spray.</h2>
          <p className="section-sub" style={{maxWidth:'720px'}}>CLIP has been around since the 1990s as a lawn maintenance platform. It&apos;s reliable for mowing schedules and simple invoicing. But spray businesses need more — sq ft tracking, chemical compliance, recurring treatment waiting lists — and CLIP doesn&apos;t provide any of that.</p>
        </div>
        <div className="simple-grid">
          <div className="simple-card"><div className="simple-num">01</div><h3>No Property Caps — Ever</h3><p>CLIP Basic caps you at 40 properties. CLIP Plus goes to 400. LandscapeBossPro has no property caps at any price — unlimited from day one. As your spray routes grow, your software grows with you. No upgrade required to add more clients.</p></div>
          <div className="simple-card"><div className="simple-num">02</div><h3>Unlimited Users at $129</h3><p>CLIP charges $20/month for each additional user beyond what&apos;s included in your tier. If you have 3 trucks and 3 technicians, that&apos;s $40–$60/month in extra user fees on top of your plan price. LandscapeBossPro includes unlimited users — zero per-user fees, no matter how many technicians you add.</p></div>
          <div className="simple-card"><div className="simple-num">03</div><h3>5 Features CLIP Doesn&apos;t Have</h3><p>Lasso circle route selector, sq ft waiting list by service type, chemical compliance logs, two-way SMS inbox, automated SMS alerts — none of these exist in CLIP at any price. They&apos;re built into LandscapeBossPro because they&apos;re how spray businesses actually operate.</p></div>
          <div className="simple-card"><div className="simple-num">04</div><h3>14-Day Free Trial — No Card Required</h3><p>LandscapeBossPro has a 14-day free trial with full access to every feature. No credit card required. Explore the lasso routing, set up your waiting list, try the chemical logs — and decide if it&apos;s the right fit before paying anything. CLIP offers a demo but no self-serve free trial.</p></div>
        </div>
      </section>

      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Pricing</span>
          <h2 className="section-title">Everything Included — No Caps</h2>
          <p className="section-sub">$129/month flat. Unlimited properties, unlimited users, no add-on fees, 5 features CLIP doesn&apos;t have.</p>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="price-card featured" style={{width:'100%'}}>
            <div className="featured-badge">Everything Included — No Caps</div>
            <div className="price-tier">One Plan. Flat Price. Unlimited Scale.</div>
            <div className="price-amount"><sup>$</sup>129</div>
            <div className="price-period">per month — cancel anytime</div>
            <ul className="price-features">
              <li>Unlimited Properties — No Cap</li>
              <li>Unlimited Employees &amp; Users — $0 Each</li>
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
        <h2>Done Hitting Property Caps and Paying Per User?<span>LandscapeBossPro Is $129. Unlimited. Start Today.</span></h2>
        <p>No property caps. No per-user fees. 5 spray-specific features CLIP doesn&apos;t have at any price. Start your free trial now.</p>
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
