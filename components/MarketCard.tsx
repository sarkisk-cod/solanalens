import { ArrowDownRight, ArrowUpRight, Clock3 } from "lucide-react";
import type { Market } from "@/lib/market-data";

type MarketCardProps = {
  market: Market;
  active?: boolean;
  onSelect: (market: Market) => void;
};

export function MarketCard({ market, active, onSelect }: MarketCardProps) {
  const rising = market.change >= 0;

  return (
    <button className={`market-card ${active ? "active" : ""}`} onClick={() => onSelect(market)}>
      <span className="market-card-topline">
        <span className="category-tag">{market.category}</span>
        <span className={rising ? "delta up" : "delta down"}>
          {rising ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(market.change).toFixed(1)}%
        </span>
      </span>
      <span className="market-question">{market.question}</span>
      <span className="probability-row">
        <span className="probability-copy">
          <strong>{Math.round(market.yesPrice * 100)}%</strong>
          <small>YES probability</small>
        </span>
        <span className="probability-track" aria-hidden="true">
          <span style={{ width: `${market.yesPrice * 100}%` }} />
        </span>
      </span>
      <span className="market-meta">
        <span>{market.volume} volume</span>
        <span><Clock3 size={12} /> {market.closes}</span>
      </span>
    </button>
  );
}
