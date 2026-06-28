'use client';
import { useEffect } from 'react';
import Navbar from './components/Navbar';

const SBP_URL  = 'https://knjdbgroiyhvqwrpqzcx.supabase.co';
const SBP_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuamRiZ3JvaXlodnF3cnBxemN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0OTczMDMsImV4cCI6MjA5NTA3MzMwM30.zoExtkem-XZqU86S4yJjA_xOOaS1G0IPU2M9OAAza2g';
let sbpClient: any = null;
let sbpOpenForm = 0;

function getSbpClient() { if (!sbpClient) sbpClient = (window as any).supabase.createClient(SBP_URL, SBP_ANON); return sbpClient; }

function openSignupModal(n: number, btn: HTMLElement) {
  closeAllModals(); sbpOpenForm = n;
  const form = document.getElementById('sbp-form-' + n)!;
  const rect = btn.getBoundingClientRect();
  const formW = Math.min(420, window.innerWidth - 24);
  const centerX = rect.left + rect.width / 2;
  let top = rect.bottom + 12;
  let left = centerX - formW / 2;
  if (top + 460 > window.innerHeight) { top = rect.top - 460 - 12; if (top < 12) top = 12; }
  top = Math.max(12, top);
  left = Math.max(12, Math.min(left, window.innerWidth - formW - 12));
  form.style.top = top + 'px'; form.style.left = left + 'px'; form.style.display = 'block';
  document.getElementById('sbp-backdrop')!.style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closeSignupModal(n: number) { document.getElementById('sbp-form-' + n)!.style.display = 'none'; document.getElementById('sbp-backdrop')!.style.display = 'none'; document.body.style.overflow = ''; sbpOpenForm = 0; }
function closeAllModals() { [1,2,3].forEach(i => { const el = document.getElementById('sbp-form-' + i); if (el) el.style.display = 'none'; }); const bd = document.getElementById('sbp-backdrop'); if (bd) bd.style.display = 'none'; document.body.style.overflow = ''; sbpOpenForm = 0; }
function sbpStep2(n: number) { const err = document.getElementById('sbp' + n + '-err1')!; err.style.display = 'none'; const first = (document.getElementById('sbp' + n + '-first') as HTMLInputElement).value.trim(); const last = (document.getElementById('sbp' + n + '-last') as HTMLInputElement).value.trim(); const comp = (document.getElementById('sbp' + n + '-company') as HTMLInputElement).value.trim(); const email = (document.getElementById('sbp' + n + '-email') as HTMLInputElement).value.trim(); if (!first || !last) return sbpShowErr(err as HTMLElement, 'Please enter your first and last name.'); if (!comp) return sbpShowErr(err as HTMLElement, 'Please enter your company name.'); if (!email || !email.includes('@')) return sbpShowErr(err as HTMLElement, 'Please enter a valid email address.'); (document.getElementById('sbp' + n + '-login-email') as HTMLInputElement).value = email; document.getElementById('sbp' + n + '-step1')!.style.display = 'none'; document.getElementById('sbp' + n + '-step2')!.style.display = 'block'; (document.getElementById('sbp' + n + '-password') as HTMLInputElement).focus(); }
function sbpBackToStep1(n: number) { document.getElementById('sbp' + n + '-step2')!.style.display = 'none'; document.getElementById('sbp' + n + '-step1')!.style.display = 'block'; document.getElementById('sbp' + n + '-err2')!.style.display = 'none'; }
async function sbpCreateAccount(n: number) {
  const err = document.getElementById('sbp' + n + '-err2')!; const btn = document.getElementById('sbp' + n + '-create-btn') as HTMLButtonElement; err.style.display = 'none';
  const email = (document.getElementById('sbp' + n + '-login-email') as HTMLInputElement).value.trim(); const password = (document.getElementById('sbp' + n + '-password') as HTMLInputElement).value; const confirm = (document.getElementById('sbp' + n + '-confirm') as HTMLInputElement).value;
  if (password.length < 8) return sbpShowErr(err as HTMLElement, 'Password must be at least 8 characters.'); if (password !== confirm) return sbpShowErr(err as HTMLElement, 'Passwords do not match.'); if (!(document.getElementById('sbp' + n + '-agree') as HTMLInputElement).checked) return sbpShowErr(err as HTMLElement, 'Please agree to the Terms of Service and Privacy Policy.');
  btn.disabled = true; btn.textContent = 'Creating your account…';
  try {
    const res = await fetch(SBP_URL + '/functions/v1/manage-users', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SBP_ANON, 'apikey': SBP_ANON }, body: JSON.stringify({ action: 'create', email, password }) });
    const result = await res.json(); if (result.error) throw new Error(result.error);
    const sb = getSbpClient(); const { data: signInData, error: signInErr } = await sb.auth.signInWithPassword({ email, password }); if (signInErr) throw new Error(signInErr.message);
    const uid = signInData.user.id; const first = (document.getElementById('sbp' + n + '-first') as HTMLInputElement).value.trim(); const last = (document.getElementById('sbp' + n + '-last') as HTMLInputElement).value.trim(); const comp = (document.getElementById('sbp' + n + '-company') as HTMLInputElement).value.trim();
    await sb.auth.updateUser({ data: { full_name: first + ' ' + last } });
    const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from('user_profiles').upsert({ id: uid, email, role: 'full_access', is_primary_owner: true, tenant_id: null, trial_ends_at: trialEnd, product: 'spraybosspro' }, { onConflict: 'id' });
    await sb.from('company_info').insert({ user_id: uid, company_name: comp, display_name: comp });
    await sb.from('platform_accounts').insert({ user_id: uid, email, plan: 'Monthly Subscription', monthly_amount: 129, trial_ends_at: trialEnd, active: false });
    const reasons = ['Cancel Maintaining Self','Cancel Sold House','Cancel Too Expensive','Cancel Unknown','Dropping Customer','Sold House'].map(nm => ({ name: nm, active: true, user_id: uid }));
    await sb.from('cancellation_reasons').insert(reasons);
    document.getElementById('sbp' + n + '-step2')!.style.display = 'none'; document.getElementById('sbp' + n + '-success')!.style.display = 'block';
    let secs = 4; const cd = document.getElementById('sbp' + n + '-countdown')!; cd.textContent = 'Redirecting in ' + secs + ' seconds…';
    const iv = setInterval(() => { secs--; if (secs <= 0) { clearInterval(iv); window.location.href = 'https://my.spraybosspro.com/dashboard.html'; } else cd.textContent = 'Redirecting in ' + secs + ' second' + (secs === 1 ? '' : 's') + '…'; }, 1000);
  } catch (e: any) { sbpShowErr(err as HTMLElement, e.message || 'Something went wrong. Please try again.'); btn.disabled = false; btn.textContent = 'Create My Account'; }
}
function sbpShowErr(el: HTMLElement, msg: string) { el.textContent = msg; el.style.display = 'block'; }

export default function Home() {
  useEffect(() => {
    // Supabase is loaded once globally via <Script> in app/layout.tsx — no per-page load needed.
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
        :root { --purple-dark:#080010; --purple-mid:#0d0318; --purple-deep:#130520; --orange:#e07820; --orange-dark:#c96a10; --blue:#5bbfff; --text:#1a1a2e; --muted:#555; --light-bg:#f8f7fc; --border:#e4e0f0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: var(--text); background: #fff; line-height: 1.6; }
        .hero { background: linear-gradient(135deg, #080010 0%, #130520 60%, #1e0a35 100%); padding: 100px 40px 80px; text-align: center; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; top: -120px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; border-radius: 50%; background: radial-gradient(circle, rgba(224,120,32,.15) 0%, transparent 70%); pointer-events: none; }
        .hero-badge { display: inline-block; background: rgba(224,120,32,.15); border: 1px solid rgba(224,120,32,.4); color: var(--orange); font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 16px; border-radius: 20px; margin-bottom: 24px; }
        .hero h1 { color: #fff; font-size: clamp(32px, 5vw, 58px); font-weight: 800; line-height: 1.15; max-width: 820px; margin: 0 auto 20px; }
        .hero h1 span { color: var(--orange); }
        .hero p { color: rgba(255,255,255,.75); font-size: clamp(16px, 2vw, 20px); max-width: 620px; margin: 0 auto 40px; }
        .hero-btns { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .btn-primary { background: var(--orange); color: #fff; padding: 16px 36px; border-radius: 6px; font-size: 16px; font-weight: 700; text-decoration: none; transition: background .2s, transform .1s; display: inline-block; cursor: pointer; border: none; }
        .btn-primary:hover { background: var(--orange-dark); transform: translateY(-1px); }
        .btn-secondary { background: transparent; color: #fff; padding: 16px 36px; border-radius: 6px; font-size: 16px; font-weight: 600; text-decoration: none; border: 2px solid rgba(255,255,255,.3); transition: border-color .2s, background .2s; display: inline-block; }
        .btn-secondary:hover { border-color: #fff; background: rgba(255,255,255,.05); }
        .hero-stats { display: flex; justify-content: center; gap: 50px; margin-top: 64px; flex-wrap: wrap; }
        .hero-stat-val { color: var(--orange); font-size: 36px; font-weight: 800; }
        .hero-stat-lbl { color: rgba(255,255,255,.6); font-size: 13px; margin-top: 2px; }
        section { padding: 90px 40px; }
        .section-label { display: inline-block; color: var(--orange); font-size: 12px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; margin-bottom: 12px; }
        .section-title { font-size: clamp(26px, 4vw, 40px); font-weight: 800; line-height: 1.2; margin-bottom: 16px; color: var(--text); }
        .section-sub { color: var(--muted); font-size: 17px; max-width: 600px; margin-bottom: 56px; }
        .centered { text-align: center; }
        .centered .section-sub { margin-left: auto; margin-right: auto; }
        .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; }
        .feature-card { background: #fff; border: 1.5px solid var(--border); border-radius: 12px; padding: 30px 28px; transition: box-shadow .2s, border-color .2s, transform .2s; }
        .feature-card:hover { box-shadow: 0 8px 32px rgba(8,0,16,.1); border-color: var(--orange); transform: translateY(-3px); }
        .feature-icon { font-size: 32px; margin-bottom: 14px; display: block; }
        .feature-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: var(--text); }
        .feature-card p { color: var(--muted); font-size: 14px; line-height: 1.6; }
        .dark-section { background: linear-gradient(135deg, var(--purple-dark) 0%, var(--purple-deep) 100%); color: #fff; }
        .dark-section .section-title { color: #fff; }
        .dark-section .section-sub { color: rgba(255,255,255,.65); }
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
        .mock-dot.green { background: #22c55e; }
        .mock-dot.blue { background: var(--blue); }
        .mock-dot.yellow { background: #e8c000; }
        .mock-label { color: rgba(255,255,255,.85); font-size: 13px; font-weight: 600; }
        .mock-sub { color: rgba(255,255,255,.45); font-size: 11px; margin-top: 1px; }
        .mock-badge { margin-left: auto; background: var(--orange); color: #fff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 10px; flex-shrink: 0; }
        .mock-badge.green-badge { background: #16a34a; }
        .mock-badge.blue-badge { background: #2272c3; }
        .alert-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; max-width: 1100px; margin: 0 auto; }
        .alert-pill { background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); border-radius: 10px; padding: 16px 18px; display: flex; align-items: center; gap: 12px; }
        .alert-pill .ap-icon { font-size: 22px; flex-shrink: 0; }
        .alert-pill .ap-label { color: rgba(255,255,255,.9); font-size: 14px; font-weight: 600; }
        .alert-pill .ap-sub { color: rgba(255,255,255,.45); font-size: 12px; }
        .stats-band { background: var(--orange); padding: 56px 40px; }
        .stats-band-inner { display: flex; justify-content: center; gap: 60px; max-width: 1000px; margin: 0 auto; flex-wrap: wrap; }
        .stat-item { text-align: center; }
        .stat-item .val { font-size: 44px; font-weight: 800; color: #fff; line-height: 1; }
        .stat-item .lbl { color: rgba(255,255,255,.85); font-size: 14px; margin-top: 6px; }
        .pricing-grid { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; max-width: 1000px; margin: 0 auto; }
        .price-card { background: #fff; border: 2px solid var(--border); border-radius: 14px; padding: 36px 32px; width: 280px; position: relative; transition: box-shadow .2s, transform .2s; }
        .price-card:hover { box-shadow: 0 12px 40px rgba(8,0,16,.12); transform: translateY(-4px); }
        .price-card.featured { border-color: var(--orange); background: linear-gradient(180deg, #fff 0%, #fff8f2 100%); }
        .featured-badge { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--orange); color: #fff; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; white-space: nowrap; }
        .price-tier { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .price-amount { font-size: 48px; font-weight: 800; color: var(--text); line-height: 1; }
        .price-amount sup { font-size: 22px; vertical-align: super; }
        .price-period { color: var(--muted); font-size: 13px; margin-bottom: 24px; margin-top: 4px; }
        .price-desc { color: var(--muted); font-size: 14px; margin-bottom: 24px; line-height: 1.5; }
        .price-features { list-style: none; margin-bottom: 32px; }
        .price-features li { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text); padding: 6px 0; border-bottom: 1px solid var(--border); }
        .price-features li:last-child { border-bottom: none; }
        .price-features li::before { content: '✓'; color: var(--orange); font-weight: 700; flex-shrink: 0; }
        .price-btn { display: block; text-align: center; padding: 13px; border-radius: 6px; font-weight: 700; font-size: 15px; text-decoration: none; transition: background .2s; cursor: pointer; border: none; }
        .price-btn-primary { background: var(--orange); color: #fff; }
        .price-btn-primary:hover { background: var(--orange-dark); }
        .price-btn-outline { border: 2px solid var(--orange); color: var(--orange); }
        .price-btn-outline:hover { background: var(--orange); color: #fff; }
        .testimonial-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .testimonial-card { background: #fff; border: 1.5px solid var(--border); border-radius: 12px; padding: 28px 26px; }
        .testimonial-stars { color: var(--orange); font-size: 18px; margin-bottom: 12px; letter-spacing: 2px; }
        .testimonial-body { font-size: 15px; color: var(--muted); line-height: 1.7; margin-bottom: 20px; font-style: italic; }
        .testimonial-author { font-weight: 700; font-size: 14px; color: var(--text); }
        .testimonial-role { font-size: 12px; color: var(--muted); }
        .cta-band { background: linear-gradient(135deg, var(--purple-dark) 0%, #1e0a35 100%); text-align: center; padding: 100px 40px; position: relative; overflow: hidden; }
        .cta-band::before { content: ''; position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%); width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(224,120,32,.12) 0%, transparent 70%); pointer-events: none; }
        .cta-band h2 { color: #fff; font-size: clamp(28px, 4vw, 46px); font-weight: 800; margin-bottom: 16px; }
        .cta-band p { color: rgba(255,255,255,.7); font-size: 18px; margin-bottom: 40px; max-width: 560px; margin-left: auto; margin-right: auto; }
        footer { background: var(--purple-dark); padding: 50px 40px 30px; border-top: 1px solid rgba(255,255,255,.08); }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 32px; padding-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,.08); }
        .footer-brand .leaf { font-size: 28px; display: block; margin-bottom: 4px; }
        .footer-brand .name { color: #fff; font-size: 18px; font-weight: 700; }
        .footer-brand .sub { color: var(--blue); font-size: 12px; }
        .footer-brand p { color: rgba(255,255,255,.5); font-size: 13px; margin-top: 10px; max-width: 220px; line-height: 1.5; }
        .footer-links { color: rgba(255,255,255,.4); font-size: 13px; margin-top: 20px; text-align: center; }
        .footer-links a { color: rgba(255,255,255,.5); text-decoration: none; }
        .footer-links a:hover { color: #fff; }
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
        @media (max-width: 700px) {
          nav { padding: 0 20px; } .nav-links { display: none; }
          section { padding: 60px 20px; } .hero { padding: 70px 20px 60px; }
          .hero-stats { gap: 30px; } .highlight-row, .highlight-row.reverse { flex-direction: column; }
          .stats-band-inner { gap: 36px; } footer { padding: 40px 20px 20px; }
        }
      `}</style>

      <Navbar onTrialClick={(el) => openSignupModal(1, el)} />

      {/* ═══ MOCKUP IMAGE ═══ */}
      <div style={{background:'linear-gradient(135deg,#080010 0%,#130520 60%,#1e0a35 100%)', padding:'80px 40px 0', textAlign:'center'}}>
        <div style={{maxWidth:'1000px', margin:'0 auto'}}>
          <img src="/dashboard-mockup.webp" width={1200} height={800} fetchPriority="high" decoding="async" alt="SprayBossPro spray business software showing the circle-map route builder, waiting list, and mobile app for lawn care and pest control technicians" style={{width:'100%', height:'auto', borderRadius:'16px', boxShadow:'0 32px 80px rgba(0,0,0,.5)', display:'block'}} />
        </div>
      </div>

      {/* ═══ HERO ═══ */}
      <div className="hero" style={{paddingTop:'60px'}}>
        <div className="hero-badge">Built for Lawn Care &amp; Pest Control</div>
        <h1>Run Your Entire Operation<br /><span>From One Dashboard</span></h1>
        <p>SprayBossPro is the all-in-one field management platform built specifically for lawn care and pest control businesses. Schedule jobs, send estimates, collect payments, and keep your team coordinated — all in one place.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(1, e.currentTarget as HTMLElement); }} className="btn-primary">Start Your 14-Day Free Trial</a>
        </div>
        <div className="hero-stats">
          <div><div className="hero-stat-val">100+</div><div className="hero-stat-lbl">Features Built In</div></div>
          <div><div className="hero-stat-val">89</div><div className="hero-stat-lbl">Screens &amp; Tools</div></div>
          <div><div className="hero-stat-val">0</div><div className="hero-stat-lbl">Apps to Install</div></div>
          <div><div className="hero-stat-val">24/7</div><div className="hero-stat-lbl">Access Anywhere</div></div>
        </div>
      </div>

      {/* ═══ PREMIUM BAND ═══ */}
      <div className="premium-band">
        <h2>Affordable Doesn&apos;t Mean Cheap.<br /><span>This Is Enterprise-Level Software.</span></h2>
        <p>We charged less because we&apos;ve been the customer. We know what it feels like to pay $600 a month for software that still doesn&apos;t do what your business actually needs. SprayBossPro does everything the enterprise platforms do — route mapping, chemical compliance, automated SMS, Stripe payments, role-based access, mobile app — built specifically for spray businesses, and priced for the real world. $129 a month isn&apos;t a cheap price. It&apos;s a fair price. The big platforms aren&apos;t charging $500 because they&apos;re better. They&apos;re charging $500 because they can — and because their customers don&apos;t have a better option. Now you do.</p>
        <div className="premium-grid">
          <div className="premium-card"><div className="premium-card-icon">🗺️</div><h4>Enterprise Route Intelligence</h4><p>Live route maps, drag-and-drop stop ordering, and circle-to-schedule map selection — tools that cost thousands per month at other platforms are standard in SprayBossPro at every plan level.</p></div>
          <div className="premium-card"><div className="premium-card-icon">🧪</div><h4>Full Chemical Compliance Engine</h4><p>Pesticide application logs, technician license tracking, weather conditions per application, print-ready compliance reports — built to hold up to any state inspector, at no extra charge.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💬</div><h4>Automated Communication Suite</h4><p>10+ automated SMS alert types, a two-way texting inbox, 3-step estimate follow-up sequences, 3-step payment follow-up sequences — all running without you every single day.</p></div>
          <div className="premium-card"><div className="premium-card-icon">💳</div><h4>Stripe Payment Processing</h4><p>Card-on-file storage, post-service billing, partial payments, automated payment reminders, and full payment history. The same billing infrastructure the big guys use — included in your $129.</p></div>
          <div className="premium-card"><div className="premium-card-icon">👑</div><h4>Role-Based Access Control</h4><p>Owner, Manager, Office, Technician, and Mobile roles — the same granular permission system as platforms charging 5× more per month. Your office staff sees what they need. Your techs see only their stops.</p></div>
          <div className="premium-card"><div className="premium-card-icon">📱</div><h4>Full Mobile App for Field Techs</h4><p>Your technicians manage their stops, log chemicals, mark complete, add notes, and skip stops from their phone — all in a mobile-optimized view purpose-built for someone in a truck.</p></div>
        </div>
      </div>

      {/* ═══ LASSO FEATURE ═══ */}
      <section id="lasso">
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Only in SprayBossPro</span>
            <h2>Circle Any Area on the Map.<br />Instantly Know Everything Inside It.</h2>
            <p>No other lawn care or pest control software has this. On the waiting list map, draw a circle around any geographic area — a neighborhood, a ZIP code, a corridor — and SprayBossPro instantly calculates every detail of what&apos;s inside before you schedule a single stop or mix a single gallon.</p>
            <p style={{marginTop:'12px'}}>This isn&apos;t just a map feature. It&apos;s a business intelligence tool. You can look at a section of your service area and know in seconds whether it&apos;s worth building a route around, how many trucks to send, what to load, and how much chemical to mix. No calls. No guesses. No wasted time.</p>
            <ul className="check-list">
              <li>Total sq ft and linear ft for all properties inside the circle</li>
              <li>Total stop count and total number of services across all types</li>
              <li>Breakdown by service type — Lawn Care 4 · 8, Mosquito · 6, Insect · 5, etc.</li>
              <li>Per-service sq ft totals so you know exactly how much chemical to mix before loading</li>
              <li>Schedule all circled stops at once — they drop straight to the dispatch board with a full route map</li>
              <li>All service types are fully customizable to match exactly how your operation runs</li>
              <li>The system calculates how much to do per day and how many gallons to mix per service</li>
              <li>Know before you load the truck. Know before you mix a gallon. Stop wasting both.</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.45)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'12px'}}>Waiting List Map — Circle Selection</div>
            <div className="lasso-map">
              <div className="lasso-ring"></div>
              <div className="lasso-pins">
                <div className="lpin s"></div><div className="lpin s"></div><div className="lpin u"></div>
                <div className="lpin s"></div><div className="lpin s"></div><div className="lpin u"></div>
                <div className="lpin s"></div><div className="lpin s"></div><div className="lpin s"></div>
                <div className="lpin u"></div><div className="lpin s"></div><div className="lpin s"></div>
              </div>
            </div>
            <div className="stat-grid">
              <div className="stat-cell"><div className="stat-val">14</div><div className="stat-lbl">Stops Selected</div></div>
              <div className="stat-cell"><div className="stat-val">19</div><div className="stat-lbl">Total Services</div></div>
              <div className="stat-cell"><div className="stat-val">118,400</div><div className="stat-lbl">Sq Ft</div></div>
              <div className="stat-cell"><div className="stat-val">4,200</div><div className="stat-lbl">Linear Ft</div></div>
              <div className="stat-cell full"><div className="stat-val">Lawn Care 4 · 8 &nbsp;|&nbsp; Mosquito · 6 &nbsp;|&nbsp; Insect · 5</div><div className="stat-lbl">Breakdown by Service Type</div></div>
            </div>
            <button style={{width:'100%', marginTop:'12px', background:'var(--orange)', color:'#fff', border:'none', borderRadius:'8px', padding:'13px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'inherit'}}>Schedule These 14 Stops →</button>
            <div style={{marginTop:'10px', textAlign:'center', color:'rgba(255,255,255,.35)', fontSize:'11px'}}>Drops to dispatch board with full route map</div>
          </div>
        </div>
      </section>

      {/* ═══ EASIER TO USE ═══ */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Built Different</span>
          <h2 className="section-title">Powerful Doesn&apos;t Have to Mean Complicated.</h2>
          <p className="section-sub">The big enterprise platforms take weeks to learn, months to set up, and require a dedicated person just to manage them. SprayBossPro is designed so any owner or office manager can be running real routes on day one — without training, without a consultant, without an IT department.</p>
        </div>
        <div className="simple-grid">
          <div className="simple-card"><div className="simple-num">01</div><h3>Set Up in One Afternoon</h3><p>Add your service types, import your clients and properties, set up your chemical mixes, and configure your SMS alert templates. Most businesses are scheduling real routes the same day they sign up. No implementation fee. No onboarding consultant. No 6-hour kickoff call.</p></div>
          <div className="simple-card"><div className="simple-num">02</div><h3>One Screen Does Everything</h3><p>The dispatch board shows your waiting list, your scheduled stops, your route map, your day summary, and your chemical needs all in one place. Your crew gets their stops on their phone. You&apos;re not switching between six different apps to run your day.</p></div>
          <div className="simple-card"><div className="simple-num">03</div><h3>Your Techs Learn It in Minutes</h3><p>The mobile tech view is built for people in trucks, not office managers at desks. Big buttons, clear status, one tap to mark complete, log chemicals, skip a stop, or add a note. We&apos;ve had technicians learn the system while sitting in the parking lot before their first stop.</p></div>
          <div className="simple-card"><div className="simple-num">04</div><h3>Automation Runs Without You</h3><p>Set your alert templates once — scheduled, completed, skipped, estimate follow-ups, payment follow-ups, review requests. After that, SprayBossPro handles customer communication automatically on every single job, every single day, without you having to think about it again.</p></div>
        </div>
      </section>

      {/* ═══ FEATURES OVERVIEW ═══ */}
      <section id="features" style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1200px', margin:'0 auto'}}>
          <span className="section-label">Everything You Need</span>
          <h2 className="section-title">Stop Juggling 5 Different Apps</h2>
          <p className="section-sub">SprayBossPro replaces your scheduling app, your billing software, your texting tool, and your route planner — all under one roof.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card"><span className="feature-icon">📋</span><h3>Smart Scheduling</h3><p>SprayBossPro is smart enough to know exactly how much work is waiting. For every service type on your waiting list, it automatically totals the square footage or linear footage so you know precisely how much you can fit in a day before you ever make a single call. No more guessing, no more overbooking — just look at your waiting list, see the ft² or linear ft for each service, and schedule with confidence.</p></div>
          <div className="feature-card"><span className="feature-icon">🗺️</span><h3>Live Route Map</h3><p>See all your stops pinned on an interactive map. Build efficient routes, drag to reorder, and give your drivers a clear path every single day.</p></div>
          <div className="feature-card"><span className="feature-icon">💰</span><h3>Estimates &amp; Invoices</h3><p>Create professional estimates in seconds, email them to clients, and convert accepted estimates directly to invoices. Track every dollar owed.</p></div>
          <div className="feature-card"><span className="feature-icon">💳</span><h3>Stripe Payments</h3><p>Accept credit cards directly through the platform. Store cards on file, charge after service, and track payment history all in one place.</p></div>
          <div className="feature-card"><span className="feature-icon">💬</span><h3>Two-Way SMS</h3><p>Send and receive text messages from customers right inside the app. Full conversation history organized by contact — no more switching to your phone.</p></div>
          <div className="feature-card"><span className="feature-icon">🔔</span><h3>Automated Alerts</h3><p>Auto-text and email customers when a service is scheduled, completed, or rescheduled. Set it once and let SprayBossPro handle the communication.</p></div>
          <div className="feature-card"><span className="feature-icon">👥</span><h3>Client &amp; Lead Management</h3><p>Manage existing clients and active leads side by side. Track estimates, service history, properties, and notes all tied to each contact.</p></div>
          <div className="feature-card"><span className="feature-icon">🏠</span><h3>Property Profiles</h3><p>Every service address gets its own profile with coordinates, notes, service history, and the ability to map it instantly.</p></div>
          <div className="feature-card"><span className="feature-icon">🧪</span><h3>Chemical Tracking</h3><p>Log every chemical application with mix used, area treated, gallons applied, weather, and technician. Generate compliance reports in one click.</p></div>
          <div className="feature-card"><span className="feature-icon">📦</span><h3>Package Plans</h3><p>Create recurring service packages, assign clients, and manage renewals. SprayBossPro reminds you when package renewals are due.</p></div>
          <div className="feature-card"><span className="feature-icon">🚛</span><h3>Team &amp; Truck Management</h3><p>Manage employees, assign trucks, track hours, and control who sees what with role-based access for office staff, technicians, and drivers.</p></div>
          <div className="feature-card"><span className="feature-icon">📊</span><h3>Dashboard &amp; Reports</h3><p>Custom stat cards show today&apos;s revenue, services completed, properties served, money owed, and more — all at a glance the moment you log in.</p></div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" style={{background:'var(--light-bg)'}}>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Simple Pricing</span>
          <h2 className="section-title">We Got Tired of Getting Ripped Off.<br />So We Fixed It.</h2>
          <p className="section-sub">Over the past 20 years we have tried just about every field service software out there — and for 10+ years we were paying $500–$700 a month. Every feature was an add-on. Every user cost more. Every upgrade was another invoice.</p>
          <div style={{background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'36px 40px', maxWidth:'800px', margin:'0 auto 56px', textAlign:'left', borderLeft:'5px solid var(--orange)'}}>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:'1.8', marginBottom:'16px'}}>We were paying <strong>$500 to $700 a month</strong> for software that nickel-and-dimed us at every turn. Want texting? That&apos;s an add-on. Want more users? Pay per user. Want the reporting module? Upgrade your plan. It never ended — and none of those people had ever run a spray route in their life.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:'1.8', marginBottom:'16px'}}>That&apos;s exactly why we built SprayBossPro with one flat price that includes everything. <strong>$129 a month.</strong> No add-ons. No user fees. No locked features. We include it all because that&apos;s how it should have been from day one.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:'1.8'}}>The only reason we charge a small fee for outbound text messages is simple — they cost us money to send. We&apos;re not marking them up to make a profit off you. 500 outbound messages are included every month, and if you go over, it&apos;s just $15 per additional 500. That&apos;s it. No gotchas. No surprises. We&apos;re operators just like you, and we built the pricing we always wished existed.</p>
          </div>
        </div>
        <div style={{maxWidth:'520px', margin:'0 auto'}}>
          <div className="price-card featured" style={{width:'100%'}}>
            <div className="featured-badge">Everything Included</div>
            <div className="price-tier">One Plan. No Surprises.</div>
            <div className="price-amount"><sup>$</sup>129</div>
            <div className="price-period">per month</div>
            <div className="price-desc">Every feature. Unlimited clients, properties, employees, and users. No tiers, no locked features, no per-seat fees.</div>
            <ul className="price-features">
              <li>Unlimited Clients, Properties &amp; Leads</li>
              <li>Unlimited Employees &amp; Users</li>
              <li>Full Scheduling, Dispatch &amp; Route Map</li>
              <li>Smart Maps &amp; Property Mapping</li>
              <li>Estimates, Invoices &amp; Stripe Payments</li>
              <li>Two-Way SMS &amp; Automated Alerts</li>
              <li>Chemical Tracking &amp; Compliance Reports</li>
              <li>Package Plans &amp; Renewals</li>
              <li>Mobile App for Technicians</li>
              <li>500 Outbound SMS/month included</li>
              <li>+$15 per additional 500 SMS after that</li>
            </ul>
            <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(2, e.currentTarget as HTMLElement); }} className="price-btn price-btn-primary">Start Your 14-Day Free Trial</a>
          </div>
        </div>
        <p style={{textAlign:'center', color:'var(--muted)', fontSize:'13px', marginTop:'32px'}}>No contracts. Cancel anytime. No hidden fees — ever.</p>
      </section>

      {/* ═══ SCHEDULING DEEP DIVE ═══ */}
      <section id="scheduling">
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Scheduling</span>
            <h2>From Waiting List to Dispatched in Seconds</h2>
            <p>SprayBossPro gives you a waiting list of everything not yet scheduled, a full dispatch board for scheduled jobs, and a live map so you can build tight, efficient routes every morning.</p>
            <ul className="check-list">
              <li>Waiting list with sq ft totals and service counts per type</li>
              <li>One-click scheduling with date picker and tech assignment</li>
              <li>Drag-and-drop route ordering</li>
              <li>Interactive map showing all stops with stop detail panel</li>
              <li>Filter by employee, date range, or service status</li>
              <li>Summary bar: total stops, revenue, sq ft, jobs completed</li>
              <li>Print dispatch sheets for drivers in the field</li>
              <li>Mark jobs complete, skipped, or rescheduled with one click</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Today&apos;s Route — 12 Stops</div>
            <div className="mock-item">
              <div className="mock-dot green"></div>
              <div><div className="mock-label">123 Oak St — Smith, J.</div><div className="mock-sub">Lawn Care 4 · 8,200 ft²</div></div>
              <div className="mock-badge green-badge">Done</div>
            </div>
            <div className="mock-item">
              <div className="mock-dot green"></div>
              <div><div className="mock-label">456 Elm Ave — Torres, M.</div><div className="mock-sub">Lawn Insect 3 · 12,000 ft²</div></div>
              <div className="mock-badge green-badge">Done</div>
            </div>
            <div className="mock-item" style={{borderColor:'rgba(224,120,32,.5)'}}>
              <div className="mock-dot orange"></div>
              <div><div className="mock-label">789 Pine Rd — Johnson, K.</div><div className="mock-sub">Mosquito 3 · 5,000 ft²</div></div>
              <div className="mock-badge">In Progress</div>
            </div>
            <div className="mock-item">
              <div className="mock-dot blue"></div>
              <div><div className="mock-label">321 Maple Dr — Garcia, L.</div><div className="mock-sub">Flower Beds 4 · 3,400 ft²</div></div>
              <div className="mock-badge blue-badge">Up Next</div>
            </div>
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'6px', padding:'12px 14px'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', paddingBottom:'8px', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                <span style={{color:'rgba(255,255,255,.45)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'.8px'}}>4 Properties · 8 Services</span>
                <span style={{color:'#fff', fontSize:'14px', fontWeight:700}}>$427.00</span>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'7px'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                    <span style={{background:'var(--orange)', color:'#fff', fontSize:'10px', fontWeight:800, padding:'1px 7px', borderRadius:'10px', lineHeight:'16px'}}>4</span>
                    <span style={{color:'rgba(255,255,255,.8)', fontSize:'12px'}}>Lawn Care 4</span>
                  </div>
                  <span style={{color:'var(--orange)', fontSize:'12px', fontWeight:700}}>23,168 ft²</span>
                </div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                    <span style={{background:'var(--orange)', color:'#fff', fontSize:'10px', fontWeight:800, padding:'1px 7px', borderRadius:'10px', lineHeight:'16px'}}>2</span>
                    <span style={{color:'rgba(255,255,255,.8)', fontSize:'12px'}}>Lawn Insect 3</span>
                  </div>
                  <span style={{color:'var(--orange)', fontSize:'12px', fontWeight:700}}>13,289 ft²</span>
                </div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                    <span style={{background:'var(--orange)', color:'#fff', fontSize:'10px', fontWeight:800, padding:'1px 7px', borderRadius:'10px', lineHeight:'16px'}}>1</span>
                    <span style={{color:'rgba(255,255,255,.8)', fontSize:'12px'}}>Flower Beds 4</span>
                  </div>
                  <span style={{color:'var(--orange)', fontSize:'12px', fontWeight:700}}>5,043 ft²</span>
                </div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'7px'}}>
                    <span style={{background:'var(--orange)', color:'#fff', fontSize:'10px', fontWeight:800, padding:'1px 7px', borderRadius:'10px', lineHeight:'16px'}}>1</span>
                    <span style={{color:'rgba(255,255,255,.8)', fontSize:'12px'}}>Mosquito 3</span>
                  </div>
                  <span style={{color:'var(--orange)', fontSize:'12px', fontWeight:700}}>3,200 ft²</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BILLING DEEP DIVE ═══ */}
      <section id="billing" style={{background:'var(--light-bg)'}}>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Billing</span>
            <h2>Get Paid Faster. Chase Less.</h2>
            <p>Build an estimate in minutes, email it directly from the platform, and let clients accept it with a single click. The moment they accept, convert it to an invoice and collect payment — all without leaving SprayBossPro.</p>
            <ul className="check-list">
              <li>Estimate builder with your service catalog and line items</li>
              <li>Email estimates via Resend with custom branded templates</li>
              <li>Client-facing estimate page with Accept / Decline buttons</li>
              <li>Automatic status tracking: Draft → Sent → Accepted → Invoiced</li>
              <li>Invoice management with unpaid, partial, paid, and overdue filters</li>
              <li>Stripe card-on-file for quick payment collection</li>
              <li>Sales tax management by jurisdiction with tax reports</li>
              <li>Discount codes — percentage or fixed dollar amount</li>
              <li>Full payment history with method, date, and reference tracking</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Estimate #0042 — Pending Acceptance</div>
            <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', marginBottom:'10px'}}>
              <div style={{color:'rgba(255,255,255,.6)', fontSize:'12px', marginBottom:'6px'}}>Line Items</div>
              <div style={{display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,.85)', fontSize:'13px', padding:'4px 0', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                <span>Lawn Care 4 (8,200 sq ft)</span><span>$95.00</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,.85)', fontSize:'13px', padding:'4px 0', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                <span>Lawn Insect 3 (8,200 sq ft)</span><span>$75.00</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', color:'rgba(255,255,255,.85)', fontSize:'13px', padding:'4px 0', borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                <span>Mosquito Treatment</span><span>$55.00</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', color:'#fff', fontSize:'14px', fontWeight:700, paddingTop:'8px', marginTop:'4px'}}>
                <span>Total</span><span style={{color:'var(--orange)'}}>$225.00</span>
              </div>
            </div>
            <div style={{display:'flex', gap:'8px', marginTop:'4px'}}>
              <div style={{flex:1, background:'#16a34a', borderRadius:'6px', padding:'10px', textAlign:'center', color:'#fff', fontSize:'13px', fontWeight:700}}>✓ Accept</div>
              <div style={{flex:1, background:'rgba(255,255,255,.08)', borderRadius:'6px', padding:'10px', textAlign:'center', color:'rgba(255,255,255,.5)', fontSize:'13px'}}>✕ Decline</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ALERTS ═══ */}
      <section id="alerts" className="dark-section">
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Automated Alerts</span>
          <h2 className="section-title">Communicate Like a Big Company.<br />Run Like a Small One.</h2>
          <p className="section-sub">Set up automated SMS and email alerts once. SprayBossPro sends them automatically — keeping your customers informed without any extra work from you.</p>
        </div>
        <div className="alert-grid">
          <div className="alert-pill"><span className="ap-icon">📅</span><div><div className="ap-label">Service Scheduled</div><div className="ap-sub">Auto-text when a job is booked</div></div></div>
          <div className="alert-pill"><span className="ap-icon">✅</span><div><div className="ap-label">Service Completed</div><div className="ap-sub">Notify customer when tech finishes</div></div></div>
          <div className="alert-pill"><span className="ap-icon">🔄</span><div><div className="ap-label">Rescheduled Alert</div><div className="ap-sub">Instantly notify on date changes</div></div></div>
          <div className="alert-pill"><span className="ap-icon">⏭️</span><div><div className="ap-label">Service Skipped</div><div className="ap-sub">Let customers know before you skip</div></div></div>
          <div className="alert-pill"><span className="ap-icon">📄</span><div><div className="ap-label">Estimate Sent</div><div className="ap-sub">SMS when estimate hits their inbox</div></div></div>
          <div className="alert-pill"><span className="ap-icon">🔁</span><div><div className="ap-label">Estimate Follow-Ups</div><div className="ap-sub">3 automated follow-ups if not accepted</div></div></div>
          <div className="alert-pill"><span className="ap-icon">🎉</span><div><div className="ap-label">Estimate Accepted</div><div className="ap-sub">Celebrate (and get ready to roll)</div></div></div>
          <div className="alert-pill"><span className="ap-icon">⭐</span><div><div className="ap-label">Review Request</div><div className="ap-sub">Auto-ask for Google reviews after service</div></div></div>
          <div className="alert-pill"><span className="ap-icon">💳</span><div><div className="ap-label">Payment Declined</div><div className="ap-sub">Notify and follow up automatically</div></div></div>
          <div className="alert-pill"><span className="ap-icon">💬</span><div><div className="ap-label">Inbound Text Alert</div><div className="ap-sub">Get notified when a customer texts you</div></div></div>
        </div>
        <p style={{textAlign:'center', color:'rgba(255,255,255,.45)', fontSize:'13px', marginTop:'32px'}}>Toggle SMS and Email independently for each alert type — you&apos;re in full control.</p>
      </section>

      {/* ═══ STATS BAND ═══ */}
      <div className="stats-band">
        <div className="stats-band-inner">
          <div className="stat-item"><div className="val">10+</div><div className="lbl">Automated Alert Types</div></div>
          <div className="stat-item"><div className="val">3</div><div className="lbl">Estimate Follow-Up Sequences</div></div>
          <div className="stat-item"><div className="val">3</div><div className="lbl">Payment Follow-Up Sequences</div></div>
          <div className="stat-item"><div className="val">∞</div><div className="lbl">Custom SMS Templates</div></div>
        </div>
      </div>

      {/* ═══ TEAM / MOBILE ═══ */}
      <section>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Your Team</span>
            <h2>Office, Field, and Mobile — All Connected</h2>
            <p>SprayBossPro isn&apos;t just for the office. Your technicians get a mobile-optimized version built for the truck. Roles control exactly what each person can see and do.</p>
            <ul className="check-list">
              <li>Role-based access: Owner, Manager, Office, Technician, Mobile</li>
              <li>Mobile technicians see their jobs, mark complete, and skip</li>
              <li>Office staff manages scheduling, billing, and messaging</li>
              <li>Employee hour tracking and payroll-ready reports</li>
              <li>Truck management — assign vehicles to services</li>
              <li>Admin controls for adding, deactivating, and managing users</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Team Access Levels</div>
            <div className="mock-item"><span style={{fontSize:'20px'}}>👑</span><div><div className="mock-label">Owner</div><div className="mock-sub">Full access — all features, billing, users</div></div></div>
            <div className="mock-item"><span style={{fontSize:'20px'}}>🏢</span><div><div className="mock-label">Manager</div><div className="mock-sub">Scheduling, clients, estimates, reports</div></div></div>
            <div className="mock-item"><span style={{fontSize:'20px'}}>📋</span><div><div className="mock-label">Office Staff</div><div className="mock-sub">Billing, messaging, client management</div></div></div>
            <div className="mock-item"><span style={{fontSize:'20px'}}>📱</span><div><div className="mock-label">Technician (Mobile)</div><div className="mock-sub">Today&apos;s jobs only — mark complete or skip</div></div></div>
          </div>
        </div>
      </section>

      {/* ═══ CHEMICAL TRACKING ═══ */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row reverse">
          <div className="highlight-text">
            <span className="section-label">Compliance</span>
            <h2>Chemical Tracking Built Right In</h2>
            <p>Every application logged. Every mix recorded. Every technician tracked. SprayBossPro gives you a complete chemical application history you can filter, print, and take to any inspection.</p>
            <ul className="check-list">
              <li>Log product mixes, area treated, and gallons applied per job</li>
              <li>Track weather conditions at time of application</li>
              <li>Filter reports by client, mix, technician, or date range</li>
              <li>Summary cards: total applications, properties, sq ft, gallons</li>
              <li>Full product catalog with mix recipes</li>
              <li>Print-ready chemical reports for compliance</li>
              <li>Area treated types (lawn, shrubs, beds, etc.) tracked separately</li>
            </ul>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Chemical Report — This Month</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px'}}>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}><div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>142</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Applications</div></div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}><div style={{color:'#fff', fontSize:'20px', fontWeight:700}}>87</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Properties</div></div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}><div style={{color:'var(--orange)', fontSize:'20px', fontWeight:700}}>751K</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Sq Ft Treated</div></div>
              <div style={{background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'12px', textAlign:'center'}}><div style={{color:'var(--orange)', fontSize:'20px', fontWeight:700}}>284</div><div style={{color:'rgba(255,255,255,.45)', fontSize:'11px'}}>Gallons Applied</div></div>
            </div>
            <div className="mock-item"><div className="mock-dot green"></div><div><div className="mock-label">Lawn Care Mix A</div><div className="mock-sub">Applied by J. Smith · 6/14/2026</div></div><div className="mock-badge green-badge">12 gal</div></div>
            <div className="mock-item"><div className="mock-dot orange"></div><div><div className="mock-label">Insect Control Mix</div><div className="mock-sub">Applied by M. Torres · 6/14/2026</div></div><div className="mock-badge">8.5 gal</div></div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section>
        <div className="centered" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <span className="section-label">Who We Are</span>
          <h2 className="section-title">Built by an Operator. Owned by an Operator.</h2>
          <p className="section-sub">We&apos;re not a big corporation. We&apos;re not a venture-backed tech startup. We&apos;re a privately owned company built by someone who has been in the field since 2006.</p>
          <div style={{background:'#fff', border:'1.5px solid var(--border)', borderRadius:'14px', padding:'36px 40px', maxWidth:'800px', margin:'0 auto 56px', textAlign:'left', borderLeft:'5px solid var(--orange)'}}>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:'1.8', marginBottom:'16px'}}>We own and operate a spray business. We&apos;ve been in this industry since <strong>2006</strong> — which means when we built SprayBossPro, we didn&apos;t have to guess what operators need. We already knew. We lived it every day.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:'1.8', marginBottom:'16px'}}>We built this software because everything else out there was built by people who have never driven a spray truck, never managed a waiting list of hundreds or thousands of properties, never had to chase down a payment while also trying to dispatch a full crew. They build features they <em>think</em> you need. We build features we <em>know</em> you need.</p>
            <p style={{fontSize:'17px', color:'var(--text)', lineHeight:'1.8'}}>SprayBossPro is <strong>privately owned</strong> — no corporate board, no outside investors, no decisions made by people who have never touched a sprayer. When you call or message us, you&apos;re talking to the owner. That&apos;s the way we like it, and that&apos;s never going to change.</p>
          </div>
        </div>
        <div className="testimonial-grid" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-body">&ldquo;Before SprayBossPro I was using 3 different apps and still falling through the cracks on follow-ups. Now everything is in one place and my close rate on estimates is way up because the follow-up texts go out automatically.&rdquo;</p>
            <div className="testimonial-author">Lawn Care Owner</div>
            <div className="testimonial-role">Nashville, TN</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-body">&ldquo;The chemical tracking alone is worth it. I used to keep a spreadsheet and it was always behind. Now every application is logged right when the job is done and I can pull a report for any inspector in 30 seconds.&rdquo;</p>
            <div className="testimonial-author">Pest Control Operator</div>
            <div className="testimonial-role">Phoenix, AZ</div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-body">&ldquo;The route map changed how I schedule. I can look at where all my jobs are, drag them into order, and cut drive time in half. My guys are doing more stops per day with less fuel.&rdquo;</p>
            <div className="testimonial-author">Spray Tech Business Owner</div>
            <div className="testimonial-role">Charlotte, NC</div>
          </div>
        </div>
      </section>

      {/* ═══ TECH ═══ */}
      <section style={{background:'var(--light-bg)'}}>
        <div className="highlight-row">
          <div className="highlight-text">
            <span className="section-label">Built on Modern Technology</span>
            <h2>Fast. Reliable. No Delays.</h2>
            <p>SprayBossPro runs on the latest and greatest infrastructure available today. That means your texts and emails go out in seconds — not hours. No queues backing up, no alerts firing late, no wondering if your customer got the message. Everything happens in real time, the way it&apos;s supposed to.</p>
            <p style={{marginTop:'12px'}}>We built on a modern stack specifically to eliminate the performance issues and outages that plague older field service platforms. Less downtime. Fewer bugs. A faster experience every time you log in.</p>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Alert Delivery</div>
            <div className="mock-item"><div className="mock-dot green"></div><div><div className="mock-label">Service Completed SMS</div><div className="mock-sub">Sent to customer · 0.4 seconds</div></div><div className="mock-badge green-badge">Delivered</div></div>
            <div className="mock-item"><div className="mock-dot green"></div><div><div className="mock-label">Estimate Email</div><div className="mock-sub">Sent to customer · 0.9 seconds</div></div><div className="mock-badge green-badge">Delivered</div></div>
            <div className="mock-item"><div className="mock-dot green"></div><div><div className="mock-label">Review Request SMS</div><div className="mock-sub">Sent to customer · 0.6 seconds</div></div><div className="mock-badge green-badge">Delivered</div></div>
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'var(--orange)', fontSize:'22px', fontWeight:800}}>No Hours-Long Delays.</div>
              <div style={{color:'rgba(255,255,255,.55)', fontSize:'13px', marginTop:'4px'}}>Your customers hear from you instantly — every time.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WE ACTUALLY LISTEN ═══ */}
      <section className="dark-section">
        <div className="highlight-row reverse" style={{maxWidth:'1100px', margin:'0 auto'}}>
          <div className="highlight-text">
            <span className="section-label" style={{color:'var(--orange)'}}>We Actually Listen</span>
            <h2 style={{color:'#fff'}}>Have an Idea? We&apos;ll Build It.</h2>
            <p style={{color:'rgba(255,255,255,.7)'}}>Most software companies put your feature request in a queue and get back to you six months later — if ever. That&apos;s not us. When you have a suggestion or need something built for your workflow, we listen. We respond. And we build it fast.</p>
            <p style={{color:'rgba(255,255,255,.7)', marginTop:'12px'}}>Custom features for our clients typically ship in 1–2 weeks, not months. SprayBossPro is built by someone who runs a field service business, and we know that when you need something, you need it now — not on the next quarterly release cycle.</p>
            <p style={{color:'rgba(255,255,255,.7)', marginTop:'12px'}}>Our goal is simple: be the best field management software available. And the only way to get there is by building it with our clients — not just for them.</p>
          </div>
          <div className="highlight-visual">
            <div style={{color:'rgba(255,255,255,.5)', fontSize:'11px', textTransform:'uppercase', letterSpacing:'1px', marginBottom:'14px'}}>Feature Request Timeline</div>
            <div className="mock-item"><span style={{fontSize:'20px'}}>💬</span><div><div className="mock-label">You submit a request</div><div className="mock-sub">Tell us what you need and why</div></div><div className="mock-badge blue-badge">Day 1</div></div>
            <div className="mock-item"><span style={{fontSize:'20px'}}>⚡</span><div><div className="mock-label">We start building</div><div className="mock-sub">No committees. No approval queues.</div></div><div className="mock-badge blue-badge">Day 2–3</div></div>
            <div className="mock-item"><span style={{fontSize:'20px'}}>✅</span><div><div className="mock-label">Feature is live</div><div className="mock-sub">In your account, ready to use</div></div><div className="mock-badge green-badge">Week 1–2</div></div>
            <div style={{marginTop:'16px', background:'rgba(255,255,255,.07)', borderRadius:'8px', padding:'14px 16px', textAlign:'center'}}>
              <div style={{color:'var(--orange)', fontSize:'16px', fontWeight:700}}>Not months. Weeks.</div>
              <div style={{color:'rgba(255,255,255,.45)', fontSize:'12px', marginTop:'4px'}}>Your input shapes the software you use every day.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <div className="cta-band">
        <h2>Your Competition Is Already<br />Using Software Like This.</h2>
        <p>Stop running your business out of a notepad and a group text. Get organized, get paid faster, and give your customers an experience that wins referrals.</p>
        <div className="hero-btns">
          <a href="#" onClick={(e) => { e.preventDefault(); openSignupModal(3, e.currentTarget as HTMLElement); }} className="btn-primary" style={{fontSize:'17px', padding:'18px 44px'}}>Start Your 14-Day Free Trial</a>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}
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
            <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px', fontWeight:700, color:'#555', textTransform:'uppercase', letterSpacing:'.5px', display:'block', marginBottom:'5px'}}>Company Name</label><input id={`sbp${n}-company`} type="text" placeholder="Smith Lawn &amp; Spray Co." style={{width:'100%', border:'1px solid #ddd', borderRadius:'6px', padding:'10px 12px', fontSize:'14px', fontFamily:'inherit', color:'#333'}} /></div>
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
