'use client';

import { useEffect, useState } from 'react';

// Slide-in "View Live Demo" invite. Fires ~1.5s after landing, once per visitor.
const DEMO_URL = 'https://my.landscapebosspro.com/demo.html';
const SEEN_KEY = 'sbp_demo_popup_seen';

export default function DemoPopup() {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      /* private mode — just show it */
    }
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const markSeen = () => {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const dismiss = () => {
    markSeen();
    setClosing(true);
    setTimeout(() => setShow(false), 250);
  };

  if (!show) return null;

  return (
    <div
      className={`demopop-overlay${closing ? ' closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="View the live demo"
      onClick={(e) => {
        if (e.target === e.currentTarget) dismiss();
      }}
    >
      <div className="demopop-card">
        <button className="demopop-x" aria-label="Close" onClick={dismiss}>
          &times;
        </button>
        <div className="demopop-eyebrow">No signup &bull; No card</div>
        <div className="demopop-title">See LandscapeBossPro live</div>
        <div className="demopop-sub">
          Jump straight into a fully loaded demo &mdash; real jobs, invoices, and payments.
          Click around, it&apos;s the actual software.
        </div>
        <a className="demopop-btn" href={DEMO_URL} onClick={markSeen}>
          &#9654;&nbsp; View Live Demo
        </a>
        <button className="demopop-skip" onClick={dismiss}>
          Maybe later &mdash; let me look around
        </button>
      </div>
    </div>
  );
}
