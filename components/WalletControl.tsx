"use client";

import { ChevronDown } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

export function WalletControl() {
  const { publicKey, connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const address = publicKey?.toBase58();
  const label = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "Connect wallet";

  async function handleClick() {
    if (connected) {
      await disconnect();
    } else {
      setVisible(true);
    }
  }

  return (
    <button
      className={`wallet-button ${connected ? "connected" : ""}`}
      onClick={handleClick}
      disabled={connecting}
      title={connected ? "Disconnect wallet" : "Connect a Solana wallet"}
    >
      <span className="wallet-glyph" />
      {connecting ? "Connecting…" : label}
      <ChevronDown size={14} />
    </button>
  );
}
