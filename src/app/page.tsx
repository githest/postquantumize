"use client";
import { useState } from "react";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #020a06; --surface: #050f08; --surface2: #071209;
    --border: #0d2b16; --border2: #133520;
    --green: #00ff6a; --green-dim: #00c44f; --green-muted: #0a4020;
    --red: #ff3b3b; --red-muted: #200808;
    --amber: #ffb800; --amber-muted: #1a1200;
    --text: #b8d4be; --text-dim: #4a6b52;
    --font-mono: 'Share Tech Mono', monospace;
    --font-display: 'Syne', sans-serif;
  }
  body { background:var(--bg); color:var(--text); font-family:var(--font-mono); min-height:100vh; overflow-x:hidden; }
  .scanline { pointer-events:none; position:fixed; inset:0; z-index:999; background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,106,0.012) 2px,rgba(0,255,106,0.012) 4px); }
  .noise { pointer-events:none; position:fixed; inset:0; opacity:0.025; z-index:998; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
  .wrapper { max-width:720px; margin:0 auto; padding:56px 24px 80px; }

  .live-tag { display:inline-flex; align-items:center; gap:8px; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:var(--green); margin-bottom:20px; }
  .live-dot { width:6px; height:6px; border-radius:50%; background:var(--green); animation:pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,255,106,0.4)} 50%{opacity:.6;box-shadow:0 0 0 6px rgba(0,255,106,0)} }
  .site-title { font-family:var(--font-display); font-size:clamp(28px,5.5vw,50px); font-weight:800; color:#fff; line-height:1.05; letter-spacing:-0.02em; margin-bottom:14px; }
  .site-title span { color:var(--green); }
  .site-sub { font-size:12px; color:var(--text-dim); line-height:1.8; max-width:520px; margin-bottom:32px; }

  .alert { border:1px solid rgba(255,184,0,0.25); background:rgba(255,184,0,0.04); padding:12px 16px; margin-bottom:28px; font-size:11px; color:var(--amber); display:flex; gap:10px; align-items:flex-start; line-height:1.65; }
  .alert a { color:var(--amber); text-decoration:underline; }

  .input-label { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--text-dim); margin-bottom:8px; display:block; }
  .input-row { display:flex; border:1px solid var(--border); background:var(--surface); transition:border-color 0.2s; }
  .input-row:focus-within { border-color:var(--green-dim); }
  .addr-prefix { padding:13px 12px; font-size:12px; color:var(--text-dim); border-right:1px solid var(--border); white-space:nowrap; user-select:none; }
  .addr-input { flex:1; background:transparent; border:none; outline:none; color:var(--green); font-family:var(--font-mono); font-size:12px; padding:13px 12px; caret-color:var(--green); min-width:0; }
  .addr-input::placeholder { color:var(--text-dim); }

  /* CHAIN + L2 selectors */
  .selectors { display:flex; border-left:1px solid var(--border); }
  .chain-sel { background:var(--surface); border:none; border-left:1px solid var(--border); color:var(--text); font-family:var(--font-mono); font-size:11px; padding:0 10px; cursor:pointer; outline:none; }
  .chain-sel:first-child { border-left:none; }
  .chain-sel option { background:#050f08; }

  .samples { margin-top:8px; display:flex; gap:6px; flex-wrap:wrap; align-items:center; }
  .sample-label { font-size:10px; color:var(--text-dim); }
  .sample-pill { font-size:10px; padding:3px 9px; border:1px solid var(--border); color:var(--text-dim); cursor:pointer; transition:all 0.15s; background:transparent; font-family:var(--font-mono); }
  .sample-pill:hover { border-color:var(--green-dim); color:var(--green); }

  .check-btn { display:block; width:100%; margin-top:10px; padding:13px; background:transparent; border:1px solid var(--green-dim); color:var(--green); font-family:var(--font-mono); font-size:12px; letter-spacing:0.2em; text-transform:uppercase; cursor:pointer; transition:all 0.2s; position:relative; overflow:hidden; }
  .check-btn:hover:not(:disabled) { background:var(--green-muted); box-shadow:0 0 20px rgba(0,255,106,0.08); }
  .check-btn:disabled { opacity:0.35; cursor:not-allowed; }
  .check-btn.run::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(0,255,106,0.1),transparent); animation:sweep 1s linear infinite; }
  @keyframes sweep { to { left:100%; } }

  .scan-panel { border:1px solid var(--border); background:var(--surface); margin-top:18px; animation:fadeUp 0.3s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .scan-hdr { display:flex; align-items:center; justify-content:space-between; padding:9px 16px; border-bottom:1px solid var(--border); font-size:10px; letter-spacing:0.15em; text-transform:uppercase; }
  .scan-dot { width:5px; height:5px; border-radius:50%; display:inline-block; margin-right:7px; }
  .dot-run { background:var(--green); animation:pulse 1s ease-in-out infinite; }
  .dot-ok { background:var(--green); }
  .dot-err { background:var(--red); }
  .scan-steps { padding:12px 16px; }
  .step { display:flex; align-items:flex-start; gap:10px; padding:7px 0; border-bottom:1px solid rgba(13,43,22,0.5); font-size:11px; line-height:1.5; }
  .step:last-child { border-bottom:none; padding-bottom:0; }
  .step-ic { width:14px; flex-shrink:0; text-align:center; margin-top:1px; }
  .ic-pending { color:var(--text-dim); }
  .ic-active { color:var(--amber); animation:blink 0.7s step-end infinite; }
  .ic-done { color:var(--green); }
  .ic-error { color:var(--red); }
  @keyframes blink { 50%{opacity:0} }
  .step-body { flex:1; }
  .step-lbl { transition:color 0.2s; }
  .lbl-pending { color:var(--text-dim); } .lbl-active { color:var(--amber); } .lbl-done { color:var(--text); } .lbl-error { color:var(--red); }
  .step-det { font-size:10px; color:var(--text-dim); margin-top:2px; }
  .step-det.warn-det { color:#e07700; }
  .step-src { font-size:9px; color:var(--text-dim); letter-spacing:0.05em; white-space:nowrap; }

  .result { margin-top:18px; animation:fadeUp 0.4s ease; }

  .status-banner { padding:20px 24px; border:1px solid; display:flex; align-items:flex-start; justify-content:space-between; gap:16px; flex-wrap:wrap; }
  .banner-high { border-color:var(--red); background:var(--red-muted); }
  .banner-medium { border-color:var(--amber); background:var(--amber-muted); }
  .banner-low { border-color:var(--green-dim); background:var(--green-muted); }
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
  .exp-ico { flex-shrink:0; width:18px; }
  .exp-txt { color:var(--text); }
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
  .f-ico { flex-shrink:0; width:18px; text-align:center; }
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
  .footer { margin-top:52px; padding-top:18px; border-top:1px solid var(--border); display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; }
  .footer-brand { font-family:var(--font-display); font-weight:800; font-size:13px; color:var(--green); }
  .footer-note { font-size:10px; color:var(--text-dim); }

  @media(max-width:520px) {
    .data-grid{grid-template-columns:1fr;}
    .status-banner{flex-direction:column;}
    .score-block{text-align:left;}
    .selectors{flex-wrap:wrap;}
  }
`;

// ─── CHAIN CONFIG (UI only) ───────────────────────────────────────────────────
const L2_OPTIONS = [
  { value: "BASE",     label: "Base" },
  { value: "ARBITRUM", label: "Arbitrum" },
  { value: "OPTIMISM", label: "Optimism" },
  { value: "POLYGON",  label: "Polygon" },
];

const SAMPLES = [
  { label: "ETH (Vitalik)", addr: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", chain: "ETH", l2: "" },
  { label: "BTC Genesis",   addr: "1A1zP1eP5QGefi2DMPTfTL5SLmv7Divfna",            chain: "BTC", l2: "" },
  { label: "BTC Taproot",   addr: "bc1p5d7rjq7g6rdk2yhzks9smlaqtedr4dekq08ge8ztwac72sfr9rusxg3297", chain: "BTC", l2: "" },
];

// ─── RISK MODEL ───────────────────────────────────────────────────────────────
function calcRisk(data: any) {
  const { chain, pubKeyExposed, txCount, outgoingCount, contractInteractions, chainName, balance, balanceTicker } = data;

  let score = 40;
  if (pubKeyExposed === true) score += 35;
  if ((contractInteractions || 0) > 5) score += 8;
  if ((txCount || 0) > 50) score += 5;
  if (chain === "SOL") score += 5; // Ed25519 also vulnerable, slightly different profile

  // BTC: slightly different base
  if (chain === "BTC") {
    score = 42 + (pubKeyExposed ? 28 : 0);
    const addr = data.address || "";
    if (addr.startsWith("bc1p")) score -= 5; // Taproot
  }

  score = Math.min(Math.max(score, 10), 95);
  const riskLevel = score >= 70 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW";

  // Address type label
  let addressType = chainName;
  if (chain === "BTC") {
    const addr = data.address || "";
    if (addr.startsWith("1"))    addressType = "Bitcoin P2PKH (Legacy)";
    else if (addr.startsWith("3"))   addressType = "Bitcoin P2SH (SegWit Wrapped)";
    else if (addr.startsWith("bc1q")) addressType = "Bitcoin P2WPKH (Native SegWit)";
    else if (addr.startsWith("bc1p")) addressType = "Bitcoin Taproot (P2TR)";
  } else if (chain === "SOL") {
    addressType = "Solana (Ed25519)";
  }

  // Human explanation
  const sigScheme = chain === "SOL" ? "Ed25519" : "ECDSA secp256k1";
  const humanExplanation = pubKeyExposed === true
    ? `This wallet has made ${outgoingCount || "multiple"} outgoing transactions. Each one permanently broadcasts your ${sigScheme} public key to the blockchain. A quantum computer running Shor's algorithm could derive your private key from that public key and drain your funds. Google's March 2026 research estimates this becomes possible with under 500,000 physical qubits — a 20x reduction from prior estimates. The threat isn't immediate, but migrating to a fresh wallet costs nothing and takes minutes.`
    : pubKeyExposed === false
    ? `This wallet has never sent a transaction, so your public key has never been broadcast on-chain. You're in the safer group — but the moment you send any transaction, your ${sigScheme} public key is permanently recorded. Treat this address as receive-only until post-quantum cryptography standards are finalized for your chain.`
    : `Exposure status could not be fully determined. On Solana, any signed transaction exposes your Ed25519 public key. If this address has ever signed anything, assume the key is exposed. Ed25519 is also vulnerable to Shor's algorithm.`;

  // Findings
  const findings =
    chain === "SOL"
      ? [
          { icon: pubKeyExposed ? "🚨" : "✅", text: pubKeyExposed ? "<strong>Ed25519 public key exposed.</strong> Any Solana transaction exposes your key — including receiving SPL tokens that require account creation." : "<strong>No transactions detected.</strong> Your Ed25519 public key may not yet be exposed." },
          { icon: "⚠️", text: "<strong>Ed25519 is also quantum-vulnerable.</strong> Shor's algorithm can break it the same way it breaks ECDSA. Solana is not post-quantum safe." },
          { icon: "⚡", text: "<strong>Google (March 31, 2026):</strong> Estimates under 500,000 physical qubits to break ECDLP-256. Ed25519 faces a similar threat horizon." },
          { icon: "✅", text: "<strong>No immediate threat.</strong> Operational CRQCs at this scale do not yet exist." },
        ]
      : pubKeyExposed === true
      ? [
          { icon: "🚨", text: "<strong>Public key permanently on-chain.</strong> Present in every outgoing transaction signature. Cannot be removed." },
          { icon: "⚠️", text: `<strong>${sigScheme} is quantum-vulnerable.</strong> Shor's algorithm can derive a private key from a public key on a large enough quantum computer.` },
          { icon: "⚡", text: "<strong>Google (March 31, 2026):</strong> Estimates under 500,000 physical qubits to break ECDLP-256 — a 20x reduction from prior estimates." },
          { icon: "✅", text: "<strong>No immediate threat.</strong> Operational CRQCs at this scale don't exist yet." },
          { icon: "🔧", text: "<strong>Action:</strong> Generate a fresh wallet (new seed phrase), transfer all assets, and never transact from the old address again." },
        ]
      : [
          { icon: "✅", text: "<strong>Public key not yet exposed.</strong> No outgoing transactions detected." },
          { icon: "⚠️", text: `<strong>${sigScheme} is still the underlying scheme.</strong> The vulnerability exists — it just hasn't been triggered yet.` },
          { icon: "🔒", text: "<strong>Keep this address receive-only.</strong> A single outgoing transaction exposes the key permanently." },
          { icon: "ℹ️", text: "Monitor your chain's post-quantum roadmap. When PQC signature schemes are standardized, migrate proactively." },
        ];

  return { score, riskLevel, addressType, findings, humanExplanation };
}

// ─── STEP DEFINITIONS ─────────────────────────────────────────────────────────
const makeSteps = (chain: string, l2: string) => [
  { id: "init",   label: "Initializing scanner",         src: "postquantumize.com" },
  { id: "format", label: "Detecting address format",     src: "Local parser" },
  { id: "fetch",  label: "Fetching transaction history", src: chain === "BTC" ? "Blockchair API" : chain === "SOL" ? "Helius API" : l2 ? `${l2.charAt(0) + l2.slice(1).toLowerCase()}scan API` : "Etherscan API" },
  { id: "pubkey", label: "Checking public key exposure", src: "On-chain analysis" },
  { id: "risk",   label: "Running quantum risk model",   src: "ECDSA / Ed25519 model" },
  { id: "score",  label: "Generating vulnerability report", src: "Google 2026 estimates" },
];

function timeAgo(ts: number) {
  const days  = Math.floor((Date.now() / 1000 - ts) / 86400);
  const years = Math.floor(days / 365);
  if (years > 0) return `${years}yr ago`;
  if (days > 0)  return `${days}d ago`;
  return "today";
}

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function App() {
  const [address,  setAddress]  = useState("");
  const [chain,    setChain]    = useState("ETH");
  const [l2Chain,  setL2Chain]  = useState("BASE");
  const [phase,    setPhase]    = useState("idle");
  const [stepSt,   setStepSt]   = useState<Record<string, string>>({});
  const [stepDet,  setStepDet]  = useState<Record<string, string>>({});
  const [result,   setResult]   = useState<any>(null);
  const [meter,    setMeter]    = useState(0);
  const [apiErr,   setApiErr]   = useState("");

  const setStep = (id: string, st: string, det = "") => {
    setStepSt(s => ({ ...s, [id]: st }));
    if (det) setStepDet(d => ({ ...d, [id]: det }));
  };

  async function scan() {
    if (!address.trim()) return;
    const addr   = address.trim();
    const steps  = makeSteps(chain, l2Chain);

    setPhase("scanning"); setResult(null); setApiErr("");
    setStepSt(Object.fromEntries(steps.map(s => [s.id, "pending"])));
    setStepDet({}); setMeter(0);

    try {
      setStep("init", "active"); await delay(350);
      setStep("init", "done", "Scanner ready");

      setStep("format", "active"); await delay(400);
      setStep("format", "done",
        chain === "BTC" ? "Bitcoin address detected" :
        chain === "SOL" ? "Solana address detected" :
        chain === "L2"  ? `EVM / ${l2Chain} address detected` :
        "Ethereum address detected"
      );

      // Call unified backend API
      setStep("fetch", "active", "Calling /api/scan...");
      const res  = await fetch("/api/scan", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ address: addr, chain, l2Chain: chain === "L2" ? l2Chain : undefined }),
      });
      const raw: any = await res.json();

      if (!raw.success) throw new Error(raw.error || "API returned failure");

      setStep("fetch", "done",
        `${raw.txCount ?? "?"} txs · Balance: ${raw.balance ?? "?"} ${raw.balanceTicker} · Source: ${raw.dataSource}`
      );

      setStep("pubkey", "active"); await delay(400);
      setStep("pubkey",
        raw.pubKeyExposed === true ? "done" : "done",
        raw.pubKeyExposed === true
          ? "⚠ Public key EXPOSED — found in outgoing transactions"
          : raw.pubKeyExposed === false
          ? "✓ Public key not yet exposed"
          : "⚠ Exposure unknown — heuristic mode"
      );

      setStep("risk", "active"); await delay(450);
      setStep("risk", "done", "Quantum risk window calculated");

      setStep("score", "active"); await delay(350);
      const risk = calcRisk({ ...raw, chain });
      setStep("score", "done", `Index: ${risk.score}/100 · Risk: ${risk.riskLevel}`);

      await delay(200);
      setResult({ ...risk, raw });
      setPhase("result");
      setTimeout(() => setMeter(risk.score), 100);

    } catch (err: any) {
      setApiErr(err.message || "Scan failed");
      setPhase("error");
    }
  }

  function reset() {
    setPhase("idle"); setResult(null); setStepSt({}); setStepDet({});
    setAddress(""); setApiErr(""); setMeter(0);
  }

  function loadSample(s: typeof SAMPLES[0]) {
    setAddress(s.addr); setChain(s.chain);
    reset(); setTimeout(() => setAddress(s.addr), 10);
  }

  const steps      = makeSteps(chain, l2Chain);
  const isRunning  = phase === "scanning";
  const showPanel  = phase !== "idle";
  const rl         = result?.riskLevel?.toLowerCase() || "medium";
  const mc         = rl === "high" ? "var(--red)" : rl === "medium" ? "var(--amber)" : "var(--green)";
  const stepIcon   = (st: string) => st==="pending"?"·":st==="active"?"▶":st==="done"?"✓":"✕";
  const raw        = result?.raw;

  return (
    <>
      <style>{STYLE}</style>
      <div className="scanline"/><div className="noise"/>
      <div className="wrapper">

        {/* HEADER */}
        <header style={{marginBottom:"28px"}}>
          <div className="live-tag"><div className="live-dot"/>postquantumize.com · scanner v1.1 · live blockchain data</div>
          <h1 className="site-title">Quantum<br/><span>Vulnerability</span><br/>Checker</h1>
          <p className="site-sub">Paste any wallet address. We pull live on-chain data server-side to determine if your public key is exposed and calculate a real quantum risk score — based on Google's March 2026 CRQC estimates.</p>
        </header>

        {/* ALERT */}
        <div className="alert">
          <span style={{flexShrink:0}}>⚡</span>
          <span><strong>March 31 2026:</strong> Google Quantum AI showed ECDLP-256 may break with under 500,000 physical qubits — a 20x reduction. Most crypto wallets use this exact curve. <a href="https://research.google/blog/safeguarding-cryptocurrency-by-disclosing-quantum-vulnerabilities-responsibly/" target="_blank" rel="noreferrer">Read the paper →</a></span>
        </div>

        {/* INPUT */}
        <div>
          <label className="input-label">Wallet Address</label>
          <div className="input-row">
            <span className="addr-prefix">ADDR://</span>
            <input className="addr-input" value={address} placeholder="0x... or bc1... or 1... or Sol..."
              spellCheck={false} disabled={isRunning}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !isRunning && scan()} />
            <div className="selectors">
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
          </div>

          <div className="samples">
            <span className="sample-label">Try:</span>
            {SAMPLES.map(s => (
              <button key={s.label} className="sample-pill" disabled={isRunning} onClick={() => loadSample(s)}>{s.label}</button>
            ))}
          </div>
        </div>

        <button className={`check-btn ${isRunning ? "run" : ""}`} onClick={scan} disabled={isRunning || !address.trim()}>
          {isRunning ? "Scanning Blockchain..." : "Run Quantum Risk Analysis"}
        </button>

        {/* SCAN PANEL */}
        {showPanel && (
          <div className="scan-panel">
            <div className="scan-hdr">
              <span>
                <span className={`scan-dot ${isRunning?"dot-run":phase==="error"?"dot-err":"dot-ok"}`}/>
                <span style={{color:isRunning?"var(--amber)":phase==="error"?"var(--red)":"var(--green)"}}>
                  {isRunning ? "scanning" : phase === "error" ? "error" : "complete"}
                </span>
              </span>
              <span style={{color:"var(--text-dim)",fontSize:"9px"}}>
                {chain==="BTC"?"Blockchair":chain==="SOL"?"Helius":"Etherscan"} API · Keys server-side only
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
                      {det && <div className={`step-det ${det.includes("EXPOSED") ? "warn-det" : ""}`}>{det}</div>}
                    </div>
                    <div className="step-src">{s.src}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {apiErr && <div className="err-box">⚠ {apiErr}</div>}

        {/* RESULT */}
        {result && raw && (
          <div className="result">

            <div className={`status-banner banner-${rl}`}>
              <div>
                <div className={`status-tag tag-${rl}`}>// Quantum Risk Assessment · Live Data · {raw.dataSource}</div>
                <div className="status-hl">
                  {raw.pubKeyExposed===true ? "EXPOSED" : raw.pubKeyExposed===false ? "NOT YET EXPOSED" : "UNKNOWN"}
                </div>
                <div className="status-sub-t">{result.addressType} · {raw.pubKeyExposed ? "Public key on-chain" : "Public key hidden"}</div>
              </div>
              <div className="score-block">
                <div className={`score-num sn-${rl}`}>{result.score}<span className="score-of">/100</span></div>
                <div className="score-lbl">Vulnerability Index</div>
              </div>
            </div>

            <div className="meter-wrap">
              <div className="meter-labels"><span>Low Risk</span><span>Critical</span></div>
              <div className="meter-track"><div className="meter-fill" style={{width:`${meter}%`,background:mc}}/></div>
              <div className="meter-src">Based on ECDSA/Ed25519 exposure model · Google Quantum AI (March 2026)</div>
            </div>

            <div className="data-grid">
              <div className="dc"><div className="dk">Public Key Status</div>
                <div className={`dv ${raw.pubKeyExposed===true?"dv-exposed":raw.pubKeyExposed===false?"dv-safe":"dv-warn"}`}>
                  {raw.pubKeyExposed===true?"REVEALED":raw.pubKeyExposed===false?"HIDDEN":"UNKNOWN"}
                </div>
              </div>
              <div className="dc"><div className="dk">Total Transactions</div><div className="dv">{raw.txCount ?? "N/A"}</div></div>
              <div className="dc"><div className="dk">Outgoing / Signing Txs</div>
                <div className={`dv ${(raw.outgoingCount||0)>0?"dv-warn":"dv-safe"}`}>{raw.outgoingCount ?? "N/A"}</div>
              </div>
              <div className="dc"><div className="dk">Balance</div>
                <div className="dv">{raw.balance ?? "N/A"} {raw.balanceTicker}</div>
              </div>
              <div className="dc"><div className="dk">Contract / Program Calls</div>
                <div className="dv">{raw.contractInteractions ?? "N/A"}</div>
              </div>
              <div className="dc"><div className="dk">PQC Implemented</div><div className="dv dv-exposed">NO</div></div>
            </div>

            {/* FIRST TX EXPOSURE DETECTOR */}
            <div className={`exp-box ${raw.pubKeyExposed===true?"exp-exposed":raw.pubKeyExposed===false?"exp-safe":"exp-unknown"}`}>
              <div className={`exp-title ${raw.pubKeyExposed===true?"et-exposed":raw.pubKeyExposed===false?"et-safe":"et-unknown"}`}>
                First Transaction Exposure Detector
              </div>
              {raw.pubKeyExposed === true ? (
                <>
                  {raw.firstOutTxTimestamp && (
                    <div className="exp-row">
                      <span className="exp-ico">📅</span>
                      <span className="exp-txt">
                        First signing transaction: <strong>{new Date(raw.firstOutTxTimestamp * 1000).toLocaleDateString()}</strong>
                        <span className="exp-hl"> ({timeAgo(raw.firstOutTxTimestamp)})</span>
                      </span>
                    </div>
                  )}
                  {raw.firstOutTxHash && (
                    <div className="exp-row">
                      <span className="exp-ico">🔗</span>
                      <span className="exp-txt" style={{fontSize:"10px",wordBreak:"break-all"}}>
                        Tx: <span style={{color:"var(--text-dim)"}}>{raw.firstOutTxHash}</span>
                      </span>
                    </div>
                  )}
                  <div className="exp-row">
                    <span className="exp-ico">🔓</span>
                    <span className="exp-txt">Your public key has been <span className="exp-danger">permanently visible on-chain</span> since that transaction. Any future CRQC can use it to derive your private key.</span>
                  </div>
                  <div className="exp-row">
                    <span className="exp-ico">💡</span>
                    <span className="exp-txt"><strong>What to do:</strong> Generate a fresh wallet (new seed phrase), transfer all assets to it, and never transact from this address again.</span>
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
                  <span className="exp-txt">Exposure could not be fully determined. Check your chain's explorer directly, or add the relevant API key for full live analysis.</span>
                </div>
              )}
            </div>

            {/* HUMAN EXPLANATION */}
            <div className="human-box">
              <div className="human-title">// What this means in plain language</div>
              <div className="human-body">{result.humanExplanation}
                <span className="human-src">Source: Google Quantum AI — "Safeguarding cryptocurrency by disclosing quantum vulnerabilities responsibly" (March 31, 2026)</span>
              </div>
            </div>

            {/* FINDINGS */}
            <div className="findings-box">
              <div className="findings-title">// Technical Findings</div>
              {result.findings.map((f: any, i: number) => (
                <div key={i} className="finding">
                  <span className="f-ico">{f.icon}</span>
                  <span className="f-txt" dangerouslySetInnerHTML={{__html: f.text}}/>
                </div>
              ))}
            </div>

            {/* CREDIBILITY BAR */}
            <div className="cred-bar">
              <div className="cred-item"><div className="cred-dot"/>Live data: {raw.dataSource}</div>
              <div className="cred-item"><div className="cred-dot"/>ECDSA / Ed25519 exposure model</div>
              <div className="cred-item"><div className="cred-dot"/>Google Quantum AI 2026 estimates</div>
              <div className="cred-item"><div className="cred-dot"/>API keys never sent to browser</div>
            </div>

            {/* ACTIONS */}
            <div className="actions">
              <button className="btn-p" onClick={() => {
                const tweet = `Just checked my wallet on postquantumize.com\n\nQuantum Risk Score: ${result.score}/100 (${result.riskLevel})\nPublic Key: ${raw.pubKeyExposed===true?"EXPOSED":raw.pubKeyExposed===false?"HIDDEN":"UNKNOWN"}\nTxs: ${raw.txCount ?? "?"} · Outgoing: ${raw.outgoingCount ?? "?"}\n\nGoogle dropped research today: ECDLP-256 may break with ~500K qubits.\nCheck yours → postquantumize.com\n\n#PostQuantum #CryptoSecurity`;
                navigator.clipboard.writeText(tweet);
                alert("Tweet copied to clipboard!");
              }}>Share on X</button>
              <button className="btn-g" onClick={reset}>Check Another Wallet</button>
            </div>
          </div>
        )}

        <footer className="footer">
          <span className="footer-brand">postquantumize.com</span>
          <span className="footer-note">Educational only. Not financial advice. Live data via Etherscan, Blockchair & Helius.</span>
        </footer>
      </div>
    </>
  );
}