import { NextResponse } from "next/server";
import { markets as demoMarkets } from "@/lib/market-data";
import { fetchPantaMarkets, normalizePantaMarket } from "@/lib/panta";

export async function GET() {
  try {
    const rawMarkets = await fetchPantaMarkets();
    const sandbox = rawMarkets.some((market) => {
      const id = String(market.marketId ?? market.id ?? "");
      const title = String(market.title ?? market.question ?? "");
      return id.startsWith("TestMarket") || /\bsandbox\b|\btest market\b/i.test(title);
    });
    return NextResponse.json({
      source: sandbox ? "panta-sandbox" : "panta",
      markets: rawMarkets.map(normalizePantaMarket),
    });
  } catch (error) {
    return NextResponse.json({
      source: "demo",
      markets: demoMarkets,
      notice:
        error instanceof Error ? error.message : "Panta API is unavailable",
    });
  }
}
