export type Market = {
  id: string;
  category: string;
  question: string;
  yesPrice: number;
  change: number;
  volume: string;
  closes: string;
  relatedAssets: string[];
};

export type Token = {
  address: string;
  symbol: string;
  name: string;
  price: string;
  priceUsd: number;
  change: number;
  marketCap: string;
  marketCapUsd: number;
  volume24h: string;
  volume24hUsd: number;
  liquidity: string;
  liquidityUsd: number;
  signal: "Bullish" | "Neutral" | "Caution";
  eventRisk: number;
};

export const markets: Market[] = [
  {
    id: "sol-300",
    category: "Solana",
    question: "Will SOL trade above $300 before December?",
    yesPrice: 0.68,
    change: 8.4,
    volume: "$428K",
    closes: "72 days",
    relatedAssets: ["SOL", "JUP"],
  },
  {
    id: "etf-approval",
    category: "Crypto",
    question: "Will a spot Solana ETF launch this year?",
    yesPrice: 0.74,
    change: 3.1,
    volume: "$1.2M",
    closes: "103 days",
    relatedAssets: ["SOL", "JTO"],
  },
  {
    id: "fed-cut",
    category: "Macro",
    question: "Will the Fed cut rates at the next meeting?",
    yesPrice: 0.42,
    change: -5.7,
    volume: "$3.8M",
    closes: "11 days",
    relatedAssets: ["SOL", "USDC"],
  },
  {
    id: "tps-record",
    category: "Solana",
    question: "Will Solana set a new daily TPS record this quarter?",
    yesPrice: 0.61,
    change: 12.2,
    volume: "$96K",
    closes: "41 days",
    relatedAssets: ["SOL", "JTO"],
  },
];

export const tokens: Token[] = [
  {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    price: "$238.42",
    priceUsd: 238.42,
    change: 5.84,
    marketCap: "$113.8B",
    marketCapUsd: 113_800_000_000,
    volume24h: "$139.1M",
    volume24hUsd: 139_100_000,
    liquidity: "$26.3M",
    liquidityUsd: 26_300_000,
    signal: "Bullish",
    eventRisk: 78,
  },
  {
    address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    symbol: "JUP",
    name: "Jupiter",
    price: "$1.18",
    priceUsd: 1.18,
    change: 3.12,
    marketCap: "$3.6B",
    marketCapUsd: 3_600_000_000,
    volume24h: "$3.0M",
    volume24hUsd: 3_000_000,
    liquidity: "$715K",
    liquidityUsd: 715_000,
    signal: "Bullish",
    eventRisk: 72,
  },
  {
    address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL",
    symbol: "JTO",
    name: "Jito",
    price: "$3.06",
    priceUsd: 3.06,
    change: -1.44,
    marketCap: "$1.1B",
    marketCapUsd: 1_100_000_000,
    volume24h: "$2.1M",
    volume24hUsd: 2_100_000,
    liquidity: "$186K",
    liquidityUsd: 186_000,
    signal: "Neutral",
    eventRisk: 54,
  },
  {
    address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3",
    symbol: "PYTH",
    name: "Pyth Network",
    price: "$0.41",
    priceUsd: 0.41,
    change: -4.08,
    marketCap: "$1.5B",
    marketCapUsd: 1_500_000_000,
    volume24h: "$3.1M",
    volume24hUsd: 3_100_000,
    liquidity: "$398K",
    liquidityUsd: 398_000,
    signal: "Caution",
    eventRisk: 36,
  },
];
