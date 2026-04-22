"use client";
import { useState } from "react";

export default function AcquirePage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --green:#00ff6a; --green-dim:rgba(0,255,106,0.35); --green-muted:rgba(0,255,106,0.08);
          --bg:#050f08; --surface:#0a1a0f; --surface2:#0d1f13; --border:rgba(0,255,106,0.12);
          --text:#b8d4be; --text-dim:#5a7a62;
          --font-mono:'Share Tech Mono',monospace; --font-display:'Syne',sans-serif;
        }
        html,body { background:var(--bg); color:var(--text); font-family:var(--font-mono); min-height:100vh; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .wrap { max-width:720px; margin:0 auto; padding:40px 24px 80px; }
        .topbar { display:flex; justify-content:space-between; align-items:center; padding-bottom:24px; border-bottom:1px solid var(--border); margin-bottom:48px; }
        .wordmark { font-family:var(--font-display); font-weight:800; font-size:15px; letter-spacing:-0.01em; text-decoration:none; }
        .wm-post { color:var(--text-dim); }
        .wm-q { color:var(--green); }
        .wm-ize { color:#fff; }
        .back-link { font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dim); text-decoration:none; transition:color 0.2s; }
        .back-link:hover { color:var(--green); }
        .hero { margin-bottom:40px; }
        .hero-tag { font-size:9px; letter-spacing:0.3em; text-transform:uppercase; color:var(--green); margin-bottom:12px; display:flex; align-items:center; gap:8px; }
        .hero-tag::before { content:''; width:20px; height:1px; background:var(--green); display:block; }
        .hero-title { font-family:var(--font-display); font-size:clamp(26px,5vw,42px); font-weight:800; color:#fff; line-height:1.1; margin-bottom:16px; }
        .hero-title span { color:var(--green); }
        .hero-sub { font-size:12px; color:var(--text-dim); line-height:1.8; max-width:560px; }
        .stat-row { display:flex; gap:1px; background:var(--border); margin-bottom:20px; }
        .stat-cell { background:var(--surface); padding:16px 20px; flex:1; }
        .stat-val { font-family:var(--font-display); font-size:20px; font-weight:800; color:var(--green); margin-bottom:4px; }
        .stat-lbl { font-size:9px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dim); }
        .section { border:1px solid var(--border); background:var(--surface); margin-bottom:20px; }
        .section-head { padding:14px 20px; border-bottom:1px solid var(--border); background:var(--surface2); }
        .section-head-label { font-size:9px; letter-spacing:0.25em; text-transform:uppercase; color:var(--text-dim); }
        .section-body { padding:20px; }
        .asset-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--border); }
        .asset-cell { background:var(--surface); padding:14px 16px; }
        .asset-cell-icon { font-size:16px; margin-bottom:6px; }
        .asset-cell-name { font-size:11px; color:#fff; margin-bottom:3px; }
        .asset-cell-desc { font-size:10px; color:var(--text-dim); line-height:1.6; }
        .form-wrap { display:flex; flex-direction:column; gap:14px; }
        .form-row { display:flex; flex-direction:column; gap:6px; }
        .form-label { font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dim); }
        .form-input { background:var(--surface2); border:1px solid var(--border); color:var(--text); font-family:var(--font-mono); font-size:11px; padding:10px 12px; outline:none; transition:border-color 0.2s; width:100%; }
        .form-input:focus { border-color:var(--green-dim); }
        .form-input::placeholder { color:var(--text-dim); }
        textarea.form-input { resize:vertical; min-height:100px; }
        .form-submit { background:var(--green-muted); border:1px solid var(--green-dim); color:var(--green); font-family:var(--font-mono); font-size:11px; letter-spacing:0.2em; text-transform:uppercase; padding:14px 24px; cursor:pointer; transition:all 0.2s; margin-top:4px; }
        .form-submit:hover { background:rgba(0,255,106,0.15); }
        .form-note { font-size:10px; color:var(--text-dim); line-height:1.7; }
        .success-box { border:1px solid var(--green-dim); background:var(--green-muted); padding:20px; text-align:center; }
        .success-box p { font-size:12px; color:var(--green); line-height:1.8; }
        .footer { margin-top:48px; padding-top:18px; border-top:1px solid var(--border); font-size:10px; color:var(--text-dim); }
      `}</style>
      <div className="wrap">
        <div className="topbar">
          <a href="/" className="wordmark" style={{textDecoration:"none"}}>
            <span className="wm-post">post</span>
            <span className="wm-q">quantum</span>
            <span className="wm-ize">ize</span>
          </a>
          <a href="/" className="back-link">← Back to site</a>
        </div>
        <div className="hero">
          <div className="hero-tag">Acquisition Enquiry</div>
          <h1 className="hero-title">postquantumize<span>.com</span><br/>is available for acquisition.</h1>
          <p className="hero-sub">A fully operational Post-Quantum vulnerability checker for crypto wallets. Live product, real users, growing relevance as the quantum threat to crypto accelerates. Launched March 31, 2026 — same day as the Google Quantum AI paper that compressed the timeline for Q-day.</p>
        </div>
        <div className="stat-row">
          <div className="stat-cell">
            <div className="stat-val">Mar 31</div>
            <div className="stat-lbl">Launch date</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">4</div>
            <div className="stat-lbl">Chains supported</div>
          </div>
          <div className="stat-cell">
            <div className="stat-val">2029</div>
            <div className="stat-lbl">Google PQC deadline</div>
          </div>
        </div>
        <div className="section">
          <div className="section-head"><div className="section-head-label">// What is included in the acquisition</div></div>
          <div className="asset-grid">
            <div className="asset-cell">
              <div className="asset-cell-icon">🌐</div>
              <div className="asset-cell-name">Domain</div>
              <div className="asset-cell-desc">postquantumize.com — premium domain with direct keyword relevance to post-quantum cryptography.</div>
            </div>
            <div className="asset-cell">
              <div className="asset-cell-icon">⚡</div>
              <div className="asset-cell-name">Live Product</div>
              <div className="asset-cell-desc">Fully operational Next.js app on Vercel. ETH, BTC, SOL, all L2 chains. ENS and .sol name resolution.</div>
            </div>
            <div className="asset-cell">
              <div className="asset-cell-icon">💻</div>
              <div className="asset-cell-name">Full Codebase</div>
              <div className="asset-cell-desc">Complete GitHub repository. Next.js 16, Vercel, Supabase, Etherscan V2, Helius, mempool.space.</div>
            </div>
            <div className="asset-cell">
              <div className="asset-cell-icon">📊</div>
              <div className="asset-cell-name">Analytics Data</div>
              <div className="asset-cell-desc">Supabase database with scan analytics. Chain breakdown, exposure rates, risk level distribution.</div>
            </div>
            <div className="asset-cell">
              <div className="asset-cell-icon">🔑</div>
              <div className="asset-cell-name">API Keys</div>
              <div className="asset-cell-desc">All configured API keys and environment variables. Etherscan V2, Helius, Supabase. Ready to run.</div>
            </div>
            <div className="asset-cell">
              <div className="asset-cell-icon">🏷</div>
              <div className="asset-cell-name">Brand Assets</div>
              <div className="asset-cell-desc">Logo, OG image, X banner, all visual assets. Full brand identity for postquantumize.com.</div>
            </div>
          </div>
        </div>
        <div className="section">
          <div className="section-head"><div className="section-head-label">// Why acquire this now</div></div>
          <div className="section-body">
            <p className="form-note" style={{marginBottom:"12px"}}>The quantum threat to crypto is no longer theoretical. Google set a 2029 internal deadline to migrate its own systems to Post-Quantum cryptography. Ethereum has a live 4-fork PQ roadmap. An estimated 6.9 million BTC sit in wallets with exposed public keys.</p>
            <p className="form-note" style={{marginBottom:"12px"}}>postquantumize.com is the only live, free, public tool that checks any crypto wallet address for quantum vulnerability in real time. First mover in a category that will only grow in urgency over the next 3 years.</p>
            <p className="form-note">The product is built. The infrastructure is running. The domain is owned. The only thing needed is the right owner to scale it.</p>
          </div>
        </div>
        <div className="section">
          <div className="section-head"><div className="section-head-label">// Submit acquisition enquiry</div></div>
          <div className="section-body">
            <AcquireForm />
          </div>
        </div>
        <div className="footer">
          postquantumize.com · Built by <a href="https://twitter.com/james_base_eth" target="_blank" rel="noreferrer" style={{color:"var(--green-dim)"}}>@james_base_eth</a> · Educational only. Not financial advice.
        </div>
      </div>
    </>
  );
}

function AcquireForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:"", company:"", email:"", budget:"", message:"" });

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setLoading(true);
    try {
      await fetch("https://formspree.io/f/xjgjalvv", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          name: form.name,
          company: form.company,
          email: form.email,
          budget: form.budget,
          message: form.message,
          _subject: "postquantumize.com Acquisition Enquiry",
        }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="success-box">
      <p>Enquiry received. We will be in touch at {form.email} within 48 hours.<br/>Thank you for your interest in postquantumize.com.</p>
    </div>
  );

  return (
    <div className="form-wrap">
      <div className="form-row">
        <label className="form-label">Full Name *</label>
        <input className="form-input" placeholder="Your name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
      </div>
      <div className="form-row">
        <label className="form-label">Company / Organisation</label>
        <input className="form-input" placeholder="Company name (optional)" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
      </div>
      <div className="form-row">
        <label className="form-label">Email Address *</label>
        <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
      </div>
      <div className="form-row">
        <label className="form-label">Indicative Budget</label>
        <input className="form-input" placeholder="e.g. $10,000 or open to discussion" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
      </div>
      <div className="form-row">
        <label className="form-label">Message</label>
        <textarea className="form-input" placeholder="Tell us about your intended use case and any questions about the acquisition." value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
      </div>
      <p className="form-note">All enquiries handled directly by @james_base_eth. Responses within 48 hours.</p>
      <button className="form-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? "Sending..." : "Submit Enquiry →"}
      </button>
    </div>
  );
}