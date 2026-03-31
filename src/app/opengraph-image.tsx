import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div style={{
      background: "#020a06",
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "80px",
      fontFamily: "monospace",
    }}>
      <div style={{ fontSize: 13, color: "#00c44f", letterSpacing: 4, marginBottom: 32, textTransform: "uppercase" }}>
        postquantumize.com · live blockchain scanner
      </div>
      <div style={{ display: "flex", fontSize: 96, fontWeight: 900, lineHeight: 1, marginBottom: 24 }}>
        <span style={{ color: "#2a4a2e" }}>post</span>
        <span style={{ color: "#00ff6a" }}>quantum</span>
        <span style={{ color: "#ffffff" }}>ize</span>
      </div>
      <div style={{ fontSize: 26, color: "#b8d4be", marginBottom: 40 }}>
        Your wallet may already be exposed.
      </div>
      <div style={{ display: "flex", fontSize: 16, color: "#00c44f", padding: "16px 24px", border: "1px solid rgba(0,196,79,0.3)", background: "rgba(0,196,79,0.04)" }}>
        Check if your ETH, BTC or SOL wallet's public key is exposed on-chain. Free. Live blockchain data.
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
        <div style={{ fontSize: 13, color: "#4a6b52", padding: "8px 16px", border: "1px solid #0d2b16" }}>ETH · BTC · SOL · L2</div>
        <div style={{ fontSize: 13, color: "#4a6b52", padding: "8px 16px", border: "1px solid #0d2b16" }}>Live on-chain data</div>
        <div style={{ fontSize: 13, color: "#4a6b52", padding: "8px 16px", border: "1px solid #0d2b16" }}>Free</div>
      </div>
    </div>,
    { ...size }
  );
}