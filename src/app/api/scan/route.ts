/**
 * POST /api/scan
 * Unified blockchain data fetcher for quantum vulnerability analysis.
 * All API keys live server-side — never exposed to the browser.
 *
 * Body: { address: string, chain: "ETH" | "BTC" | "SOL" | "L2", l2Chain?: string }
 * Returns: ScanResult
 */

import { NextRequest, NextResponse } from "next/server";

// ─── ENV KEYS (set in .env.local) ────────────────────────────────────────────
const ETHERSCAN_KEY   = process.env.ETHERSCAN_KEY   || "";
const BASESCAN_KEY    = process.env.BASESCAN_KEY    || "";
const ARBISCAN_KEY    = process.env.ARBISCAN_KEY    || "";
const OPTIMISM_KEY    = process.env.OPTIMISM_KEY    || "";
const POLYGONSCAN_KEY = process.env.POLYGONSCAN_KEY || "";
const BLOCKCHAIR_KEY  = process.env.BLOCKCHAIR_KEY  || "";
const HELIUS_KEY      = process.env.HELIUS_KEY      || "";

// ─── CHAIN CONFIG ─────────────────────────────────────────────────────────────
const EVM_CHAINS: Record<string, { name: string; apiBase: string; key: string; ticker: string }> = {
  ETH:      { name: "Ethereum",        apiBase: "https://api.etherscan.io/api",                   key: ETHERSCAN_KEY,   ticker: "ETH" },
  BASE:     { name: "Base",            apiBase: "https://api.basescan.org/api",                   key: BASESCAN_KEY,    ticker: "ETH" },
  ARBITRUM: { name: "Arbitrum One",    apiBase: "https://api.arbiscan.io/api",                    key: ARBISCAN_KEY,    ticker: "ETH" },
  OPTIMISM: { name: "Optimism",        apiBase: "https://api-optimistic.etherscan.io/api",        key: OPTIMISM_KEY,    ticker: "ETH" },
  POLYGON:  { name: "Polygon",         apiBase: "https://api.polygonscan.com/api",                key: POLYGONSCAN_KEY, ticker: "MATIC" },
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface ScanResult {
  success: boolean;
  chain: string;
  chainName: string;
  dataSource: string;
  address: string;
  txCount: number | null;
  outgoingCount: number | null;
  balance: string | null;
  balanceTicker: string;
  contractInteractions: number | null;
  firstOutTxTimestamp: number | null;   // unix seconds
  firstOutTxHash: string | null;
  pubKeyExposed: boolean | null;        // null = could not determine
  error?: string;
}

// ─── EVM FETCHER (works for ETH + all L2s) ───────────────────────────────────
async function fetchEVM(address: string, chainKey: string): Promise<ScanResult> {
  const cfg = EVM_CHAINS[chainKey];
  if (!cfg) throw new Error(`Unknown EVM chain: ${chainKey}`);

  const addr = address.toLowerCase();
  const keyParam = cfg.key ? `&apikey=${cfg.key}` : "";
  const base = cfg.apiBase;

  const [txRes, balRes] = await Promise.all([
    fetch(`${base}?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=200&sort=asc${keyParam}`, { next: { revalidate: 60 } }),
    fetch(`${base}?module=account&action=balance&address=${addr}&tag=latest${keyParam}`,                                               { next: { revalidate: 60 } }),
  ]);

  const txData  = await txRes.json();
  const balData = await balRes.json();

  const txs       = txData.status === "1" ? txData.result as any[] : [];
  const balWei    = balData.status === "1" ? BigInt(balData.result) : BigInt(0);
  const balFmt    = (Number(balWei) / 1e18).toFixed(6);
  const outgoing  = txs.filter(t => t.from?.toLowerCase() === addr);
  const firstOut  = outgoing[0] || null;

  return {
    success:              true,
    chain:                chainKey,
    chainName:            cfg.name,
    dataSource:           new URL(base).hostname,
    address,
    txCount:              txs.length,
    outgoingCount:        outgoing.length,
    balance:              balFmt,
    balanceTicker:        cfg.ticker,
    contractInteractions: txs.filter(t => t.input && t.input !== "0x").length,
    firstOutTxTimestamp:  firstOut ? parseInt(firstOut.timeStamp) : null,
    firstOutTxHash:       firstOut?.hash || null,
    pubKeyExposed:        outgoing.length > 0,
  };
}

// ─── BTC FETCHER (Blockchair) ─────────────────────────────────────────────────
async function fetchBTC(address: string): Promise<ScanResult> {
  const keyParam = BLOCKCHAIR_KEY ? `?key=${BLOCKCHAIR_KEY}` : "";
  const res = await fetch(
    `https://api.blockchair.com/bitcoin/dashboards/address/${address}${keyParam}`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`Blockchair HTTP ${res.status}`);

  const data    = await res.json();
  const payload = data.data?.[address];
  if (!payload) throw new Error("Address not found on Blockchair");

  const stats       = payload.address;
  const txs         = payload.transactions || [];
  const outputCount = stats.output_count || 0;

  // First spend tx: Blockchair lists most recent first; we want the oldest spend
  // spending = any tx where the address was an input (i.e., sent funds)
  const firstSpendTs = stats.first_seen_spending
    ? Math.floor(new Date(stats.first_seen_spending).getTime() / 1000)
    : null;

  return {
    success:              true,
    chain:                "BTC",
    chainName:            "Bitcoin",
    dataSource:           "api.blockchair.com",
    address,
    txCount:              stats.transaction_count || 0,
    outgoingCount:        outputCount,
    balance:              ((stats.balance || 0) / 1e8).toFixed(8),
    balanceTicker:        "BTC",
    contractInteractions: null,                   // N/A for Bitcoin
    firstOutTxTimestamp:  firstSpendTs,
    firstOutTxHash:       null,                   // Blockchair doesn't return it here
    pubKeyExposed:        outputCount > 0,
  };
}

// ─── SOL FETCHER (Helius) ─────────────────────────────────────────────────────
async function fetchSOL(address: string): Promise<ScanResult> {
  if (!HELIUS_KEY) {
    // Fallback: use public Solana RPC for balance only
    const rpcRes = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1, method: "getBalance",
        params: [address, { commitment: "confirmed" }],
      }),
    });
    const rpc = await rpcRes.json();
    const lamports = rpc.result?.value || 0;
    return {
      success:              true,
      chain:                "SOL",
      chainName:            "Solana",
      dataSource:           "api.mainnet-beta.solana.com (no Helius key)",
      address,
      txCount:              null,
      outgoingCount:        null,
      balance:              (lamports / 1e9).toFixed(6),
      balanceTicker:        "SOL",
      contractInteractions: null,
      firstOutTxTimestamp:  null,
      firstOutTxHash:       null,
      pubKeyExposed:        null,   // Can't determine without tx history
    };
  }

  // With Helius: get full tx history
  const [balRes, txRes] = await Promise.all([
    fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc:"2.0", id:1, method:"getBalance", params:[address,{commitment:"confirmed"}] }),
    }),
    fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_KEY}&limit=100&type=TRANSFER`, {
      next: { revalidate: 60 },
    }),
  ]);

  const balData = await balRes.json();
  const txData  = await txRes.json();

  const lamports   = balData.result?.value || 0;
  const txs        = Array.isArray(txData) ? txData : [];

  // Solana: Ed25519 pubkey is exposed the moment any tx is signed
  // Any transaction at all exposes the key (unlike BTC where receive doesn't expose)
  const pubKeyExposed = txs.length > 0;
  const firstTx       = txs.length > 0 ? txs[txs.length - 1] : null; // oldest last

  return {
    success:              true,
    chain:                "SOL",
    chainName:            "Solana",
    dataSource:           "api.helius.xyz",
    address,
    txCount:              txs.length,
    outgoingCount:        txs.length,   // On Solana, any tx exposes pubkey
    balance:              (lamports / 1e9).toFixed(6),
    balanceTicker:        "SOL",
    contractInteractions: txs.filter((t: any) => t.type === "SWAP" || t.type === "NFT_SALE").length,
    firstOutTxTimestamp:  firstTx?.timestamp || null,
    firstOutTxHash:       firstTx?.signature || null,
    pubKeyExposed,
  };
}

// ─── ROUTE HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, chain, l2Chain } = body as {
      address: string;
      chain: "ETH" | "BTC" | "SOL" | "L2";
      l2Chain?: string;   // "BASE" | "ARBITRUM" | "OPTIMISM" | "POLYGON"
    };

    if (!address || !chain) {
      return NextResponse.json({ success: false, error: "Missing address or chain" }, { status: 400 });
    }

    let result: ScanResult;

    if (chain === "BTC") {
      result = await fetchBTC(address);
    } else if (chain === "SOL") {
      result = await fetchSOL(address);
    } else if (chain === "L2") {
      // Use l2Chain param to pick the right explorer, default to BASE
      const targetChain = l2Chain || "BASE";
      result = await fetchEVM(address, targetChain);
    } else {
      // ETH or any direct EVM key
      result = await fetchEVM(address, chain);
    }

    return NextResponse.json(result);

  } catch (err: any) {
    console.error("[scan] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Scan failed" },
      { status: 500 }
    );
  }
}