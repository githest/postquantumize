import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY || "";
const HELIUS_KEY    = process.env.HELIUS_KEY    || "";

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

const EVM_CHAINS: Record<string, { name: string; apiBase: string; ticker: string }> = {
  ETH:      { name: "Ethereum",     apiBase: "https://api.etherscan.io/v2/api?chainid=1",    ticker: "ETH"  },
  BASE:     { name: "Base",         apiBase: "https://api.etherscan.io/v2/api?chainid=8453", ticker: "ETH"  },
  ARBITRUM: { name: "Arbitrum One", apiBase: "https://api.etherscan.io/v2/api?chainid=42161",ticker: "ETH"  },
  OPTIMISM: { name: "Optimism",     apiBase: "https://api.etherscan.io/v2/api?chainid=10",   ticker: "ETH"  },
  POLYGON:  { name: "Polygon",      apiBase: "https://api.etherscan.io/v2/api?chainid=137",  ticker: "MATIC"},
};

export interface ScanResult {
  success: boolean; chain: string; chainName: string; dataSource: string;
  address: string; txCount: number | null; txCountCapped: boolean;
  outgoingCount: number | null; balance: string | null; balanceTicker: string;
  contractInteractions: number | null; firstOutTxTimestamp: number | null;
  firstOutTxHash: string | null; pubKeyExposed: boolean | null;
  isContract: boolean; error?: string;
}

async function fetchEVM(address: string, chainKey: string): Promise<ScanResult> {
  const cfg = EVM_CHAINS[chainKey];
  if (!cfg) throw new Error(`Unknown chain: ${chainKey}`);
  const addr = address.toLowerCase();
  const key  = ETHERSCAN_KEY ? `&apikey=${ETHERSCAN_KEY}` : "";
  const b    = cfg.apiBase;

  // Fetch balance, nonce (outgoing tx count), and bytecode in parallel
  const [balRes, nonceRes, codeRes] = await Promise.all([
    fetch(`${b}&module=account&action=balance&address=${addr}&tag=latest${key}`),
    fetch(`${b}&module=proxy&action=eth_getTransactionCount&address=${addr}&tag=latest${key}`),
    fetch(`${b}&module=proxy&action=eth_getCode&address=${addr}&tag=latest${key}`),
  ]);

  const balData   = await balRes.json();
  const nonceData = await nonceRes.json();
  const codeData  = await codeRes.json();

  // Parse balance
  let balFmt = "0.000000";
  try {
    if (balData.result && !/^0x/.test(balData.result)) {
      const wei = parseFloat(balData.result);
      if (!isNaN(wei)) balFmt = (wei / 1e18).toFixed(6);
    }
  } catch { balFmt = "0.000000"; }

  // Parse nonce — this is the TRUE outgoing tx count, works for all wallet sizes
  let nonce = 0;
  try {
    if (nonceData.result && nonceData.result !== "0x0") {
      nonce = parseInt(nonceData.result, 16);
    }
  } catch { nonce = 0; }

  // Smart contract detection — use bytecode length > 100 to skip EIP-7702 stubs (23 bytes)
  // AND cross-check with nonce: if nonce > 0, it's definitely an EOA regardless of bytecode
  let isContract = false;
  try {
    const code = codeData.result || "0x";
    const hasRealBytecode = typeof code === "string" && code.startsWith("0x") && code.length > 100;
    // Only mark as contract if it has real bytecode AND nonce is 0
    // (contracts can't send normal transactions, so nonce stays 0)
    isContract = hasRealBytecode && nonce === 0;
  } catch { isContract = false; }

  // If it's a contract, fetch some tx data for display but don't expose-check
  if (isContract) {
    const txRes  = await fetch(`${b}&module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=500&sort=asc${key}`);
    const txData = await txRes.json();
    const txs    = Array.isArray(txData.result) ? txData.result : [];
    return {
      success: true, chain: chainKey, chainName: cfg.name,
      dataSource: "api.etherscan.io", address,
      txCount: txs.length > 0 ? txs.length : null, txCountCapped: txs.length === 500,
      outgoingCount: null, balance: balFmt, balanceTicker: cfg.ticker,
      contractInteractions: null, firstOutTxTimestamp: null, firstOutTxHash: null,
      pubKeyExposed: false, isContract: true,
    };
  }

  // For EOAs — fetch up to 500 txs to get first outgoing tx details
  const txRes  = await fetch(`${b}&module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=500&sort=asc${key}`);
  const txData = await txRes.json();
  const txs    = Array.isArray(txData.result) ? txData.result as any[] : [];

  // First outgoing tx from fetched batch (for timestamp/hash)
  const outgoing = txs.filter((t: any) => t.from?.toLowerCase() === addr);
  const firstOut = outgoing[0] || null;

  return {
    success: true, chain: chainKey, chainName: cfg.name,
    dataSource: "api.etherscan.io", address,
    // Use nonce as tx count (most accurate), cap display if >= 500
    txCount: nonce > 0 ? nonce : (txs.length > 0 ? txs.length : null),
    txCountCapped: txs.length === 500,
    // Nonce = exact number of outgoing txs ever sent
    outgoingCount: nonce,
    balance: balFmt, balanceTicker: cfg.ticker,
    contractInteractions: txs.filter((t: any) => t.input && t.input !== "0x").length,
    firstOutTxTimestamp: firstOut ? parseInt(firstOut.timeStamp) : null,
    firstOutTxHash: firstOut?.hash || null,
    // Key insight: if nonce > 0, public key HAS been broadcast — no exceptions
    pubKeyExposed: nonce > 0,
    isContract: false,
  };
}

async function fetchBTC(address: string): Promise<ScanResult> {
  const res = await fetch(`https://mempool.space/api/address/${address}`);
  if (!res.ok) throw new Error(`Mempool HTTP ${res.status}`);
  const data = await res.json();
  const txCount     = data.chain_stats?.tx_count || 0;
  const outputCount = data.chain_stats?.spent_txo_count || 0;
  const funded      = data.chain_stats?.funded_txo_sum || 0;
  const spent       = data.chain_stats?.spent_txo_sum || 0;
  return {
    success: true, chain: "BTC", chainName: "Bitcoin",
    dataSource: "mempool.space", address,
    txCount, txCountCapped: false, outgoingCount: outputCount,
    balance: ((funded - spent) / 1e8).toFixed(8), balanceTicker: "BTC",
    contractInteractions: null, firstOutTxTimestamp: null, firstOutTxHash: null,
    pubKeyExposed: outputCount > 0, isContract: false,
  };
}

async function fetchSOL(address: string): Promise<ScanResult> {
  if (!HELIUS_KEY) {
    const rpcRes = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [address, { commitment: "confirmed" }] }),
    });
    const rpc = await rpcRes.json();
    return {
      success: true, chain: "SOL", chainName: "Solana",
      dataSource: "api.mainnet-beta.solana.com", address,
      txCount: null, txCountCapped: false, outgoingCount: null,
      balance: ((rpc.result?.value || 0) / 1e9).toFixed(6), balanceTicker: "SOL",
      contractInteractions: null, firstOutTxTimestamp: null, firstOutTxHash: null,
      pubKeyExposed: null, isContract: false,
    };
  }
  const [balRes, txRes] = await Promise.all([
    fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [address, { commitment: "confirmed" }] }),
    }),
    fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_KEY}&limit=100`),
  ]);
  const balData = await balRes.json();
  const txData  = await txRes.json();
  const txs     = Array.isArray(txData) ? txData : [];
  const firstTx = txs.length > 0 ? txs[txs.length - 1] : null;
  return {
    success: true, chain: "SOL", chainName: "Solana",
    dataSource: "api.helius.xyz", address,
    txCount: txs.length, txCountCapped: txs.length === 100,
    outgoingCount: txs.length,
    balance: ((balData.result?.value || 0) / 1e9).toFixed(6), balanceTicker: "SOL",
    contractInteractions: txs.filter((t: any) => t.type === "SWAP" || t.type === "NFT_SALE").length,
    firstOutTxTimestamp: firstTx?.timestamp || null,
    firstOutTxHash: firstTx?.signature || null,
    pubKeyExposed: txs.length > 0, isContract: false,
  };
}

// ── Input validation ──────────────────────────────────────
// The address is placed inside third-party API URLs that carry our
// Etherscan / Helius keys. Anything other than a well-formed address
// could inject extra query params or path segments, so reject it.
const ADDRESS_PATTERNS: Record<string, RegExp> = {
  EVM: /^0x[0-9a-fA-F]{40}$/,
  BTC: /^(bc1[02-9ac-hj-np-z]{11,87}|[13][1-9A-HJ-NP-Za-km-z]{25,34})$/,
  SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
};
const VALID_CHAINS = new Set(["ETH", "BTC", "SOL", "L2"]);

// ── Rate limiting ─────────────────────────────────────────
// Best-effort, per server instance. It stops casual scripted abuse of our
// API quotas; for hard guarantees add a Vercel WAF rate-limit rule too.
const RATE_LIMIT = 10;            // requests
const RATE_WINDOW_MS = 60_000;    // per minute, per IP
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          || req.headers.get("x-real-ip") || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ success: false, error: "Too many scans. Please wait a minute." }, { status: 429 });
  }
  try {
    const body = await req.json().catch(() => null) as {
      address?: unknown; chain?: unknown; l2Chain?: unknown;
    } | null;
    const address = typeof body?.address === "string" ? body.address.trim() : "";
    const chain   = typeof body?.chain === "string" ? body.chain : "";
    const l2Chain = typeof body?.l2Chain === "string" ? body.l2Chain : undefined;

    if (!address || !VALID_CHAINS.has(chain)) {
      return NextResponse.json({ success: false, error: "Missing or invalid address or chain" }, { status: 400 });
    }
    if (chain === "L2" && l2Chain !== undefined && !(l2Chain in EVM_CHAINS)) {
      return NextResponse.json({ success: false, error: "Unsupported L2 chain" }, { status: 400 });
    }
    const pattern = chain === "BTC" ? ADDRESS_PATTERNS.BTC
                  : chain === "SOL" ? ADDRESS_PATTERNS.SOL
                  : ADDRESS_PATTERNS.EVM;
    if (!pattern.test(address)) {
      return NextResponse.json({ success: false, error: "That does not look like a valid address for this chain" }, { status: 400 });
    }
    let result: ScanResult;
    if      (chain === "BTC") result = await fetchBTC(address);
    else if (chain === "SOL") result = await fetchSOL(address);
    else if (chain === "L2")  result = await fetchEVM(address, l2Chain || "BASE");
    else                      result = await fetchEVM(address, chain);
    // Track scan anonymously — no wallet address stored
    try {
      if (supabase) {
        await supabase.from("scans").insert({
          chain: result.chain,
          risk_level: result.pubKeyExposed === true ? "HIGH" :
                      result.pubKeyExposed === false ? "LOW" : "UNKNOWN",
          is_exposed: result.pubKeyExposed === true,
          is_contract: result.isContract,
        });
      }
    } catch { /* analytics failure should never break the scan */ }

    return NextResponse.json(result);
  } catch (err: unknown) {
    // Log details server-side only; never echo upstream errors to the client.
    console.error("scan failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Scan failed. Please try again." }, { status: 500 });
  }
}