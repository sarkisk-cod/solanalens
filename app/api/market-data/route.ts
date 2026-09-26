import { NextResponse } from "next/server";
import { tokens as demoTokens, type Token } from "@/lib/market-data";

const DEXSCREENER_BASE = "https://api.dexscreener.com/tokens/v1/solana";
const ADDRESSES = demoTokens.map((token) => token.address).join(",");

type DexPair = {
  chainId?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  priceUsd?: string | null;
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number } | null;
  marketCap?: number | null;
};

export async function GET() {
  try {
    const [response, solCirculatingSupply] = await Promise.all([
      fetch(`${DEXSCREENER_BASE}/${ADDRESSES}`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 30 },
      }),
      fetchSolCirculatingSupply(),
    ]);
    if (!response.ok) throw new Error(`DEX Screener returned ${response.status}`);
    const pairs = (await response.json()) as DexPair[];
    const liveTokens = demoTokens.map((fallback) => {
      const candidates = pairs.filter(
        (pair) => pair.chainId === "solana" && pair.baseToken?.address === fallback.address,
      );
      const pair = candidates.sort(
        (a, b) => Number(b.liquidity?.usd ?? 0) - Number(a.liquidity?.usd ?? 0),
      )[0];
      return pair ? normalizePair(pair, fallback, solCirculatingSupply) : fallback;
    });

    return NextResponse.json({ source: "dexscreener", tokens: liveTokens });
  } catch (error) {
    return NextResponse.json({
      source: "demo",
      tokens: demoTokens,
      notice: error instanceof Error ? error.message : "Market data is unavailable",
    });
  }
}

function normalizePair(pair: DexPair, fallback: Token, solCirculatingSupply: number | null): Token {
  const priceUsd = finiteNumber(pair.priceUsd, fallback.priceUsd);
  const change = finiteNumber(pair.priceChange?.h24, fallback.change);
  const marketCapUsd = fallback.symbol === "SOL"
    ? solCirculatingSupply ? priceUsd * solCirculatingSupply : 0
    : finiteNumber(pair.marketCap, fallback.marketCapUsd);
  const volume24hUsd = finiteNumber(pair.volume?.h24, fallback.volume24hUsd);
  const liquidityUsd = finiteNumber(pair.liquidity?.usd, fallback.liquidityUsd);
  return {
    ...fallback,
    name: pair.baseToken?.name ?? fallback.name,
    symbol: pair.baseToken?.symbol ?? fallback.symbol,
    price: formatPrice(priceUsd),
    priceUsd,
    change,
    marketCap: marketCapUsd ? formatCompactUsd(marketCapUsd) : "—",
    marketCapUsd,
    volume24h: formatCompactUsd(volume24hUsd),
    volume24hUsd,
    liquidity: formatCompactUsd(liquidityUsd),
    liquidityUsd,
  };
}

function finiteNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function formatPrice(value: number) {
  const minimumFractionDigits = value >= 1 ? 2 : 4;
  const maximumFractionDigits = value >= 100 ? 2 : value >= 1 ? 3 : 5;
  return `$${value.toLocaleString("en-US", { minimumFractionDigits, maximumFractionDigits })}`;
}

function formatCompactUsd(value: number) {
  return `$${new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;
}

async function fetchSolCirculatingSupply(): Promise<number | null> {
  try {
    const rpcUrl = process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: "solanalens-supply", method: "getSupply" }),
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as { result?: { value?: { circulating?: number } } };
    const lamports = Number(payload.result?.value?.circulating);
    return Number.isFinite(lamports) ? lamports / 1_000_000_000 : null;
  } catch {
    return null;
  }
}
