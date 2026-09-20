"use client";

import { useState } from "react";
import { ArrowRight, Check, CircleDollarSign, LoaderCircle, ShieldCheck, X } from "lucide-react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import type { Market } from "@/lib/market-data";
import type { PrimaryBuild, PrimaryQuote, TradeProgress } from "@/lib/panta-types";
import { instructionsToVersionedTransaction } from "@/lib/solana-transaction";

type TradeModalProps = {
  market: Market;
  live: boolean;
  onClose: () => void;
};

export function TradeModal({ market, live, onClose }: TradeModalProps) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("20.00");
  const [progress, setProgress] = useState<TradeProgress>("idle");
  const [quote, setQuote] = useState<PrimaryQuote>();
  const [signature, setSignature] = useState<string>();
  const [error, setError] = useState<string>();
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  const busy = ["quoting", "building", "signing", "submitting"].includes(progress);

  function resetQuote(nextSide?: "YES" | "NO", nextAmount?: string) {
    if (nextSide) setSide(nextSide);
    if (nextAmount !== undefined) setAmount(nextAmount);
    setQuote(undefined);
    setError(undefined);
    setProgress("idle");
  }

  async function requestQuote() {
    if (!connected || !publicKey) {
      setVisible(true);
      return;
    }
    if (!live) {
      setError("Live Panta data is not configured yet. Add the API key to the server environment to enable trading.");
      return;
    }
    const amountNumber = Number(amount);
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || !Number.isFinite(amountNumber) || amountNumber <= 0 || amountNumber > 10_000) {
      setError("Enter a USDC amount between 0.01 and 10,000 with up to two decimals.");
      return;
    }

    setProgress("quoting");
    setError(undefined);
    try {
      const data = await postPanta<PrimaryQuote>("quote", {
        wallet: publicKey.toBase58(),
        marketId: market.id,
        side: side.toLowerCase(),
        amountUsdc: amountNumber.toFixed(2),
      });
      setQuote(data);
      setProgress("quoted");
    } catch (tradeError) {
      setError(describeError(tradeError));
      setProgress("error");
    }
  }

  async function executeTrade() {
    if (!quote || !publicKey || !signTransaction) return;
    setError(undefined);
    try {
      setProgress("building");
      const build = await postPanta<PrimaryBuild>("build", {
        quoteId: quote.quoteId,
        wallet: publicKey.toBase58(),
        maxSlippageBps: 100,
      });

      setProgress("signing");
      const transaction = instructionsToVersionedTransaction(
        build.instructions,
        publicKey,
        build.recentBlockhash,
      );
      const signed = await signTransaction(transaction);
      const transactionSignature = await connection.sendRawTransaction(
        signed.serialize(),
        { skipPreflight: false, preflightCommitment: "confirmed" },
      );
      setSignature(transactionSignature);

      await connection.confirmTransaction(transactionSignature, "confirmed");
      setProgress("submitting");
      const receipt = {
        orderId: build.orderId,
        signature: transactionSignature,
        wallet: publicKey.toBase58(),
      };
      await postPanta("submit", receipt);
      await postPanta("verify", receipt);
      await postPanta("report", {
        signature: transactionSignature,
        wallet: publicKey.toBase58(),
        marketId: market.id,
        quoteId: quote.quoteId,
        clientOrderId: build.orderId,
      });
      setProgress("complete");
    } catch (tradeError) {
      setError(describeError(tradeError));
      setProgress("error");
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="trade-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="trade-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close trade panel"><X size={18} /></button>
        <span className="eyebrow"><CircleDollarSign size={14} /> Panta primary market</span>
        <h2 id="trade-title">Take a position</h2>
        <p className="trade-question">{market.question}</p>

        <div className="trade-steps" aria-label="Trade progress">
          <span className={progress !== "idle" ? "done" : "active"}>1 Quote</span>
          <i />
          <span className={["signing", "submitting", "complete"].includes(progress) ? "done" : quote ? "active" : ""}>2 Sign</span>
          <i />
          <span className={progress === "complete" ? "done" : progress === "submitting" ? "active" : ""}>3 Verify</span>
        </div>

        <div className="side-switch">
          <button disabled={busy} className={side === "YES" ? "active yes" : ""} onClick={() => resetQuote("YES")}>
            <span>YES</span><strong>{Math.round(market.yesPrice * 100)}¢</strong>
          </button>
          <button disabled={busy} className={side === "NO" ? "active no" : ""} onClick={() => resetQuote("NO")}>
            <span>NO</span><strong>{Math.round((1 - market.yesPrice) * 100)}¢</strong>
          </button>
        </div>

        <label className="amount-input">
          <span>Amount</span>
          <div><input value={amount} onChange={(event) => resetQuote(undefined, event.target.value)} disabled={busy} inputMode="decimal" /><strong>USDC</strong></div>
        </label>

        {quote ? (
          <div className="quote-receipt">
            <div><span>Estimated shares</span><strong>{quote.shares}</strong></div>
            <div><span>Average price</span><strong>{quote.avgPrice}</strong></div>
            <div><span>Panta fee</span><strong>{quote.feeUsdc} USDC</strong></div>
          </div>
        ) : (
          <div className="trade-summary">
            <span>Indicative probability<strong>{side === "YES" ? Math.round(market.yesPrice * 100) : Math.round((1 - market.yesPrice) * 100)}%</strong></span>
            <span>Slippage limit<strong>1.00%</strong></span>
          </div>
        )}

        {error && <div className="trade-error" role="alert">{error}</div>}

        {progress === "complete" ? (
          <div className="trade-success">
            <span><Check size={18} /></span>
            <div><strong>Position confirmed</strong><p>Your trade was broadcast and verified by Panta.</p></div>
            {signature && <a href={`https://solscan.io/tx/${signature}`} target="_blank" rel="noreferrer">View transaction</a>}
          </div>
        ) : (
          <button
            className="trade-button modal-trade"
            disabled={busy}
            onClick={!connected ? () => setVisible(true) : quote ? executeTrade : requestQuote}
          >
            {busy && <LoaderCircle className="spin" size={16} />}
            {progress === "quoting" && "Getting live quote…"}
            {progress === "building" && "Building transaction…"}
            {progress === "signing" && "Confirm in wallet…"}
            {progress === "submitting" && "Verifying on-chain…"}
            {!busy && (!connected ? "Connect wallet to continue" : quote ? `Review & buy ${side}` : live ? "Get live quote" : "Preview requires live Panta data")}
            {!busy && <ArrowRight size={16} />}
          </button>
        )}
        <p className="custody-note"><ShieldCheck size={14} />You remain in control. Your wallet signs every transaction.</p>
      </section>
    </div>
  );
}

async function postPanta<T = unknown>(action: string, body: unknown): Promise<T> {
  const response = await fetch(`/api/panta/trade/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { code?: string; detail?: string };
  if (!response.ok) throw new Error(payload.detail ?? payload.code ?? `Request failed (${response.status})`);
  return payload;
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    if (/reject|declin|cancel/i.test(error.message)) return "The wallet signature was cancelled.";
    return error.message;
  }
  return "The trade could not be completed.";
}
