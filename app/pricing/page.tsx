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
      if (secs <= 0) { clearInterval(iv); window.location.href = 'https://my.landscapebosspro.com/dashboard.html' + (typeof signInData!=='undefined'&&signInData&&signInData.session?'#access_token='+encodeURIComponent(signInData.session.access_token)+'&refresh_token='+encodeURIComponent(signInData.session.refresh_token):''); }
      else cd.textContent = `Redirecting in ${secs} second${secs === 1 ? '' : 's'}…`;
    }, 1000);
  } catch(e: any) {
    sbpShowErr(err, e.message || 'Something went wrong. Please try again.');
    btn.disabled = false; btn.textContent = 'Create My Account';
  }
}

function sbpShowErr(el: HTMLElement, msg: string) { el.textContent = msg; el.style.display = 'block'; }

const tableRows = [
  ['Line-Item Estimates & Bids', 'Build detailed bids with labor and material line items, email and track them'],
  ['Materials & Products Tracking', 'Track mulch, sod, plants, stone, and hardscape materials per project'],
  ['Job & Project Scheduling', 'Schedule installs and projects, assign crews, view the day at a glance'],
  ['Job Board', 'See every active project, its stage, and what crew is on it'],
  ['Crew Dispatch & Routing', 'Build routes, assign crews, and dispatch the day in a few clicks'],
  ['Live Route Map', 'Interactive map with all job sites pinned — drag to reorder'],
  ['Invoices & Payments', 'Stripe card-on-file billing, payment history, partial payments'],
  ['Recurring Maintenance Plans', 'Set up recurring landscape maintenance visits with auto-billing'],
  ['Two-Way SMS Inbox', 'Send and receive texts with customers inside the app'],
  ['Automated SMS Alerts (10+ types)', 'Project scheduled, completed, estimate sent, review request, and more'],
  ['Estimate Follow-Up Sequence', "3 automated texts if a client doesn't respond to a bid"],
  ['Payment Follow-Up Sequence', '3 automated texts for unpaid invoices'],
  ['Client & Lead Management', 'Full CRM for existing customers and open prospects'],
  ['Property Profiles', 'Project history, materials used, notes, sq ft, GPS per address'],
  ['Mobile App for Crews', 'Field-optimized job list, mark complete, log materials and hours'],
  ['Role-Based Access', 'Owner, Manager, Office, Crew Lead, Mobile — granular permissions'],
  ['Equipment & Truck Management', 'Assign vehicles to crews and routes, track by truck'],
  ['Employee Hour Tracking', 'Hours per job, payroll-ready reports'],
  ['Google Review Requests', 'Auto-sent after every completed project'],
  ['Dashboard & Reports', 'Revenue, jobs, money owed, properties served — at a glance'],
  ['Discount Codes & Sales Tax', 'Percentage or flat discounts, auto tax calculation per invoice'],
  ['Unlimited Users', 'Add every employee at no per-user cost'],
  ['Unlimited Clients & Properties', 'No caps — 50 accounts or 5,000, same price'],
  ['500 SMS/month', 'Outbound SMS included; +$15 per additional 500 after that'],
];

const faqs = [
  { q: 'Is there really just one plan?', a: "$129/month, everything included. We don't believe in tiers that lock you out of features you need to run your business. You get the full platform from day one." },
  { q: 'What happens after the 14-day free trial?', a: "You'll be prompted to enter a card and continue for $129/month. If you decide not to continue, your account simply stops — no charges, no cancellation fees. We don't auto-charge without you knowing it's coming." },
  { q: 'Do I need a credit card to start the trial?', a: 'No. Create your account and get full access for 14 days with no card required. You only enter payment info if you decide to keep going after the trial.' },
  { q: 'How many users can I add?', a: 'Unlimited. Add every tech, office staff member, and manager at no extra cost. No per-user fees. Ever.' },
  { q: "What's the SMS pricing?", a: '500 outbound SMS messages per month are included in your $129. If you go over, you can add blocks of 500 for $15 each. Most businesses with under 300 active properties never hit the 500 limit.' },
  { q: 'Are there any contracts or annual commitments?', a: 'None. Month to month, always. Cancel anytime from your account settings.' },
  { q: 'Does this work for installs and recurring maintenance?', a: 'Yes. LandscapeBossPro was built for landscaping businesses — design-build, hardscape, planting, sod installs, and recurring landscape maintenance, or any combination. Line-item estimates, materials tracking, and crew dispatch work the same way regardless of the project.' },
  { q: 'What if I have questions or need help getting set up?', a: "We're a small team and we respond fast. Reach us anytime at Support@bossprohq.com. We've run crews ourselves — we know what setup actually looks like and we're here to help." },
];

export default function Pricing() {
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
        <div className="hero-badge">Simple, Honest Pricing</div>
        <h1>$129/Month.<br /><span>Everything Included.</span></h1>
        <p>One flat price covers your entire operation — unlimited users, unlimited clients, every feature. No tiers, no add-ons, no surprises.</p>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:'14px',marginBottom:'40px'}}>14-day free trial · No credit card required · Cancel anytime</p>
        <div className="hero-btns">
          <button className="btn-primary" onClick={(e) => openSignupModal(1, e.currentTarget as HTMLElement)}>Start Your 14-Day Free Trial</button>
        </div>
      </div>

      {/* PRICE CARD */}
      <section>
        <div style={{background:'#fff',border:'3px solid var(--orange)',borderRadius:'20px',padding:'52px 48px',maxWidth:'620px',margin:'0 auto',position:'relative',boxShadow:'0 0 0 6px rgba(27,110,59,.1), 0 24px 80px rgba(8,20,13,.12)'}}>
          <div style={{position:'absolute',top:'-16px',left:'50%',transform:'translateX(-50%)',background:'var(--orange)',color:'#fff',fontSize:'12px',fontWeight:700,letterSpacing:'1px',textTransform:'uppercase',padding:'5px 20px',borderRadius:'20px',whiteSpace:'nowrap'}}>One Plan — No Surprises</div>
          <div style={{fontSize:'13px',fontWeight:700,color:'var(--muted)',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}>LandscapeBossPro</div>
          <div style={{fontSize:'72px',fontWeight:800,color:'var(--text)',lineHeight:1}}><sup style={{fontSize:'30px',verticalAlign:'super'}}>$</sup>129</div>
          <div style={{color:'var(--muted)',fontSize:'15px',marginBottom:'8px',marginTop:'6px'}}>per month</div>
          <div style={{fontSize:'16px',color:'var(--text)',fontWeight:600,marginBottom:'32px'}}>Your entire landscaping operation. One price.</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px 24px',marginBottom:'36px',textAlign:'left'}}>
            {['Unlimited Users','Unlimited Clients','Unlimited Properties','Unlimited Leads','Job & Project Scheduling','Live Route Map','Job Board','Materials Tracking','Estimates & Invoices','Stripe Payments','Two-Way SMS Inbox','Automated Alerts','Recurring Maintenance Plans','Mobile App for Crews','Crew Dispatch & Routing','Role-Based Access','Equipment & Truck Management','Hour Tracking','Review Requests','Dashboard & Reports'].map((item,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'14px',color:'var(--text)'}}>
                <span style={{color:'var(--orange)',fontWeight:700,flexShrink:0,fontSize:'15px'}}>✓</span>{item}
              </div>
            ))}
          </div>
          <hr style={{border:'none',borderTop:'1.5px solid var(--border)',margin:'28px 0'}} />
          <div style={{background:'var(--light-bg)',border:'1.5px solid var(--border)',borderRadius:'10px',padding:'16px 20px',fontSize:'14px',color:'var(--muted)',marginBottom:'28px',lineHeight:1.6}}>
            <strong style={{color:'var(--text)'}}>500 outbound SMS/month included.</strong> Need more? Add blocks of 500 for <strong style={{color:'var(--text)'}}>$15 each</strong>. Most businesses never exceed the included 500. The SMS credit rolls month to month — you only pay when you actually use it.
          </div>
          <button className="btn-primary" style={{width:'100%',fontSize:'16px',padding:'16px'}} onClick={(e) => openSignupModal(1, e.currentTarget as HTMLElement)}>Start Your 14-Day Free Trial</button>
          <p style={{textAlign:'center',color:'var(--muted)',fontSize:'13px',marginTop:'14px'}}>No credit card required. No contracts. Cancel anytime.</p>
        </div>
      </section>

      {/* PAIN BAND */}
      <div style={{background:'linear-gradient(135deg,#08140d 0%,#15321f 100%)',padding:'80px 40px',textAlign:'center'}}>
        <h2 style={{color:'#fff',fontSize:'clamp(24px,3.5vw,38px)',fontWeight:800,marginBottom:'48px',maxWidth:'700px',marginLeft:'auto',marginRight:'auto'}}>We Were Paying $500–$700/Month for Software<br />That Still Didn&apos;t Do What We Needed.</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'24px',maxWidth:'900px',margin:'0 auto'}}>
          {[
            {old:'$149/user/mo',nw:'$129 flat',desc:'Unlimited users. Add every tech and office staff at no extra cost.'},
            {old:'Locked features',nw:'All features',desc:'No tiers. No "upgrade to access materials tracking." Everything is included.'},
            {old:'Annual contracts',nw:'Month to month',desc:'No contracts. No cancellation fees. Stop whenever you want.'},
            {old:'Generic software',nw:'Built for landscaping',desc:'Line-item estimates, materials tracking, crew dispatch, project workflows. Not adapted from a plumbing app.'},
          ].map((c,i) => (
            <div key={i} style={{background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',padding:'24px 20px'}}>
              <div style={{color:'rgba(255,255,255,.35)',fontSize:'13px',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px',textDecoration:'line-through'}}>{c.old}</div>
              <div style={{color:'var(--orange)',fontSize:'22px',fontWeight:800,marginBottom:'4px'}}>{c.nw}</div>
              <div style={{color:'rgba(255,255,255,.55)',fontSize:'13px'}}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WHAT'S INCLUDED TABLE */}
      <section style={{background:'var(--light-bg)'}}>
        <div style={{textAlign:'center',maxWidth:'900px',margin:'0 auto 48px'}}>
          <span style={{display:'inline-block',color:'var(--orange)',fontSize:'12px',fontWeight:700,letterSpacing:'1.8px',textTransform:'uppercase',marginBottom:'12px'}}>Everything Included</span>
          <h2 style={{fontSize:'clamp(26px,4vw,40px)',fontWeight:800,lineHeight:1.2,marginBottom:'16px',color:'var(--text)'}}>Every Feature. One Price.</h2>
          <p style={{color:'var(--muted)',fontSize:'17px',maxWidth:'620px',margin:'0 auto'}}>Here&apos;s exactly what you get for $129/month — nothing hidden, nothing locked behind a higher tier.</p>
        </div>
        <table style={{width:'100%',maxWidth:'900px',margin:'0 auto',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{background:'#08140d',color:'#fff',fontSize:'13px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',padding:'14px 20px',textAlign:'left'}}>Feature</th>
              <th style={{background:'#08140d',color:'rgba(255,255,255,.6)',fontSize:'13px',fontWeight:400,textTransform:'uppercase',letterSpacing:'1px',padding:'14px 20px',textAlign:'left'}}>What it does</th>
              <th style={{background:'#08140d',color:'#fff',fontSize:'13px',fontWeight:700,textTransform:'uppercase',letterSpacing:'1px',padding:'14px 20px',textAlign:'center'}}>Included</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map(([feat, desc], i) => (
              <tr key={i}>
                <td style={{padding:'13px 20px',borderBottom:'1px solid var(--border)',fontSize:'14px',color:'var(--text)',background:i%2===1?'var(--light-bg)':'#fff'}}><strong>{feat}</strong></td>
                <td style={{padding:'13px 20px',borderBottom:'1px solid var(--border)',fontSize:'13px',color:'var(--muted)',background:i%2===1?'var(--light-bg)':'#fff'}}>{desc}</td>
                <td style={{padding:'13px 20px',borderBottom:'1px solid var(--border)',textAlign:'center',color:'var(--orange)',fontWeight:700,fontSize:'18px',background:i%2===1?'var(--light-bg)':'#fff'}}>✓</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FAQ */}
      <section>
        <div style={{textAlign:'center',maxWidth:'780px',margin:'0 auto 48px'}}>
          <span style={{display:'inline-block',color:'var(--orange)',fontSize:'12px',fontWeight:700,letterSpacing:'1.8px',textTransform:'uppercase',marginBottom:'12px'}}>FAQ</span>
          <h2 style={{fontSize:'clamp(26px,4vw,40px)',fontWeight:800,lineHeight:1.2,color:'var(--text)'}}>Common Questions</h2>
        </div>
        <div style={{maxWidth:'780px',margin:'0 auto'}}>
          {faqs.map((f,i) => (
            <div key={i} style={{borderBottom:i<faqs.length-1?'1.5px solid var(--border)':'none',padding:'24px 0'}}>
              <div style={{fontSize:'17px',fontWeight:700,color:'var(--text)',marginBottom:'10px'}}>{f.q}</div>
              <div style={{fontSize:'15px',color:'var(--muted)',lineHeight:1.7}}>
                {f.q.includes('help getting set up') ? (
                  <>We&apos;re a small team and we respond fast. Reach us anytime at <a href="mailto:Support@bossprohq.com" style={{color:'var(--orange)'}}>Support@bossprohq.com</a>. We&apos;ve run crews ourselves — we know what setup actually looks like and we&apos;re here to help.</>
                ) : f.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-band">
        <h2>Start Free. No Card. No Commitment.</h2>
        <p>14 days of full access — every feature, unlimited everything. See if LandscapeBossPro fits your operation before you spend a dollar.</p>
        <div className="hero-btns">
          <button className="btn-primary" style={{fontSize:'17px',padding:'18px 44px'}} onClick={(e) => openSignupModal(2, e.currentTarget as HTMLElement)}>Start Your 14-Day Free Trial</button>
        </div>
      </div>

      {/* BACKDROP */}
      <div id="sbp-backdrop" onClick={closeAllModals} style={{display:'none',position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,.55)',zIndex:99997}}></div>

      {/* FORM 1 */}
      <div id="sbp-form-1" style={{display:'none',position:'fixed',zIndex:99999,width:'420px',maxWidth:'calc(100vw - 24px)',background:'#fff',borderRadius:'14px',border:'3px solid #1b6e3b',boxShadow:'0 0 0 4px rgba(27,110,59,.35), 0 16px 60px rgba(0,0,0,.45)',maxHeight:'calc(100vh - 40px)',overflowY:'auto'}}>
        <div style={{background:'linear-gradient(135deg,#08140d,#15321f)',padding:'28px 28px 22px',position:'relative'}}>
          <div style={{color:'#fff',fontSize:'20px',fontWeight:800,paddingRight:'36px'}}>Start Your 14-Day Free Trial</div>
          <div style={{color:'rgba(255,255,255,.6)',fontSize:'13px',marginTop:'5px'}}>No credit card required · Full access · $129/mo after your 14-day trial</div>
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
          <button onClick={() => sbpStep2(1)} style={{width:'100%',background:'#1b6e3b',color:'#fff',border:'none',borderRadius:'6px',padding:'13px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Next: Create Password →</button>
        </div>
        <div id="sbp1-step2" style={{padding:'24px 28px',display:'none'}}>
          <div id="sbp1-err2" style={{background:'#fff0f0',border:'1px solid #f5c6c6',color:'#c0392b',borderRadius:'6px',padding:'10px 12px',fontSize:'13px',marginBottom:'14px',display:'none'}}></div>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'6px',padding:'10px 14px',marginBottom:'16px'}}><div style={{fontSize:'12px',color:'#16a34a',fontWeight:700}}>14-Day Free Trial — No Credit Card Required</div><div style={{fontSize:'12px',color:'#555',marginTop:'2px'}}>Full access to every feature. $129/month after trial.</div></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Login Email</label><input id="sbp1-login-email" type="email" readOnly style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',background:'#f8f8f8',color:'#333'}} /></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Password</label><input id="sbp1-password" type="password" placeholder="At least 8 characters" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Confirm Password</label><input id="sbp1-confirm" type="password" placeholder="Repeat password" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'18px',display:'flex',alignItems:'flex-start',gap:'10px'}}>
            <input type="checkbox" id="sbp1-agree" style={{width:'16px',height:'16px',accentColor:'#1b6e3b',cursor:'pointer',flexShrink:0,marginTop:'3px'}} />
            <label htmlFor="sbp1-agree" style={{fontSize:'13px',color:'#555',cursor:'pointer',lineHeight:1.5}}>I agree to the <a href="https://landscapebosspro.com/terms" target="_blank" rel="noreferrer" style={{color:'#1b6e3b'}}>Terms of Service</a> and <a href="https://landscapebosspro.com/privacy-policy" target="_blank" rel="noreferrer" style={{color:'#1b6e3b'}}>Privacy Policy</a></label>
          </div>
          <button id="sbp1-create-btn" onClick={() => sbpCreateAccount(1)} style={{width:'100%',background:'#1b6e3b',color:'#fff',border:'none',borderRadius:'6px',padding:'13px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Create My Account</button>
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
      <div id="sbp-form-2" style={{display:'none',position:'fixed',zIndex:99999,width:'420px',maxWidth:'calc(100vw - 24px)',background:'#fff',borderRadius:'14px',border:'3px solid #1b6e3b',boxShadow:'0 0 0 4px rgba(27,110,59,.35), 0 16px 60px rgba(0,0,0,.45)',maxHeight:'calc(100vh - 40px)',overflowY:'auto'}}>
        <div style={{background:'linear-gradient(135deg,#08140d,#15321f)',padding:'28px 28px 22px',position:'relative'}}>
          <div style={{color:'#fff',fontSize:'20px',fontWeight:800,paddingRight:'36px'}}>Start Your 14-Day Free Trial</div>
          <div style={{color:'rgba(255,255,255,.6)',fontSize:'13px',marginTop:'5px'}}>No credit card required · Full access · $129/mo after your 14-day trial</div>
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
          <button onClick={() => sbpStep2(2)} style={{width:'100%',background:'#1b6e3b',color:'#fff',border:'none',borderRadius:'6px',padding:'13px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Next: Create Password →</button>
        </div>
        <div id="sbp2-step2" style={{padding:'24px 28px',display:'none'}}>
          <div id="sbp2-err2" style={{background:'#fff0f0',border:'1px solid #f5c6c6',color:'#c0392b',borderRadius:'6px',padding:'10px 12px',fontSize:'13px',marginBottom:'14px',display:'none'}}></div>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'6px',padding:'10px 14px',marginBottom:'16px'}}><div style={{fontSize:'12px',color:'#16a34a',fontWeight:700}}>14-Day Free Trial — No Credit Card Required</div><div style={{fontSize:'12px',color:'#555',marginTop:'2px'}}>Full access to every feature. $129/month after trial.</div></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Login Email</label><input id="sbp2-login-email" type="email" readOnly style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',background:'#f8f8f8',color:'#333'}} /></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Password</label><input id="sbp2-password" type="password" placeholder="At least 8 characters" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'14px'}}><label style={{fontSize:'11px',fontWeight:700,color:'#555',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'5px'}}>Confirm Password</label><input id="sbp2-confirm" type="password" placeholder="Repeat password" style={{width:'100%',border:'1px solid #ddd',borderRadius:'6px',padding:'10px 12px',fontSize:'14px',fontFamily:'inherit',color:'#333'}} /></div>
          <div style={{marginBottom:'18px',display:'flex',alignItems:'flex-start',gap:'10px'}}>
            <input type="checkbox" id="sbp2-agree" style={{width:'16px',height:'16px',accentColor:'#1b6e3b',cursor:'pointer',flexShrink:0,marginTop:'3px'}} />
            <label htmlFor="sbp2-agree" style={{fontSize:'13px',color:'#555',cursor:'pointer',lineHeight:1.5}}>I agree to the <a href="https://landscapebosspro.com/terms" target="_blank" rel="noreferrer" style={{color:'#1b6e3b'}}>Terms of Service</a> and <a href="https://landscapebosspro.com/privacy-policy" target="_blank" rel="noreferrer" style={{color:'#1b6e3b'}}>Privacy Policy</a></label>
          </div>
          <button id="sbp2-create-btn" onClick={() => sbpCreateAccount(2)} style={{width:'100%',background:'#1b6e3b',color:'#fff',border:'none',borderRadius:'6px',padding:'13px',fontSize:'15px',fontWeight:700,cursor:'pointer',fontFamily:'inherit'}}>Create My Account</button>
          <button onClick={() => sbpBackToStep1(2)} style={{width:'100%',background:'none',border:'none',color:'#888',fontSize:'13px',cursor:'pointer',marginTop:'10px',padding:'6px',fontFamily:'inherit',textDecoration:'underline'}}>← Back</button>
        </div>
        <div id="sbp2-success" style={{padding:'48px 28px',textAlign:'center',display:'none'}}>
          <div style={{width:'64px',height:'64px',background:'#16a34a',borderRadius:'50%',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:'30px',color:'#fff',marginBottom:'16px'}}>✓</div>
          <div style={{fontSize:'22px',fontWeight:800,color:'#1a1a2e',marginBottom:'10px'}}>You&apos;re In!</div>
          <div style={{fontSize:'15px',color:'#555',lineHeight:1.6,marginBottom:'6px'}}>Your 14-day free trial has started.<br />Taking you to your dashboard…</div>
          <div id="sbp2-countdown" style={{fontSize:'12px',color:'#aaa',marginTop:'10px'}}></div>
        </div>
      </div>
    </>
  );
}
