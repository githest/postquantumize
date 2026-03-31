import { ImageResponse } from "next/og";

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
      position: "relative",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#00ff6a", opacity: 0.8, display: "flex" }} />
      <div style={{ fontSize: 13, color: "#00c44f", letterSpacing: 4, marginBottom: 32, textTransform: "uppercase", display: "flex" }}>
        postquantumize.com · quantum vulnerability checker
      </div>
      <div style={{ display: "flex", fontSize: 80, fontWeight: 900, lineHeight: 1, marginBottom: 20 }}>
        <span style={{ color: "#2a4a2e" }}>post</span>
        <span style={{ color: "#00ff6a" }}>quantum</span>
        <span style={{ color: "#ffffff" }}>ize</span>
      </div>
      <div style={{ fontSize: 24, color: "#b8d4be", marginBottom: 40, display: "flex" }}>
        Check if your crypto wallet is quantum safe.
      </div>
      <div style={{ display: "flex", fontSize: 15, color: "#00c44f", padding: "16px 24px", border: "1px solid rgba(0,196,79,0.3)", background: "rgba(0,196,79,0.04)" }}>
        Paste any ETH, BTC or SOL address — see if your public key is exposed on-chain. Free. Live data.
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
        <div style={{ fontSize: 13, color: "#4a6b52", padding: "8px 16px", border: "1px solid #0d2b16", display: "flex" }}>ETH · BTC · SOL · L2</div>
        <div style={{ fontSize: 13, color: "#4a6b52", padding: "8px 16px", border: "1px solid #0d2b16", display: "flex" }}>Live on-chain data</div>
        <div style={{ fontSize: 13, color: "#00c44f", padding: "8px 16px", border: "1px solid rgba(0,196,79,0.3)", background: "rgba(0,196,79,0.04)", display: "flex" }}>Free</div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#00ff6a", opacity: 0.2, display: "flex" }} />
      <div style={{ position: "absolute", top: 0, left: 0, width: 5, height: 5, background: "#00ff6a", display: "flex" }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: 5, height: 5, background: "#00ff6a", display: "flex" }} />
    </div>,
    { ...size }
  );
}