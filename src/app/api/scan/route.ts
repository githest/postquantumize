import { NextRequest, NextResponse } from "next/server";

const ETHERSCAN_KEY   = process.env.ETHERSCAN_KEY   || "";
const BASESCAN_KEY    = process.env.BASESCAN_KEY    || "";
const ARBISCAN_KEY    = process.env.ARBISCAN_KEY    || "";
const OPTIMISM_KEY    = process.env.OPTIMISM_KEY    || "";
const POLYGONSCAN_KEY = process.env.POLYGONSCAN_KEY || "";
const HELIUS_KEY      = process.env.HELIUS_KEY      || "";

const EVM_CHAINS: Record<string, { name: string; apiBase: string; key: string; ticker: string }> = {
  ETH:      { name: "Ethereum",     apiBase: "https://api.etherscan.io/api",            key: ETHERSCAN_KEY,   ticker: "ETH"  },
  BASE:     { name: "Base",         apiBase: "https://api.basescan.org/api",            key: BASESCAN_KEY,    ticker: "ETH"  },
  ARBITRUM: { name: "Arbitrum One", apiBase: "https://api.arbiscan.io/api",             key: ARBISCAN_KEY,    ticker: "ETH"  },
  OPTIMISM: { name: "Optimism",     apiBase: "https://api-optimistic.etherscan.io/api", key: OPTIMISM_KEY,    ticker: "ETH"  },
  POLYGON:  { name: "Polygon",      apiBase: "https://api.polygonscan.com/api",         key: POLYGONSCAN_KEY, ticker: "MATIC"},
};

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
  firstOutTxTimestamp: number | null;
  firstOutTxHash: string | null;
  pubKeyExposed: boolean | null;
  isContract: boolean;
  error?: string;
}

async function fetchEVM(address: string, chainKey: string): Promise<ScanResult> {
  const cfg = EVM_CHAINS[chainKey];
  if (!cfg) throw new Error(`Unknown EVM chain: ${chainKey}`);

  const addr = address.toLowerCase();
  const keyParam = cfg.key ? `&apikey=${cfg.key}` : "";
  const base = cfg.apiBase;

  // Step 1: Check if contract and get balance in parallel
  const [balRes, codeRes, txCountRes] = await Promise.all([
    fetch(`${base}?module=account&action=balance&address=${addr}&tag=latest${keyParam}`),
    fetch(`${base}?module=proxy&action=eth_getCode&address=${addr}&tag=latest${keyParam}`),
    // Use txlistinternal count approach - get just 1 tx to check if any exist
    fetch(`${base}?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=1&sort=asc${keyParam}`),
  ]);

  const balData      = await balRes.json();
  const codeData     = await codeRes.json();
  const txCountData  = await txCountRes.json();

  // Detect smart contract
  let isContract = false;
  try {
    const bytecode = codeData.result || "0x";
    isContract = typeof bytecode === "string" && bytecode.startsWith("0x") && bytecode.length > 4;
  } catch { isContract = false; }

  // Parse balance
  let balFmt = "0.000000";
  try {
    if (balData.result && !balData.result.startsWith("0x")) {
      const wei = parseFloat(balData.result);
      if (!isNaN(wei)) balFmt = (wei / 1e18).toFixed(6);
    }
  } catch { balFmt = "0.000000"; }

  // If contract — return early with balance and basic info
  if (isContract) {
    const txs = Array.isArray(txCountData.result) ? txCountData.result : [];
    return {
      success: true, chain: chainKey, chainName: cfg.name,
      dataSource: new URL(base).hostname, address,
      txCount: txCountData.status === "1" ? null : null, // contracts use different counting
      outgoingCount: null,
      balance: balFmt, balanceTicker: cfg.ticker,
      contractInteractions: null,
      firstOutTxTimestamp: null, firstOutTxHash: null,
      pubKeyExposed: false, isContract: true,
    };
  }

  // For EOAs — fetch up to 500 txs (safe limit for free tier)
  const txRes  = await fetch(`${base}?module=account&action=txlist&address=${addr}&startblock=0&endblock=99999999&page=1&offset=500&sort=asc${keyParam}`);
  const txData = await txRes.json();
  const txs    = Array.isArray(txData.result) ? txData.result as any[] : [];

  // Also fetch total tx count separately using account info
  const countRes  = await fetch(`${base}?module=proxy&action=eth_getTransactionCount&address=${addr}&tag=latest${keyParam}`);
  const countData = await countRes.json();

  // eth_getTransactionCount returns outgoing nonce (number of txs sent FROM this address)
  let outgoingCount = 0;
  try {
    if (countData.result && countData.result !== "0x0") {
      outgoingCount = parseInt(countData.result, 16);
    }
  } catch { outgoingCount = 0; }

  // First outgoing tx from the fetched batch
  const outgoing = txs.filter((t: any) => t.from?.toLowerCase() === addr);
  const firstOut = outgoing[0] || null;

  // Total tx count — use nonce as source of truth for outgoing
  // For total, use txlist count if available, otherwise estimate
  const totalTxCount = txData.status === "1" ? 
    (txs.length === 500 ? `500+` : String(txs.length)) : 
    null;

  return {
    success: true, chain: chainKey, chainName: cfg.name,
    dataSource: new URL(base).hostname, address,
    txCount: txs.length > 0 ? txs.length : (outgoingCount > 0 ? outgoingCount : null),
    outgoingCount: outgoingCount > 0 ? outgoingCount : outgoing.length,
    balance: balFmt, balanceTicker: cfg.ticker,
    contractInteractions: txs.filter((t: any) => t.input && t.input !== "0x").length,
    firstOutTxTimestamp: firstOut ? parseInt(firstOut.timeStamp) : null,
    firstOutTxHash: firstOut?.hash || null,
    pubKeyExposed: outgoingCount > 0,
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
  const balSats     = funded - spent;

  return {
    success: true, chain: "BTC", chainName: "Bitcoin",
    dataSource: "mempool.space", address,
    txCount, outgoingCount: outputCount,
    balance: (balSats / 1e8).toFixed(8), balanceTicker: "BTC",
    contractInteractions: null,
    firstOutTxTimestamp: null, firstOutTxHash: null,
    pubKeyExposed: outputCount > 0, isContract: false,
  };
}

async function fetchSOL(address: string): Promise<ScanResult> {
  if (!HELIUS_KEY) {
    const rpcRes = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [address, { commitment: "confirmed" }] }),
    });
    const rpc = await rpcRes.json();
    const lamports = rpc.result?.value || 0;
    return {
      success: true, chain: "SOL", chainName: "Solana",
      dataSource: "api.mainnet-beta.solana.com", address,
      txCount: null, outgoingCount: null,
      balance: (lamports / 1e9).toFixed(6), balanceTicker: "SOL",
      contractInteractions: null,
      firstOutTxTimestamp: null, firstOutTxHash: null,
      pubKeyExposed: null, isContract: false,
    };
  }

  const [balRes, txRes] = await Promise.all([
    fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getBalance", params: [address, { commitment: "confirmed" }] }),
    }),
    fetch(`https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_KEY}&limit=100`),
  ]);

  const balData  = await balRes.json();
  const txData   = await txRes.json();
  const lamports = balData.result?.value || 0;
  const txs      = Array.isArray(txData) ? txData : [];
  const firstTx  = txs.length > 0 ? txs[txs.length - 1] : null;

  return {
    success: true, chain: "SOL", chainName: "Solana",
    dataSource: "api.helius.xyz", address,
    txCount: txs.length, outgoingCount: txs.length,
    balance: (lamports / 1e9).toFixed(6), balanceTicker: "SOL",
    contractInteractions: txs.filter((t: any) => t.type === "SWAP" || t.type === "NFT_SALE").length,
    firstOutTxTimestamp: firstTx?.timestamp || null,
    firstOutTxHash: firstTx?.signature || null,
    pubKeyExposed: txs.length > 0, isContract: false,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, chain, l2Chain } = body as {
      address: string;
      chain: "ETH" | "BTC" | "SOL" | "L2";
      l2Chain?: string;
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
      result = await fetchEVM(address, l2Chain || "BASE");
    } else {
      result = await fetchEVM(address, chain);
    }

    return NextResponse.json(result);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Scan failed";
    console.error("[scan] Error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}