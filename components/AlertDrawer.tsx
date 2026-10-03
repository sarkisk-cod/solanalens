"use client";

import { Bell, Check, Trash2, X } from "lucide-react";
import type { Market } from "@/lib/market-data";

export type SavedAlert = {
  marketId: string;
  question: string;
  baselineProbability: number;
  thresholdPoints: number;
  createdAt: string;
};

type AlertDrawerProps = {
  alerts: SavedAlert[];
  markets: Market[];
  onRemove: (marketId: string) => void;
  onClose: () => void;
};

export function AlertDrawer({ alerts, markets, onRemove, onClose }: AlertDrawerProps) {
  return (
    <div className="modal-backdrop alert-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="alert-drawer" role="dialog" aria-modal="true" aria-labelledby="alerts-title" onMouseDown={(event) => event.stopPropagation()}>
        <header>
          <div><span className="alert-icon"><Bell size={17} /></span><div><h2 id="alerts-title">Event watchlist</h2><p>Track meaningful probability moves.</p></div></div>
          <button className="modal-close" onClick={onClose} aria-label="Close watchlist"><X size={18} /></button>
        </header>
        <div className="alert-list">
          {alerts.map((alert) => {
            const current = markets.find((market) => market.id === alert.marketId)?.yesPrice ?? alert.baselineProbability;
            const move = (current - alert.baselineProbability) * 100;
            const triggered = Math.abs(move) >= alert.thresholdPoints;
            return (
              <article className={triggered ? "triggered" : ""} key={alert.marketId}>
                <div className="alert-state">{triggered ? <Bell size={13} /> : <Check size={13} />}{triggered ? "Threshold reached" : "Watching"}</div>
                <h3>{alert.question}</h3>
                <div className="alert-probability"><strong>{Math.round(current * 100)}%</strong><span className={move >= 0 ? "up" : "down"}>{move >= 0 ? "+" : ""}{move.toFixed(1)} pts</span></div>
                <div className="alert-baseline"><span>Started at {Math.round(alert.baselineProbability * 100)}%</span><span>Alert at ±{alert.thresholdPoints} pts</span></div>
                <button onClick={() => onRemove(alert.marketId)}><Trash2 size={13} />Remove</button>
              </article>
            );
          })}
          {!alerts.length && <div className="alerts-empty"><Bell size={25} /><strong>No watched events</strong><p>Open an event and select “Watch probability” to track it here.</p></div>}
        </div>
        <footer>Alerts are evaluated when current Panta market data loads.</footer>
      </aside>
    </div>
  );
}
