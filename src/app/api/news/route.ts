import { NextResponse } from "next/server";

export const revalidate = 3600; // cache for 1 hour

const FEEDS = [
  { url: "https://news.google.com/rss/search?q=post+quantum+cryptography+bitcoin+ethereum&hl=en-US&gl=US&ceid=US:en", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=quantum+computing+crypto+blockchain&hl=en-US&gl=US&ceid=US:en", source: "Google News" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "CoinDesk" },
  { url: "https://decrypt.co/feed", source: "Decrypt" },
];

const QUANTUM_KEYWORDS = [
  "quantum", "post-quantum", "pqc", "ecdsa", "secp256k1", "shor",
  "qubits", "cryptography", "encryption", "q-day", "bip-360",
  "ethereum foundation", "nist", "lattice", "post quantum",
];

const FINANCE_KEYWORDS = [
  "bitcoin", "ethereum", "crypto", "blockchain", "wallet", "defi",
  "solana", "base", "l2", "layer 2",
];

function getTag(title: string, desc: string): { tag: string; tc: string } {
  const text = (title + " " + desc).toLowerCase();
  if (text.includes("break") || text.includes("threat") || text.includes("attack") || text.includes("vulnerable") || text.includes("urgent") || text.includes("warning")) {
    return { tag: "breaking", tc: "res-tag-b" };
  }
  if (text.includes("research") || text.includes("paper") || text.includes("study") || text.includes("algorithm") || text.includes("qubit")) {
    return { tag: "research", tc: "res-tag-r" };
  }
  return { tag: "article", tc: "res-tag-a" };
}

function isRelevant(title: string, desc: string): boolean {
  const text = (title + " " + desc).toLowerCase();
  const hasQuantum = QUANTUM_KEYWORDS.some(k => text.includes(k));
  const hasFinance = FINANCE_KEYWORDS.some(k => text.includes(k));
  return hasQuantum || (hasQuantum && hasFinance);
}

function parseDate(dateStr: string): Date {
  try { return new Date(dateStr); } catch { return new Date(0); }
}

function extractItems(xml: string, sourceName: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title   = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const link    = item.match(/<link>(.*?)<\/link>|<guid>(https?:\/\/[^<]+)<\/guid>/)?.[1] || "";
    const desc    = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)?.[1] || "";
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
    const source  = item.match(/<source[^>]*>(.*?)<\/source>/)?.[1] || sourceName;
    const cleanTitle = title.replace(/<[^>]+>/g, "").trim();
    const cleanDesc  = desc.replace(/<[^>]+>/g, "").trim();
    if (cleanTitle && link && isRelevant(cleanTitle, cleanDesc)) {
      items.push({ title: cleanTitle, url: link, desc: cleanDesc.slice(0, 120), pubDate, source, date: parseDate(pubDate) });
    }
  }
  return items;
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(f => fetch(f.url, { next: { revalidate: 3600 } }).then(r => r.text()).then(xml => extractItems(xml, f.source)))
    );

    let allItems: any[] = [];
    for (const r of results) {
      if (r.status === "fulfilled") allItems = allItems.concat(r.value);
    }

    // Deduplicate by title similarity
    const seen = new Set<string>();
    const unique = allItems.filter(item => {
      const key = item.title.toLowerCase().slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Sort by date descending, take top 6
    const sorted = unique
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 6)
      .map(item => ({
        ...getTag(item.title, item.desc),
        title: item.title,
        src:   `${item.source} · ${item.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        url:   item.url,
      }));

    return NextResponse.json({ articles: sorted, updated: new Date().toISOString() });

  } catch (err) {
    return NextResponse.json({ articles: [], updated: new Date().toISOString(), error: "Feed fetch failed" }, { status: 500 });
  }
}