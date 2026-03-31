import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "postquantumize.com — Quantum Vulnerability Checker",
  description:
    "Check if your crypto wallet's public key is exposed and calculate your quantum risk score. Live blockchain data. Based on Google's 2026 CRQC estimates.",
  metadataBase: new URL("https://postquantumize.com"),
  openGraph: {
    title: "postquantumize.com — Is Your Wallet Quantum Safe?",
    description:
      "Google just showed ECDLP-256 may break with under 500K qubits. Paste your ETH, BTC or SOL address. See if your public key is already exposed on-chain.",
    url: "https://postquantumize.com",
    siteName: "postquantumize.com",
    images: [
      {
        url: "https://postquantumize.com/og-image.png",
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
    description:
      "Google just showed ECDLP-256 may break with under 500K qubits. Check if your ETH, BTC or SOL wallet is exposed. Free. Live on-chain data.",
    images: ["https://postquantumize.com/og-image.png"],
    creator: "@james_base_eth",
    site: "@james_base_eth",
  },
  keywords: [
    "post quantum cryptography",
    "quantum vulnerability",
    "crypto wallet security",
    "ECDSA quantum attack",
    "bitcoin quantum risk",
    "ethereum quantum",
    "Shor's algorithm",
    "ECDLP-256",
    "PQC",
    "quantum safe",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Extra Twitter/X tags for belt-and-suspenders */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@james_base_eth" />
        <meta name="twitter:creator" content="@james_base_eth" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#020a06" }}>
        {children}
      </body>
    </html>
  );
}