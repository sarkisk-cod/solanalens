"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, CircleDollarSign, LoaderCircle, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { ClaimBuild, Position, PositionsResponse } from "@/lib/panta-types";
import { instructionsToVersionedTransaction } from "@/lib/solana-transaction";

const demoPositions: Position[] = [
  { marketId: "ETF8…K9Q", category: "Crypto", side: "yes", shares: "84.20", phase: "active", claimable: false, claimed: false, estimatedValue: "62.31" },
  { marketId: "SOL3…D7M", category: "Solana", side: "yes", shares: "29.41", phase: "resolved", claimable: true, claimed: false, outcome: "yes", estimatedValue: "29.41" },
  { marketId: "FED5…P2A", category: "Macro", side: "no", shares: "41.66", phase: "active", claimable: false, claimed: false, estimatedValue: "24.58" },
];

type PortfolioPanelProps = { live: boolean };

export function PortfolioPanel({ live }: PortfolioPanelProps) {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();
  const [positions, setPositions] = useState<Position[]>(demoPositions);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState<string>();
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const totalValue = useMemo(
    () => positions.reduce((sum, position) => sum + Number(position.estimatedValue ?? (position.claimable ? position.shares : 0)), 0),
    [positions],
  );
  const claimableCount = positions.filter((position) => position.claimable && !position.claimed).length;

  async function loadPositions() {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }
    if (!live) {
      setPositions(demoPositions);
      setError("Live positions will appear after the Panta key is added to the server environment.");
      return;
    }

    setLoading(true);
    setError(undefined);
    setSuccess(undefined);
    try {
      const response = await fetch(`/api/panta/positions?wallet=${encodeURIComponent(publicKey.toBase58())}`);
      const payload = (await response.json()) as PositionsResponse & { detail?: string; code?: string };
      if (!response.ok) throw new Error(payload.detail ?? payload.code ?? "Positions request failed");
      setPositions(payload.positions ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Positions could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function claimPosition(position: Position) {
    if (!connected || !publicKey || !signTransaction) {
      setVisible(true);
      return;
    }
    if (!live) {
      setError("Claiming is disabled while SolanaLens is using demo data.");
      return;
    }

    setClaiming(position.marketId);
    setError(undefined);
    setSuccess(undefined);
    try {
      const build = await postJson<ClaimBuild>("/api/panta/claim", {
        wallet: publicKey.toBase58(),
        marketId: position.marketId,
      });
      const transaction = instructionsToVersionedTransaction(
        build.instructions,
        publicKey,
        build.recentBlockhash,
      );
      const signed = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction(signature, "confirmed");

      let message = `${build.winningShares} winning shares claimed.`;
      try {
        await postJson("/api/panta/trade/report", {
          signature,
          wallet: publicKey.toBase58(),
          marketId: position.marketId,
        });
      } catch {
        message += " The transaction confirmed; attribution sync is pending.";
      }
      setPositions((current) => current.map((item) => item.marketId === position.marketId ? { ...item, claimable: false, claimed: true } : item));
      setSuccess(message);
    } catch (claimError) {
      setError(claimError instanceof Error ? claimError.message : "The claim could not be completed.");
    } finally {
      setClaiming(undefined);
    }
  }

  return (
    <section className="section-block" id="portfolio">
      <div className="section-heading">
        <div>
          <span className="section-index">03</span>
          <h2>Portfolio</h2>
          <p>Positions, estimated value, and claimable Panta winnings.</p>
        </div>
        <button className="ghost-button portfolio-refresh" onClick={loadPositions} disabled={loading}>
          {loading ? <LoaderCircle className="spin" size={14} /> : <RefreshCw size={14} />}
          {connected ? "Refresh positions" : "Connect wallet"}
        </button>
      </div>

      <div className="portfolio-metrics">
        <div><span>Estimated value</span><strong>{totalValue ? `$${totalValue.toFixed(2)}` : "—"}</strong><small>USDC mark-to-market</small></div>
        <div><span>Open positions</span><strong>{positions.filter((position) => position.phase === "active").length}</strong><small>Across Panta markets</small></div>
        <div className={claimableCount ? "claim-ready" : ""}><span>Ready to claim</span><strong>{claimableCount}</strong><small>{claimableCount ? "Action available" : "Nothing pending"}</small></div>
        <div><span>Wallet status</span><strong className="wallet-status"><i className={connected ? "online" : ""} />{connected ? "Connected" : "Not connected"}</strong><small>{live ? "Live Panta data" : "Demo portfolio"}</small></div>
      </div>

      {(error || success) && (
        <div className={`portfolio-notice ${success ? "success" : "error"}`} role="status">
          {success ? <Check size={15} /> : <ShieldCheck size={15} />}
          <span>{success ?? error}</span>
        </div>
      )}

      <div className="portfolio-table-wrap">
        <div className="portfolio-table-head">
          <div><WalletCards size={16} /><span>{live ? "Wallet positions" : "Illustrative positions"}</span></div>
          <span className="source-badge"><i className={`live-dot ${live ? "panta" : "demo"}`} />{live ? "Panta live" : "Demo mode"}</span>
        </div>
        <div className="portfolio-table-scroll">
          <table className="portfolio-table">
            <thead><tr><th>Market</th><th>Side</th><th>Shares</th><th>Phase</th><th>Est. value</th><th>Status</th><th /></tr></thead>
            <tbody>
              {positions.map((position) => {
                const working = claiming === position.marketId;
                return (
                  <tr key={`${position.marketId}-${position.side}`}>
                    <td><span className="market-id">{position.marketId.length > 14 ? `${position.marketId.slice(0, 7)}…${position.marketId.slice(-4)}` : position.marketId}</span><small>{position.category ?? "Market"}</small></td>
                    <td><span className={`position-side ${position.side.toLowerCase()}`}>{position.side.toUpperCase()}</span></td>
                    <td className="mono-value">{position.shares}</td>
                    <td><span className={`phase-badge ${position.phase}`}>{position.phase}</span></td>
                    <td className="mono-value">{position.estimatedValue ? `$${position.estimatedValue}` : position.claimable ? `~$${position.shares}` : "—"}</td>
                    <td>{position.claimed ? <span className="claimed"><Check size={12} />Claimed</span> : position.claimable ? <span className="claimable"><CircleDollarSign size={12} />Claimable</span> : <span className="settled">Monitoring</span>}</td>
                    <td>
                      {position.claimable && !position.claimed ? (
                        <button className="claim-button" disabled={working} onClick={() => claimPosition(position)}>
                          {working ? <LoaderCircle className="spin" size={13} /> : "Claim"}<ArrowRight size={13} />
                        </button>
                      ) : <span className="row-dash">—</span>}
                    </td>
                  </tr>
                );
              })}
              {!positions.length && <tr><td colSpan={7} className="portfolio-empty">No Panta positions found for this wallet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <p className="portfolio-disclaimer"><ShieldCheck size={13} />Estimated values are indicative. Claimable winning shares settle near one USDC per share.</p>
    </section>
  );
}

async function postJson<T = unknown>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { detail?: string; code?: string };
  if (!response.ok) throw new Error(payload.detail ?? payload.code ?? `Request failed (${response.status})`);
  return payload;
}
