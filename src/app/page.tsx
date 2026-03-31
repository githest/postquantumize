"use client";
import { useState } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;700;800&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#020a06; --surface:#050f08; --surface2:#071209;
    --border:#0d2b16; --border2:#133520;
    --green:#00ff6a; --green-dim:#00c44f; --green-muted:#0a4020;
    --red:#ff3b3b; --red-muted:#200808;
    --amber:#ffb800; --amber-muted:#1a1200;
    --blue:#4fc3f7; --purple:#ce93d8;
    --text:#b8d4be; --text-dim:#4a6b52;
    --font-mono:'Share Tech Mono',monospace;
    --font-display:'Syne',sans-serif;
  }
  body { background:var(--bg); color:var(--text); font-family:var(--font-mono); min-height:100vh; overflow-x:hidden; }

  .scanline { pointer-events:none; position:fixed; inset:0; z-index:999; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,106,0.012) 2px,rgba(0,255,106,0.012) 4px); }
  .noise { pointer-events:none; position:fixed; inset:0; opacity:0.025; z-index:998; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }

  .wrapper { max-width:720px; margin:0 auto; padding:48px 24px 80px; }

  /* ── WORDMARK NAV ── */
  .topbar {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:40px; padding-bottom:20px; border-bottom:1px solid var(--border);
    flex-wrap:wrap; gap:10px;
  }
  .wordmark { font-family:var(--font-display); font-weight:700; font-size:18px; letter-spacing:-0.02em; line-height:1; }
  .wm-post  { color:var(--text-dim); }
  .wm-q     { color:var(--green); }
  .wm-ize   { color:#fff; }
  .topbar-right { display:flex; align-items:center; gap:12px; }
  .topbar-tag { font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dim); }
  .live-dot { display:inline-block; width:5px; height:5px; border-radius:50%; background:var(--green); animation:pulse 2s ease-in-out infinite; margin-right:6px; vertical-align:middle; }
  @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,255,106,0.4)} 50%{opacity:.6;box-shadow:0 0 0 5px rgba(0,255,106,0)} }
  .topbar-nav a { font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dim); text-decoration:none; padding:5px 10px; border:1px solid transparent; transition:all 0.2s; }
  .topbar-nav a:hover { color:var(--green); border-color:var(--border); }

  /* ── HEADER ── */
  .site-title { font-family:var(--font-display); font-size:clamp(28px,5.5vw,50px); font-weight:800; color:#fff; line-height:1.05; letter-spacing:-0.02em; margin-bottom:14px; }
  .site-title span { color:var(--green); }
  .site-sub { font-size:12px; color:var(--text-dim); line-height:1.8; max-width:520px; margin-bottom:32px; }

  /* ── ALERT ── */
  .alert { border:1px solid rgba(255,184,0,0.25); background:rgba(255,184,0,0.04); padding:12px 16px; margin-bottom:28px; font-size:11px; color:var(--amber); display:flex; gap:10px; align-items:flex-start; line-height:1.65; }
  .alert a { color:var(--amber); text-decoration:underline; }

  /* ── INPUT ── */
  .input-label { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dim); margin-bottom:8px; display:block; }
  .input-row { display:flex; border:1px solid var(--border); background:var(--surface); transition:border-color 0.2s; }
  .input-row:focus-within { border-color:var(--green-dim); }
  .addr-prefix { padding:13px 12px; font-size:12px; color:var(--text-dim); border-right:1px solid var(--border); white-space:nowrap; user-select:none; }
  .addr-input { flex:1; background:transparent; border:none; outline:none; color:var(--green); font-family:var(--font-mono); font-size:12px; padding:13px 12px; caret-color:var(--green); min-width:0; }
  .addr-input::placeholder { color:var(--text-dim); }
  .chain-sel { background:var(--surface); border:none; border-left:1px solid var(--border); color:var(--text); font-family:var(--font-mono); font-size:11px; padding:0 10px; cursor:pointer; outline:none; }
  .chain-sel option { background:#050f08; }

  .samples { margin-top:8px; display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
  .sample-label { font-size:10px; color:var(--text-dim); }
  .sample-pill { font-size:10px; padding:3px 9px; border:1px solid var(--border); color:var(--text-dim); cursor:pointer; transition:all 0.15s; background:transparent; font-family:var(--font-mono); }
  .sample-pill:hover { border-color:var(--green-dim); color:var(--green); }

  .check-btn { display:block; width:100%; margin-top:10px; padding:13px; background:transparent; border:1px solid var(--green-dim); color:var(--green); font-family:var(--font-mono); font-size:12px; letter-spacing:0.2em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; }
  .check-btn:hover:not(:disabled) { background:var(--green-muted); box-shadow:0 0 20px rgba(0,255,106,0.08); }
  .check-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .check-btn.run::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(0,255,106,0.1),transparent); animation:sweep 1s linear infinite; }
  @keyframes sweep { to{left:100%;} }

  /* ── SCAN PANEL ── */
  .scan-panel { border:1px solid var(--border); background:var(--surface); margin-top:18px; animation:fadeUp 0.3s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .scan-hdr { display:flex; align-items:center; justify-content:space-between; padding:9px 16px; border-bottom:1px solid var(--border); font-size:10px; letter-spacing:0.15em; text-transform:uppercase; }
  .scan-dot { width:5px; height:5px; border-radius:50%; display:inline-block; margin-right:7px; }
  .dot-run { background:var(--green); animation:pulse 1s ease-in-out infinite; }
  .dot-ok  { background:var(--green); }
  .dot-err { background:var(--red); }
  .scan-steps { padding:12px 16px; }
  .step { display:flex; align-items:flex-start; gap:10px; padding:7px 0; border-bottom:1px solid rgba(13,43,22,0.5); font-size:11px; line-height:1.5; }
  .step:last-child { border-bottom:none; padding-bottom:0; }
  .step-ic { width:14px; flex-shrink:0; text-align:center; margin-top:1px; }
  .ic-pending{color:var(--text-dim);} .ic-active{color:var(--amber);animation:blink 0.7s step-end infinite;} .ic-done{color:var(--green);} .ic-error{color:var(--red);}
  @keyframes blink{50%{opacity:0}}
  .step-body { flex:1; }
  .step-lbl { transition:color 0.2s; }
  .lbl-pending{color:var(--text-dim);} .lbl-active{color:var(--amber);} .lbl-done{color:var(--text);} .lbl-error{color:var(--red);}
  .step-det { font-size:10px; color:var(--text-dim); margin-top:2px; }
  .step-det.warn-det { color:#e07700; }
  .step-src { font-size:9px; color:var(--text-dim); white-space:nowrap; }

  /* ── RESULT ── */
  .result { margin-top:18px; animation:fadeUp 0.4s ease; }
  .status-banner { padding:20px 24px; border:1px solid; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .banner-high{border-color:var(--red);background:var(--red-muted);}
  .banner-medium{border-color:var(--amber);background:var(--amber-muted);}
  .banner-low{border-color:var(--green-dim);background:var(--green-muted);}
  .status-tag { font-size:9px; letter-spacing:0.25em; text-transform:uppercase; margin-bottom:5px; }
  .tag-high{color:var(--red);} .tag-medium{color:var(--amber);} .tag-low{color:var(--green);}
  .status-hl { font-family:var(--font-display); font-size:clamp(22px,4vw,36px); font-weight:800; color:#fff; line-height:1.1; }
  .status-sub-t { font-size:11px; color:var(--text-dim); margin-top:5px; }
  .score-block { text-align:right; }
  .score-num { font-family:var(--font-display); font-size:52px; font-weight:800; line-height:1; }
  .sn-high{color:var(--red);} .sn-medium{color:var(--amber);} .sn-low{color:var(--green);}
  .score-of { font-size:16px; font-weight:400; }
  .score-lbl { font-size:9px; color:var(--text-dim); letter-spacing:0.1em; text-transform:uppercase; }

  .meter-wrap { padding:14px 24px; border:1px solid var(--border); border-top:none; background:var(--surface); }
  .meter-labels { display:flex; justify-content:space-between; font-size:9px; color:var(--text-dim); letter-spacing:0.1em; text-transform:uppercase; margin-bottom:6px; }
  .meter-track { height:4px; background:var(--border2); overflow:hidden; }
  .meter-fill { height:100%; transition:width 1.2s cubic-bezier(0.25,1,0.5,1); }
  .meter-src { font-size:9px; color:var(--text-dim); margin-top:8px; text-align:right; }

  .data-grid { display:grid; grid-template-columns:1fr 1fr; gap:1px; background:var(--border); border:1px solid var(--border); border-top:none; }
  .dc { background:var(--surface); padding:13px 18px; }
  .dk { font-size:9px; color:var(--text-dim); letter-spacing:0.18em; text-transform:uppercase; margin-bottom:5px; }
  .dv { font-size:12px; color:var(--text); word-break:break-all; }
  .dv-exposed{color:var(--red);font-weight:bold;} .dv-safe{color:var(--green);} .dv-warn{color:var(--amber);}

  .exp-box { border:1px solid; border-top:none; padding:18px 22px; }
  .exp-exposed{border-color:var(--red);background:var(--red-muted);}
  .exp-safe{border-color:var(--green-dim);background:var(--green-muted);}
  .exp-unknown{border-color:var(--border);background:var(--surface);}
  .exp-title { font-size:9px; letter-spacing:0.22em; text-transform:uppercase; margin-bottom:12px; }
  .et-exposed{color:var(--red);} .et-safe{color:var(--green);} .et-unknown{color:var(--text-dim);}
  .exp-row { display:flex; gap:9px; margin-bottom:8px; font-size:11px; line-height:1.6; }
  .exp-row:last-child{margin-bottom:0;}
  .exp-ico{flex-shrink:0;width:18px;}
  .exp-txt{color:var(--text);}
  .exp-txt strong{color:#fff;} .exp-danger{color:var(--red);} .exp-ok{color:var(--green);} .exp-hl{color:var(--amber);}

  .human-box { border:1px solid var(--border2); border-top:none; background:var(--surface2); padding:18px 22px; }
  .human-title { font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:var(--text-dim); margin-bottom:11px; }
  .human-body { font-size:12px; color:var(--text); line-height:1.85; }
  .human-body strong{color:#fff;}
  .human-src { font-size:9px; color:var(--green-dim); display:block; margin-top:10px; }

  .findings-box { border:1px solid var(--border); border-top:none; padding:16px 22px; background:var(--surface); }
  .findings-title { font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:var(--text-dim); margin-bottom:11px; }
  .finding { display:flex; gap:10px; padding:8px 0; border-bottom:1px solid var(--border); font-size:11px; line-height:1.6; }
  .finding:last-child{border-bottom:none;padding-bottom:0;}
  .f-ico{flex-shrink:0;width:18px;text-align:center;}
  .f-txt{color:var(--text);} .f-txt strong{color:#fff;}

  .cred-bar { border:1px solid var(--border); border-top:none; padding:9px 18px; background:var(--surface); display:flex; gap:18px; flex-wrap:wrap; font-size:9px; color:var(--text-dim); }
  .cred-item { display:flex; align-items:center; gap:5px; }
  .cred-dot { width:4px; height:4px; border-radius:50%; background:var(--green-dim); flex-shrink:0; }

  .actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; }
  .btn-p { flex:1; min-width:140px; padding:12px 16px; background:rgba(0,255,106,0.07); border:1px solid var(--green-dim); color:var(--green); font-family:var(--font-mono); font-size:10px; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
  .btn-p:hover{background:var(--green-muted);}
  .btn-g { flex:1; min-width:140px; padding:12px 16px; background:transparent; border:1px solid var(--border); color:var(--text-dim); font-family:var(--font-mono); font-size:10px; letter-spacing:0.18em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; }
  .btn-g:hover{border-color:var(--text-dim);color:var(--text);}

  .err-box { border:1px solid rgba(255,59,59,0.3); background:var(--red-muted); padding:14px 18px; font-size:12px; color:var(--red); margin-top:16px; animation:fadeUp 0.3s ease; }

  /* ── RESOURCES ── */
  .res-section { border-top:1px solid var(--border); margin-top:56px; padding-top:40px; }
  .res-eyebrow { font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--text-dim); margin-bottom:16px; display:flex; align-items:center; gap:10px; }
  .res-eyebrow::after { content:''; flex:1; height:1px; background:var(--border); }
  .res-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1px; background:var(--border); border:1px solid var(--border); margin-bottom:16px; }
  .res-card { background:var(--surface); padding:16px 18px; display:flex; flex-direction:column; gap:7px; text-decoration:none; transition:background 0.2s; }
  .res-card:hover { background:var(--surface2); }
  .res-tag { font-size:9px; letter-spacing:0.12em; text-transform:uppercase; padding:2px 7px; border:1px solid; display:inline-block; width:fit-content; }
  .res-tag-r{color:var(--purple);border-color:rgba(206,147,216,0.3);}
  .res-tag-a{color:var(--blue);border-color:rgba(79,195,247,0.3);}
  .res-tag-b{color:var(--amber);border-color:rgba(255,184,0,0.3);}
  .res-title { font-family:var(--font-display); font-size:12px; font-weight:700; color:#fff; line-height:1.35; }
  .res-source { font-size:10px; color:var(--text-dim); }
  .res-arrow { font-size:10px; color:var(--green-dim); margin-top:auto; padding-top:6px; }
  .res-viewall { font-family:var(--font-mono); font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--text-dim); text-decoration:none; border:1px solid var(--border); padding:8px 14px; display:inline-block; transition:all 0.2s; }
  .res-viewall:hover { border-color:var(--green-dim); color:var(--green); }

  /* ── FOOTER ── */
  .footer { margin-top:48px; padding-top:18px; border-top:1px solid var(--border); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .footer-brand { font-family:var(--font-display); font-weight:800; font-size:13px; color:var(--green); }
  .footer-note { font-size:10px; color:var(--text-dim); }

  @media(max-width:520px) {
    .data-grid{grid-template-columns:1fr;}
    .status-banner{flex-direction:column;}
    .score-block{text-align:left;}
    .res-grid{grid-template-columns:1fr;}
    .topbar-nav{display:none;}
  }
`;

// ── DATA ──────────────────────────────────────────────────────────────────────
const L2_OPTIONS = [
  { value:"BASE", label:"Base" },
  { value:"ARBITRUM", label:"Arbitrum" },
  { value:"OPTIMISM", label:"Optimism" },
  { value:"POLYGON", label:"Polygon" },
];

const SAMPLES = [
  { label:"ETH (Vitalik)", addr:"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", chain:"ETH" },
  { label:"BTC Genesis",   addr:"1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna",            chain:"BTC" },
  { label:"BTC Taproot",   addr:"bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297", chain:"BTC" },
];

const RESOURCES = [
  { tag:"breaking", tc:"res-tag-b", title:"Post-Quantum Ethereum — Official Roadmap", src:"pq.ethereum.org · 2026", url:"https://pq.ethereum.org/" },
  { tag:"research", tc:"res-tag-r", title:"New Research: ECDLP-256 May Break With Under 500K Qubits", src:"Quantum AI Research · Mar 31, 2026", url:"https://research.google/blog/safeguarding-cryptocurrency-by-disclosing-quantum-vulnerabilities-responsibly/" },
  { tag:"breaking", tc:"res-tag-b", title:"Ethereum Foundation Makes PQ Security Top Priority", src:"The Quantum Insider · Jan 2026", url:"https://thequantuminsider.com/2026/01/26/ethereum-foundation-elevates-post-quantum-security-to-top-strategic-priority/" },
  { tag:"article",  tc:"res-tag-a", title:"Post-Quantum Cryptography: What It Is & Why It Matters", src:"Articsledge · Mar 2026", url:"https://www.articsledge.com/post/post-quantum-cryptography-pqc" },
  { tag:"research", tc:"res-tag-r", title:"NIST Post-Quantum Standards (FIPS 203/204/205)", src:"NIST · August 2024", url:"https://csrc.nist.gov/projects/post-quantum-cryptography" },
  { tag:"research", tc:"res-tag-r", title:"Novel Transition Protocol to Post-Quantum Blockchains", src:"Frontiers in Computer Science · 2025", url:"https://www.frontiersin.org/journals/computer-science/articles/10.3389/fcomp.2025.1457000/full" },
];

// ── RISK MODEL ────────────────────────────────────────────────────────────────
function calcRisk({ chain, addrData, address }: any) {
  const isBTC = chain === "BTC";
  let score = 40;
  let pubKeyExposed: boolean | null = null;
  let firstExposureDate: Date | null = null;
  let addressType = "";
  let findings: any[] = [];
  let humanExplanation = "";

  if (!isBTC) {
    addressType = chain === "L2" ? "EVM / L2" : chain === "SOL" ? "Solana (Ed25519)" : "EVM / Ethereum";
    if (addrData) {
      pubKeyExposed = addrData.outgoingCount > 0;
      if (addrData.firstOutTxTimestamp) firstExposureDate = new Date(addrData.firstOutTxTimestamp * 1000);
      score = 40 + (pubKeyExposed ? 35 : 0) + ((addrData.contractInteractions || 0) > 5 ? 8 : 0) + ((addrData.txCount || 0) > 50 ? 5 : 0);
    }
    const sig = chain === "SOL" ? "Ed25519" : "ECDSA secp256k1";
    humanExplanation = pubKeyExposed === true
      ? `This wallet has made ${addrData?.outgoingCount || "multiple"} outgoing transactions. Each one permanently broadcasts your ${sig} public key to the blockchain. A quantum computer running Shor's algorithm could derive your private key from it. Google's March 2026 research estimates this becomes possible with under 500,000 physical qubits — a 20x reduction from prior estimates. The threat isn't immediate, but migrating funds to a fresh wallet costs nothing and takes minutes.`
      : `This wallet has never sent a transaction, so your ${sig} public key has never been broadcast on-chain. You're in the safer group. The moment you send any transaction, your public key is permanently recorded. Treat this address as receive-only until post-quantum cryptography standards are finalized for your chain.`;
    findings = pubKeyExposed === true ? [
      { icon:"🚨", text:`<strong>Public key permanently on-chain.</strong> Present in every outgoing transaction signature. Cannot be removed.` },
      { icon:"⚠️", text:`<strong>${sig} is quantum-vulnerable.</strong> Shor's algorithm can derive a private key from a public key on a sufficiently large quantum computer.` },
      { icon:"⚡", text:"<strong>Google (March 31, 2026):</strong> Under 500,000 physical qubits needed to break ECDLP-256 — a 20x reduction from prior estimates." },
      { icon:"✅", text:"<strong>No immediate threat.</strong> Operational CRQCs at this scale don't exist yet. You have time — but the window may be shorter than expected." },
      { icon:"🔧", text:"<strong>Action:</strong> Generate a fresh wallet (new seed phrase), transfer all assets, and never transact from this address again." },
    ] : [
      { icon:"✅", text:"<strong>Public key not yet exposed.</strong> No outgoing transactions detected." },
      { icon:"⚠️", text:`<strong>${sig} is still the underlying scheme.</strong> The vulnerability exists — it just hasn't been triggered yet.` },
      { icon:"🔒", text:"<strong>Keep this address receive-only.</strong> A single outgoing transaction exposes the key permanently." },
      { icon:"ℹ️", text:"Monitor your chain's post-quantum roadmap. When PQC signature schemes are standardized, migrate proactively." },
    ];
  } else {
    if (address.startsWith("1")) addressType = "Bitcoin P2PKH (Legacy)";
    else if (address.startsWith("3")) addressType = "Bitcoin P2SH (SegWit Wrapped)";
    else if (address.startsWith("bc1q")) addressType = "Bitcoin P2WPKH (Native SegWit)";
    else if (address.startsWith("bc1p")) addressType = "Bitcoin Taproot (P2TR)";
    else addressType = "Bitcoin";
    if (addrData) {
      pubKeyExposed = addrData.pubKeyExposed;
      score = 42 + (pubKeyExposed ? 28 : 0) - (address.startsWith("bc1p") ? 5 : 0);
    }
    humanExplanation = pubKeyExposed === true
      ? `This Bitcoin address has spent funds, revealing your public key in the spending transaction. Google's 2026 research estimates under 500,000 physical qubits could derive your private key. Moving remaining funds to a fresh address that has never spent is your best near-term protection.`
      : `This Bitcoin address has not spent any UTXOs, so your public key remains hidden inside the address hash. Keep this as cold storage and never spend directly from it until post-quantum Bitcoin signature schemes are finalized.`;
    findings = [
      { icon: pubKeyExposed === true ? "🚨" : "✅", text: pubKeyExposed === true ? "<strong>Public key exposed via spending transaction.</strong> Permanently visible on-chain." : "<strong>Public key hidden.</strong> UTXO unspent — key not yet revealed." },
      { icon:"⚠️", text:"<strong>ECDSA secp256k1 underlies all Bitcoin addresses.</strong> Taproot uses Schnorr — also vulnerable to Shor's algorithm." },
      { icon:"ℹ️", text:"<strong>BIP-360</strong> is exploring post-quantum signatures for Bitcoin. No finalized standard yet." },
      { icon:"✅", text:"No immediate threat. Operational CRQCs at the required scale do not yet exist." },
    ];
  }

  score = Math.min(Math.max(score, 10), 95);
  const riskLevel = score >= 70 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW";
  return { score, riskLevel, pubKeyExposed, firstExposureDate, addressType, findings, humanExplanation };
}

// ── STEPS ─────────────────────────────────────────────────────────────────────
const makeSteps = (chain: string) => [
  { id:"init",   label:"Initializing scanner",          src:"postquantumize.com" },
  { id:"format", label:"Detecting address format",      src:"Local parser" },
  { id:"fetch",  label:"Fetching transaction history",  src: chain==="BTC" ? "mempool.space" : chain==="SOL" ? "Helius API" : "Etherscan API" },
  { id:"pubkey", label:"Checking public key exposure",  src:"On-chain analysis" },
  { id:"risk",   label:"Running quantum risk model",    src:"ECDSA / Ed25519 model" },
  { id:"score",  label:"Generating vulnerability report", src:"Google 2026 estimates" },
];

function timeAgo(ts: number) {
  const days = Math.floor((Date.now()/1000 - ts) / 86400);
  const years = Math.floor(days/365);
  if (years > 0) return `${years}yr ago`;
  if (days > 0)  return `${days}d ago`;
  return "today";
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [address, setAddress] = useState("");
  const [chain,   setChain]   = useState("ETH");
  const [l2Chain, setL2Chain] = useState("BASE");
  const [phase,   setPhase]   = useState("idle");
  const [stepSt,  setStepSt]  = useState<Record<string,string>>({});
  const [stepDet, setStepDet] = useState<Record<string,string>>({});
  const [result,  setResult]  = useState<any>(null);
  const [meter,   setMeter]   = useState(0);
  const [apiErr,  setApiErr]  = useState("");

  const setStep = (id: string, st: string, det = "") => {
    setStepSt(s => ({...s,[id]:st}));
    if (det) setStepDet(d => ({...d,[id]:det}));
  };

  async function scan() {
    if (!address.trim()) return;
    const addr = address.trim();
    const steps = makeSteps(chain);
    setPhase("scanning"); setResult(null); setApiErr("");
    setStepSt(Object.fromEntries(steps.map(s => [s.id,"pending"])));
    setStepDet({}); setMeter(0);

    try {
      setStep("init","active"); await delay(350);
      setStep("init","done","Scanner ready");

      setStep("format","active"); await delay(400);
      setStep("format","done",
        chain==="BTC" ? "Bitcoin address detected" :
        chain==="SOL" ? "Solana address detected" :
        chain==="L2"  ? `EVM / ${l2Chain} address detected` :
        "Ethereum address detected"
      );

      setStep("fetch","active",`Querying ${chain==="BTC"?"mempool.space":chain==="SOL"?"Helius":"Etherscan"} API...`);
      const res  = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ address:addr, chain, l2Chain: chain==="L2" ? l2Chain : undefined }),
      });
      const raw: any = await res.json();
      if (!raw.success) throw new Error(raw.error || "API returned failure");

      setStep("fetch","done",`${raw.txCount ?? "?"} txs · ${raw.balance ?? "?"} ${raw.balanceTicker} · ${raw.dataSource}`);

      setStep("pubkey","active"); await delay(400);
      setStep("pubkey","done",
        raw.pubKeyExposed === true  ? "⚠ Public key EXPOSED — found in outgoing transactions" :
        raw.pubKeyExposed === false ? "✓ Public key not yet exposed" :
        "⚠ Exposure unknown — heuristic mode"
      );

      setStep("risk","active"); await delay(450);
      setStep("risk","done","Quantum risk window calculated");

      setStep("score","active"); await delay(350);
      const risk = calcRisk({ chain, addrData:raw, address:addr });
      setStep("score","done",`Index: ${risk.score}/100 · Risk: ${risk.riskLevel}`);

      await delay(200);
      setResult({ ...risk, raw });
      setPhase("result");
      setTimeout(() => setMeter(risk.score), 100);

    } catch (err:any) {
      setApiErr(err.message || "Scan failed");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle"); setResult(null); setStepSt({}); setStepDet({});
    setAddress(""); setApiErr(""); setMeter(0);
  }

  const steps     = makeSteps(chain);
  const isRunning = phase === "scanning";
  const showPanel = phase !== "idle";
  const rl        = result?.riskLevel?.toLowerCase() || "medium";
  const mc        = rl==="high"?"var(--red)":rl==="medium"?"var(--amber)":"var(--green)";
  const stepIcon  = (st:string) => st==="pending"?"·":st==="active"?"▶":st==="done"?"✓":"✕";
  const raw       = result?.raw;

  return (
    <>
      <style>{STYLE}</style>
      <div className="scanline"/><div className="noise"/>
      <div className="wrapper">

        {/* ── TOPBAR ── */}
        <div className="topbar">
          <div className="wordmark">
            <span className="wm-post">post</span>
            <span className="wm-q">quantum</span>
            <span className="wm-ize">ize</span>
          </div>
          <div className="topbar-right">
            <span className="topbar-tag">
              <span className="live-dot"/>live · v1.1
            </span>
            <nav className="topbar-nav">
              <a href="/resources">Resources →</a>
            </nav>
          </div>
        </div>

        {/* ── HEADER ── */}
        <header style={{marginBottom:"28px"}}>
          <h1 className="site-title">Quantum<br/><span>Vulnerability</span><br/>Checker</h1>
          <p className="site-sub">
            Paste any Ethereum, Bitcoin or Solana wallet. We pull live on-chain data server-side to determine if your public key is exposed and calculate a real quantum risk score.
          </p>
        </header>

        {/* ── ALERT ── */}
        <div className="alert">
          <span style={{flexShrink:0}}>⚡</span>
          <span>
            <strong>March 31, 2026:</strong> New research shows ECDLP-256 may break with under 500,000 physical qubits — a 20x reduction from prior estimates. Most crypto wallets use this exact curve.{" "}
            <a href="https://research.google/blog/safeguarding-cryptocurrency-by-disclosing-quantum-vulnerabilities-responsibly/" target="_blank" rel="noreferrer">Read the paper →</a>
          </span>
        </div>

        {/* ── INPUT ── */}
        <div>
          <label className="input-label">Wallet Address</label>
          <div className="input-row">
            <span className="addr-prefix">ADDR://</span>
            <input
              className="addr-input"
              value={address}
              placeholder="0x... or bc1... or 1... or Sol..."
              spellCheck={false}
              disabled={isRunning}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key==="Enter" && !isRunning && scan()}
            />
            <select className="chain-sel" value={chain} disabled={isRunning} onChange={e => setChain(e.target.value)}>
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
              <option value="SOL">SOL</option>
              <option value="L2">EVM / L2</option>
            </select>
            {chain === "L2" && (
              <select className="chain-sel" value={l2Chain} disabled={isRunning} onChange={e => setL2Chain(e.target.value)}>
                {L2_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            )}
          </div>
          <div className="samples">
            <span className="sample-label">Try:</span>
            {SAMPLES.map(s => (
              <button key={s.label} className="sample-pill" disabled={isRunning}
                onClick={() => { reset(); setTimeout(() => { setAddress(s.addr); setChain(s.chain); }, 10); }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button className={`check-btn ${isRunning?"run":""}`} onClick={scan} disabled={isRunning || !address.trim()}>
          {isRunning ? "Scanning Blockchain..." : "Run Quantum Risk Analysis"}
        </button>

        {/* ── SCAN PANEL ── */}
        {showPanel && (
          <div className="scan-panel">
            <div className="scan-hdr">
              <span>
                <span className={`scan-dot ${isRunning?"dot-run":phase==="error"?"dot-err":"dot-ok"}`}/>
                <span style={{color:isRunning?"var(--amber)":phase==="error"?"var(--red)":"var(--green)"}}>
                  {isRunning?"scanning":phase==="error"?"error":"complete"}
                </span>
              </span>
              <span style={{color:"var(--text-dim)",fontSize:"9px"}}>
                {chain==="BTC"?"mempool.space":chain==="SOL"?"Helius":"Etherscan"} · Keys server-side only
              </span>
            </div>
            <div className="scan-steps">
              {steps.map(s => {
                const st  = stepSt[s.id] || "pending";
                const det = stepDet[s.id];
                return (
                  <div key={s.id} className="step">
                    <span className={`step-ic ic-${st}`}>{stepIcon(st)}</span>
                    <div className="step-body">
                      <div className={`step-lbl lbl-${st}`}>{s.label}</div>
                      {det && <div className={`step-det ${det.includes("EXPOSED")?"warn-det":""}`}>{det}</div>}
                    </div>
                    <div className="step-src">{s.src}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {apiErr && <div className="err-box">⚠ {apiErr}</div>}

        {/* ── RESULT ── */}
        {result && raw && (
          <div className="result" id="result-card">

            <div className={`status-banner banner-${rl}`}>
              <div>
                <div className={`status-tag tag-${rl}`}>// Quantum Risk Assessment · Live Data · {raw.dataSource}</div>
                <div className="status-hl">
                  {raw.pubKeyExposed===true?"EXPOSED":raw.pubKeyExposed===false?"NOT YET EXPOSED":"UNKNOWN"}
                </div>
                <div className="status-sub-t">{result.addressType} · {raw.pubKeyExposed?"Public key on-chain":"Public key hidden"}</div>
              </div>
              <div className="score-block">
                <div className={`score-num sn-${rl}`}>{result.score}<span className="score-of">/100</span></div>
                <div className="score-lbl">Vulnerability Index</div>
              </div>
            </div>

            <div className="meter-wrap">
              <div className="meter-labels"><span>Low Risk</span><span>Critical</span></div>
              <div className="meter-track"><div className="meter-fill" style={{width:`${meter}%`,background:mc}}/></div>
              <div className="meter-src">Based on ECDSA/Ed25519 exposure model · CRQC research (March 2026)</div>
            </div>

            <div className="data-grid">
              <div className="dc"><div className="dk">Public Key Status</div>
                <div className={`dv ${raw.pubKeyExposed===true?"dv-exposed":raw.pubKeyExposed===false?"dv-safe":"dv-warn"}`}>
                  {raw.pubKeyExposed===true?"REVEALED":raw.pubKeyExposed===false?"HIDDEN":"UNKNOWN"}
                </div>
              </div>
              <div className="dc"><div className="dk">Total Transactions</div><div className="dv">{raw.txCount??'N/A'}</div></div>
              <div className="dc"><div className="dk">Outgoing / Signing Txs</div>
                <div className={`dv ${(raw.outgoingCount||0)>0?"dv-warn":"dv-safe"}`}>{raw.outgoingCount??'N/A'}</div>
              </div>
              <div className="dc"><div className="dk">Balance</div><div className="dv">{raw.balance??'N/A'} {raw.balanceTicker}</div></div>
              <div className="dc"><div className="dk">Contract / Program Calls</div><div className="dv">{raw.contractInteractions??'N/A'}</div></div>
              <div className="dc"><div className="dk">PQC Implemented</div><div className="dv dv-exposed">NO</div></div>
            </div>

            <div className={`exp-box ${raw.pubKeyExposed===true?"exp-exposed":raw.pubKeyExposed===false?"exp-safe":"exp-unknown"}`}>
              <div className={`exp-title ${raw.pubKeyExposed===true?"et-exposed":raw.pubKeyExposed===false?"et-safe":"et-unknown"}`}>
                First Transaction Exposure Detector
              </div>
              {raw.pubKeyExposed === true ? (
                <>
                  {raw.firstOutTxTimestamp && (
                    <div className="exp-row">
                      <span className="exp-ico">📅</span>
                      <span className="exp-txt">First signing tx: <strong>{new Date(raw.firstOutTxTimestamp*1000).toLocaleDateString()}</strong> <span className="exp-hl">({timeAgo(raw.firstOutTxTimestamp)})</span></span>
                    </div>
                  )}
                  {raw.firstOutTxHash && (
                    <div className="exp-row">
                      <span className="exp-ico">🔗</span>
                      <span className="exp-txt" style={{fontSize:"10px",wordBreak:"break-all",color:"var(--text-dim)"}}>{raw.firstOutTxHash}</span>
                    </div>
                  )}
                  <div className="exp-row">
                    <span className="exp-ico">🔓</span>
                    <span className="exp-txt">Your public key has been <span className="exp-danger">permanently visible on-chain</span> since that transaction. Any future CRQC can use it to derive your private key.</span>
                  </div>
                  <div className="exp-row">
                    <span className="exp-ico">💡</span>
                    <span className="exp-txt"><strong>What to do:</strong> Generate a fresh wallet (new seed phrase), transfer all assets, and never transact from this address again.</span>
                  </div>
                </>
              ) : raw.pubKeyExposed === false ? (
                <>
                  <div className="exp-row">
                    <span className="exp-ico">✅</span>
                    <span className="exp-txt"><strong>No outgoing transactions detected.</strong> Your public key has <span className="exp-ok">never been broadcast</span> to the blockchain.</span>
                  </div>
                  <div className="exp-row">
                    <span className="exp-ico">🔒</span>
                    <span className="exp-txt">Your wallet becomes exposed the moment you send your first transaction. <strong>Treat this as receive-only</strong> until PQC standards are finalized.</span>
                  </div>
                </>
              ) : (
                <div className="exp-row">
                  <span className="exp-ico">ℹ️</span>
                  <span className="exp-txt">Exposure could not be fully determined. Check your chain's explorer, or ensure the relevant API key is configured for full live analysis.</span>
                </div>
              )}
            </div>

            <div className="human-box">
              <div className="human-title">// What this means in plain language</div>
              <div className="human-body">
                {result.humanExplanation}
                <span className="human-src">Source: pq.ethereum.org · CRQC research (March 2026)</span>
              </div>
            </div>

            <div className="findings-box">
              <div className="findings-title">// Technical Findings</div>
              {result.findings.map((f:any,i:number) => (
                <div key={i} className="finding">
                  <span className="f-ico">{f.icon}</span>
                  <span className="f-txt" dangerouslySetInnerHTML={{__html:f.text}}/>
                </div>
              ))}
            </div>

            <div className="cred-bar">
              <div className="cred-item"><div className="cred-dot"/>Live data: {raw.dataSource}</div>
              <div className="cred-item"><div className="cred-dot"/>ECDSA / Ed25519 exposure model</div>
              <div className="cred-item"><div className="cred-dot"/>CRQC research 2026 estimates</div>
              <div className="cred-item"><div className="cred-dot"/>API keys server-side only</div>
            </div>

            <div className="actions">
              <button className="btn-p" onClick={() => {
                const tweet = `Just checked my wallet on postquantumize.com\n\nQuantum Risk Score: ${result.score}/100 — ${result.riskLevel}\nPublic Key: ${raw.pubKeyExposed===true?"EXPOSED":raw.pubKeyExposed===false?"HIDDEN":"UNKNOWN"}\n\nCheck yours → postquantumize.com\n@postquantumize\n#PostQuantum #CryptoSecurity`;
                const encoded = encodeURIComponent(tweet);
                window.open(`https://twitter.com/intent/tweet?text=${encoded}`, '_blank');
              }}>Share on X</button>
              <button className="btn-g" onClick={() => {
                const canvas = document.createElement('canvas');
                canvas.width = 1200; canvas.height = 630;
                const ctx = canvas.getContext('2d')!;

                // background
                ctx.fillStyle = '#020a06';
                ctx.fillRect(0, 0, 1200, 630);

                // grid lines
                ctx.strokeStyle = '#0d2b16';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, 315); ctx.lineTo(1200, 315); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(600, 0); ctx.lineTo(600, 630); ctx.stroke();

                // top accent
                ctx.fillStyle = '#00ff6a';
                ctx.fillRect(0, 0, 1200, 3);

                // risk level color
                const mc = rl === 'high' ? '#ff3b3b' : rl === 'medium' ? '#ffb800' : '#00ff6a';

                // status box
                ctx.strokeStyle = mc;
                ctx.lineWidth = 1;
                ctx.strokeRect(60, 60, 1080, 180);
                ctx.fillStyle = rl === 'high' ? '#200808' : rl === 'medium' ? '#1a1200' : '#0a4020';
                ctx.fillRect(61, 61, 1078, 178);

                // status label
                ctx.fillStyle = mc;
                ctx.font = '500 13px monospace';
                ctx.fillText('// QUANTUM RISK ASSESSMENT · LIVE DATA · ' + (raw.dataSource || '').toUpperCase(), 80, 95);

                // status headline
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 72px Arial';
                ctx.fillText(raw.pubKeyExposed === true ? 'EXPOSED' : raw.pubKeyExposed === false ? 'NOT YET EXPOSED' : 'UNKNOWN', 80, 185);

                // score
                ctx.fillStyle = mc;
                ctx.font = 'bold 96px Arial';
                ctx.textAlign = 'right';
                ctx.fillText(String(result.score), 1100, 185);
                ctx.fillStyle = '#4a6b52';
                ctx.font = '500 22px monospace';
                ctx.fillText('/100', 1140, 185);
                ctx.fillText('VULNERABILITY INDEX', 1140, 210);
                ctx.textAlign = 'left';

                // meter bar bg
                ctx.fillStyle = '#133520';
                ctx.fillRect(60, 270, 1080, 6);
                ctx.fillStyle = mc;
                ctx.fillRect(60, 270, Math.round(1080 * result.score / 100), 6);

                // meter labels
                ctx.fillStyle = '#4a6b52';
                ctx.font = '12px monospace';
                ctx.fillText('LOW RISK', 60, 295);
                ctx.textAlign = 'right';
                ctx.fillText('CRITICAL', 1140, 295);
                ctx.textAlign = 'left';

                // data grid
                const gridItems = [
                  ['PUBLIC KEY STATUS', raw.pubKeyExposed === true ? 'REVEALED' : raw.pubKeyExposed === false ? 'HIDDEN' : 'UNKNOWN'],
                  ['TOTAL TRANSACTIONS', String(raw.txCount ?? 'N/A')],
                  ['OUTGOING TXS', String(raw.outgoingCount ?? 'N/A')],
                  ['BALANCE', `${raw.balance ?? 'N/A'} ${raw.balanceTicker}`],
                  ['ADDRESS TYPE', result.addressType],
                  ['PQC IMPLEMENTED', 'NO'],
                ];
                gridItems.forEach((item, i) => {
                  const col = i % 3;
                  const row = Math.floor(i / 3);
                  const x = 60 + col * 360;
                  const y = 320 + row * 80;
                  ctx.strokeStyle = '#0d2b16';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(x, y, 358, 78);
                  ctx.fillStyle = '#050f08';
                  ctx.fillRect(x + 1, y + 1, 356, 76);
                  ctx.fillStyle = '#4a6b52';
                  ctx.font = '11px monospace';
                  ctx.fillText(item[0], x + 14, y + 24);
                  ctx.fillStyle = item[0] === 'PUBLIC KEY STATUS' && raw.pubKeyExposed === true ? '#ff3b3b' :
                                  item[0] === 'PUBLIC KEY STATUS' && raw.pubKeyExposed === false ? '#00ff6a' :
                                  item[0] === 'PQC IMPLEMENTED' ? '#ff3b3b' : '#b8d4be';
                  ctx.font = 'bold 16px monospace';
                  ctx.fillText(item[1], x + 14, y + 56);
                });

                // footer
                ctx.fillStyle = '#2a4a2e';
                ctx.font = '12px monospace';
                ctx.fillText('postquantumize.com · @postquantumize', 60, 595);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#4a6b52';
                ctx.fillText('ECDSA/Ed25519 exposure model · CRQC research 2026', 1140, 595);
                ctx.textAlign = 'left';

                // bottom accent
                ctx.fillStyle = '#00ff6a';
                ctx.globalAlpha = 0.3;
                ctx.fillRect(0, 627, 1200, 3);
                ctx.globalAlpha = 1;

                // corner dots
                ctx.fillStyle = '#00ff6a';
                ctx.fillRect(0, 0, 5, 5);
                ctx.fillRect(1195, 0, 5, 5);

                const a = document.createElement('a');
                a.href = canvas.toDataURL('image/png');
                a.download = `quantum-risk-${raw.pubKeyExposed === true ? 'exposed' : 'safe'}-postquantumize.png`;
                a.click();
              }}>Save as Image</button>
              <button className="btn-g" onClick={reset}>Check Another</button>
            </div>
          </div>
        )}

        {/* ── RESOURCES ── */}
        <div className="res-section">
          <div className="res-eyebrow">// Post-Quantum Intelligence Hub</div>
          <div className="res-grid">
            {RESOURCES.map((r,i) => (
              <a key={i} href={r.url} target="_blank" rel="noreferrer" className="res-card">
                <span className={`res-tag ${r.tc}`}>{r.tag}</span>
                <div className="res-title">{r.title}</div>
                <div className="res-source">{r.src}</div>
                <div className="res-arrow">Read →</div>
              </a>
            ))}
          </div>
          <a href="/resources" className="res-viewall">View all resources + videos →</a>
        </div>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <span className="footer-brand">postquantumize.com</span>
          <span className="footer-note">
            Built by{" "}
            <a href="https://twitter.com/james_base_eth" target="_blank" rel="noreferrer" style={{color:"var(--green-dim)"}}>@james_base_eth</a>
            {" · "}
            <a href="https://twitter.com/postquantumize" target="_blank" rel="noreferrer" style={{color:"var(--green-dim)"}}>@postquantumize</a>
            {" · "}Educational only. Not financial advice.
          </span>
        </footer>
      </div>
    </>
  );
}