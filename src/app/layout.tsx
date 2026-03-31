import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "postquantumize.com — Quantum Vulnerability Checker",
  description: "Check if your crypto wallet is quantum safe. Paste any ETH, BTC or SOL address — see if your public key is exposed on-chain.",
  metadataBase: new URL("https://postquantumize.com"),
  openGraph: {
    title: "postquantumize.com — Is Your Wallet Quantum Safe?",
    description: "Check if your crypto wallet is quantum safe. Paste any ETH, BTC or SOL address — see if your public key is exposed on-chain. Free. Live data.",
    url: "https://postquantumize.com",
    siteName: "postquantumize.com",
    images: [
      {
        url: "https://postquantumize.com/opengraph-image",
        width: 1200,
        height: 630,
        alt: "postquantumize.com — Quantum Vulnerability Checker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "postquantumize.com — Is Your Wallet Quantum Safe?",
    description: "Check if your crypto wallet is quantum safe. Paste any ETH, BTC or SOL address — see if your public key is exposed on-chain. Free. Live data.",
    images: ["https://postquantumize.com/opengraph-image"],
    creator: "@james_base_eth",
    site: "@postquantumize",
  },
  keywords: ["post quantum cryptography", "quantum vulnerability", "crypto wallet security", "ECDSA quantum attack", "bitcoin quantum risk", "ethereum quantum", "PQC"],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#020a06" }}>
        {children}
      </body>
    </html>
  );
}