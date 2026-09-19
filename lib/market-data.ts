export type Market = {
  id: string;
  category: "Solana" | "Crypto" | "Macro";
  question: string;
  yesPrice: number;
  change: number;
  volume: string;
  closes: string;
  relatedAssets: string[];
};

export type Token = {
  symbol: string;
  name: string;
  price: string;
  change: number;
  marketCap: string;
  signal: "Bullish" | "Neutral" | "Caution";
  eventRisk: number;
  points: number[];
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
    symbol: "SOL",
    name: "Solana",
    price: "$238.42",
    change: 5.84,
    marketCap: "$113.8B",
    signal: "Bullish",
    eventRisk: 78,
    points: [22, 24, 23, 28, 26, 31, 35, 33, 39, 42, 47, 51],
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    price: "$1.18",
    change: 3.12,
    marketCap: "$3.6B",
    signal: "Bullish",
    eventRisk: 72,
    points: [18, 19, 17, 21, 23, 22, 27, 26, 29, 31, 30, 34],
  },
  {
    symbol: "JTO",
    name: "Jito",
    price: "$3.06",
    change: -1.44,
    marketCap: "$1.1B",
    signal: "Neutral",
    eventRisk: 54,
    points: [29, 31, 32, 30, 27, 28, 25, 26, 24, 23, 25, 24],
  },
  {
    symbol: "PYTH",
    name: "Pyth Network",
    price: "$0.41",
    change: -4.08,
    marketCap: "$1.5B",
    signal: "Caution",
    eventRisk: 36,
    points: [41, 39, 38, 36, 37, 33, 34, 31, 29, 30, 27, 25],
  },
];

export const pulsePoints = [
  42, 45, 43, 49, 53, 51, 56, 60, 58, 64, 68, 66, 71, 75, 73, 79, 82,
];
