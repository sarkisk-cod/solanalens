import { NextResponse } from "next/server";
import { markets as demoMarkets } from "@/lib/market-data";
import { fetchPantaMarkets, normalizePantaMarket } from "@/lib/panta";

export async function GET() {
  try {
    const rawMarkets = await fetchPantaMarkets();
    return NextResponse.json({
      source: "panta",
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
