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
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`Panta API returned ${response.status}`);
  }

  const payload = (await response.json()) as
    | PantaMarket[]
    | { items?: PantaMarket[]; results?: PantaMarket[] };

  return Array.isArray(payload)
    ? payload
    : (payload.items ?? payload.results ?? []);
}

export function normalizePantaMarket(item: PantaMarket, index: number): Market {
  const rawYesPrice = Number(
    item.yesPrice ?? item.primaryYesPrice ?? item.yes_price ?? 0.5,
  );
  const normalizedYesPrice = rawYesPrice > 1 && rawYesPrice <= 100
    ? rawYesPrice / 100
    : rawYesPrice;
  const yesPrice = Number.isFinite(normalizedYesPrice) && normalizedYesPrice >= 0 && normalizedYesPrice <= 1
    ? normalizedYesPrice
    : 0.5;
  const title = String(item.title ?? item.question ?? "Untitled Panta market");
  const relatedAssets = inferRelatedAssets(title);
  const volumeNumber = Number(item.volumeUsdc ?? item.totalVolumeUsdc);
  const volume = Number.isFinite(volumeNumber)
    ? `$${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(volumeNumber)}`
    : "—";
  const endTime = Number(item.endTime);

  return {
    id: String(item.marketId ?? item.id ?? `panta-${index}`),
    category: String(item.category ?? "Crypto"),
    question: title,
    yesPrice,
    change: finiteNumber(item.change24h),
    volume,
    closes: Number.isFinite(endTime) ? formatTimeRemaining(endTime) : "Open",
    relatedAssets,
  };
}

function finiteNumber(value: unknown): number {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function inferRelatedAssets(title: string): string[] {
  const symbols = ["SOL", "JUP", "JTO", "PYTH", "USDC", "BTC", "ETH"];
  const upper = title.toUpperCase();
  const matches = symbols.filter((symbol) => upper.includes(symbol));
  return matches.length ? matches.slice(0, 3) : ["SOL"];
}

function formatTimeRemaining(unixSeconds: number): string {
  const days = Math.ceil((unixSeconds * 1000 - Date.now()) / 86_400_000);
  if (days <= 0) return "Closing";
  return days === 1 ? "1 day" : `${days} days`;
}
