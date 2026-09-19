import type { Market } from "./market-data";

const API_BASE_URL =
  process.env.PANTA_API_BASE_URL ?? "https://live-api.panta.market/api/v1";

type PantaMarket = Record<string, unknown>;

export async function fetchPantaMarkets(): Promise<PantaMarket[]> {
  const apiKey = process.env.PANTA_API_KEY;

  if (!apiKey) {
    throw new Error("PANTA_API_KEY is not configured");
  }

  const response = await fetch(`${API_BASE_URL}/markets/`, {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Panta API returned ${response.status}`);
  }

  const payload = (await response.json()) as
    | PantaMarket[]
    | { results?: PantaMarket[] };

  return Array.isArray(payload) ? payload : (payload.results ?? []);
}

export function normalizePantaMarket(item: PantaMarket, index: number): Market {
  const yesPrice = Number(item.yesPrice ?? item.yes_price ?? 0.5);
  const relatedAssets = Array.isArray(item.relatedAssets)
    ? item.relatedAssets.map(String)
    : ["SOL"];

  return {
    id: String(item.id ?? item.marketId ?? `panta-${index}`),
    category: "Crypto",
    question: String(item.question ?? item.title ?? "Untitled Panta market"),
    yesPrice: Number.isFinite(yesPrice) ? yesPrice : 0.5,
    change: Number(item.change24h ?? 0),
    volume: String(item.volume ?? item.volumeUsdc ?? "—"),
    closes: String(item.closes ?? item.endTime ?? "Open"),
    relatedAssets,
  };
}
