import type { Market, Token } from "./market-data";

export function scoreTokenWithEvents(token: Token, markets: Market[]): Token {
  const relatedMarkets = markets.filter((market) =>
    market.relatedAssets.some((asset) => asset.toUpperCase() === token.symbol),
  );
  const pantaProbability = relatedMarkets.length
    ? relatedMarkets.reduce((sum, market) => sum + market.yesPrice * 100, 0) / relatedMarkets.length
    : 50;
  const momentum = clamp(50 + token.change * 3, 0, 100);
  const liquidityQuality = clamp(Math.log10(Math.max(token.liquidityUsd, 1)) * 12 - 22, 0, 100);
  const eventRisk = Math.round(pantaProbability * 0.5 + momentum * 0.3 + liquidityQuality * 0.2);
  const signal: Token["signal"] = eventRisk >= 65 ? "Bullish" : eventRisk < 42 ? "Caution" : "Neutral";

  return { ...token, eventRisk, signal };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
