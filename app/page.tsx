"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  BookOpen,
  Command,
  ExternalLink,
  Gauge,
  Layers3,
  Menu,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { MarketCard } from "@/components/MarketCard";
import { SignalDial } from "@/components/SignalDial";
import { Sparkline } from "@/components/Sparkline";
import { TradeModal } from "@/components/TradeModal";
import { WalletControl } from "@/components/WalletControl";
import { markets as fallbackMarkets, pulsePoints, tokens, type Market } from "@/lib/market-data";

export default function Dashboard() {
  const [marketList, setMarketList] = useState(fallbackMarkets);
  const [selectedMarket, setSelectedMarket] = useState<Market>(fallbackMarkets[0]);
  const [source, setSource] = useState<"demo" | "panta">("demo");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);

  useEffect(() => {
    fetch("/api/panta/markets")
      .then((response) => response.json())
      .then((payload: { source?: "demo" | "panta"; markets?: Market[] }) => {
        if (payload.markets?.length) {
          setMarketList(payload.markets);
          setSelectedMarket(payload.markets[0]);
          setSource(payload.source ?? "demo");
        }
      })
      .catch(() => setSource("demo"));
  }, []);

  const visibleTokens = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tokens;
    return tokens.filter((token) =>
      `${token.symbol} ${token.name}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  function openTrade(market: Market) {
    setSelectedMarket(market);
    setTradeOpen(true);
  }

  return (
    <main className="app-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand-row">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">SOLANA<span>LENS</span></span>
          <button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="primary-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><Gauge size={18} />Overview<span className="nav-pip" /></a>
          <a className="nav-item" href="#markets"><Radio size={18} />Event markets</a>
          <a className="nav-item" href="#assets"><Layers3 size={18} />Asset lens</a>
          <a className="nav-item" href="#portfolio"><WalletCards size={18} />Portfolio</a>
        </nav>

        <div className="sidebar-label">Intelligence</div>
        <nav className="secondary-nav">
          <a className="nav-item" href="#signals"><Sparkles size={18} />Signal feed</a>
          <a className="nav-item" href="#research"><BookOpen size={18} />Research notes</a>
        </nav>

        <div className="sidebar-status">
          <div className="status-orbit"><span /><Radio size={17} /></div>
          <div><strong>Panta feed</strong><span>{source === "panta" ? "Live connection" : "Demo mode"}</span></div>
          <span className={`live-dot ${source}`} />
        </div>

        <div className="sidebar-foot">
          <span>Network</span><strong><span className="network-dot" />Solana Mainnet</strong>
        </div>
      </aside>

      {mobileOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}

      <section className="workspace">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19} /></button>
          <label className="global-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search assets, events or markets" />
            <kbd><Command size={11} />K</kbd>
          </label>
          <div className="topbar-actions">
            <button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><span /></button>
            <WalletControl />
          </div>
        </header>

        <div className="content" id="overview">
          <section className="overview-head">
            <div>
              <span className="eyebrow"><span /> Market intelligence terminal</span>
              <h1>See the event<br /><em>behind the move.</em></h1>
              <p>Solana market data, sharpened by live prediction-market probabilities.</p>
            </div>
            <div className="as-of"><span>Market pulse</span><strong>SEP 19 · 10:42 UTC</strong></div>
          </section>

          <section className="pulse-panel">
            <div className="pulse-main">
              <div className="section-kicker"><Activity size={15} /> SOLANA ECOSYSTEM PULSE</div>
              <div className="pulse-score"><strong>76.4</strong><span className="delta up">+4.8 today</span></div>
              <p>Event markets are pricing a constructive outlook, led by ETF and network-growth expectations.</p>
              <div className="pulse-chart">
                <Sparkline points={pulsePoints} />
                <span className="chart-label high">76.4</span>
                <span className="chart-label low">41.0</span>
              </div>
              <div className="chart-range"><span>24H</span><span>7D</span><span className="active">30D</span><span>90D</span></div>
            </div>
            <div className="pulse-side">
              <div className="pulse-side-top"><SignalDial value={76} label="Bullish" /><div><span>Lens signal</span><strong>Risk-on</strong><p>High agreement across asset momentum and Panta markets.</p></div></div>
              <div className="signal-metrics">
                <div><span>Market breadth</span><strong>68%</strong><i style={{ "--value": "68%" } as React.CSSProperties} /></div>
                <div><span>Event confidence</span><strong>82%</strong><i style={{ "--value": "82%" } as React.CSSProperties} /></div>
                <div><span>Volatility risk</span><strong>44%</strong><i className="warn" style={{ "--value": "44%" } as React.CSSProperties} /></div>
              </div>
              <button className="text-action">Open signal methodology <ArrowRight size={14} /></button>
            </div>
          </section>

          <section className="section-block" id="assets">
            <div className="section-heading">
              <div><span className="section-index">01</span><h2>Asset lens</h2><p>Price action interpreted through event-market conviction.</p></div>
              <button className="ghost-button">View all assets <ArrowRight size={14} /></button>
            </div>
            <div className="asset-table-wrap">
              <table className="asset-table">
                <thead><tr><th>Asset</th><th>Price</th><th>24h</th><th>30d path</th><th>Market cap</th><th>Lens signal</th><th>Event score</th></tr></thead>
                <tbody>
                  {visibleTokens.map((token) => (
                    <tr key={token.symbol}>
                      <td><span className={`token-icon token-${token.symbol.toLowerCase()}`}>{token.symbol.slice(0, 1)}</span><span className="token-name"><strong>{token.symbol}</strong><small>{token.name}</small></span></td>
                      <td className="mono-value">{token.price}</td>
                      <td><span className={token.change >= 0 ? "delta up" : "delta down"}>{token.change >= 0 ? "+" : ""}{token.change.toFixed(2)}%</span></td>
                      <td><Sparkline className="table-spark" points={token.points} positive={token.change >= 0} /></td>
                      <td className="mono-value muted">{token.marketCap}</td>
                      <td><span className={`signal-badge ${token.signal.toLowerCase()}`}><span />{token.signal}</span></td>
                      <td><span className="event-score"><strong>{token.eventRisk}</strong><span><i style={{ width: `${token.eventRisk}%` }} /></span></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!visibleTokens.length && <div className="empty-state">No asset matches “{query}”.</div>}
            </div>
          </section>

          <section className="section-block" id="markets">
            <div className="section-heading">
              <div><span className="section-index">02</span><h2>Event radar</h2><p>What prediction markets are saying about Solana next.</p></div>
              <div className="source-badge"><span className={`live-dot ${source}`} />{source === "panta" ? "Live Panta data" : "Panta demo data"}</div>
            </div>

            <div className="market-layout">
              <div className="market-grid">
                {marketList.slice(0, 4).map((market) => (
                  <MarketCard key={market.id} market={market} active={market.id === selectedMarket.id} onSelect={setSelectedMarket} />
                ))}
              </div>

              <aside className="decision-panel">
                <div className="decision-topline"><span>Selected market</span><ExternalLink size={14} /></div>
                <div className="asset-pills">{selectedMarket.relatedAssets.map((asset) => <span key={asset}>{asset}</span>)}</div>
                <h3>{selectedMarket.question}</h3>
                <div className="outcome-split">
                  <div className="yes"><span>YES</span><strong>{Math.round(selectedMarket.yesPrice * 100)}¢</strong><small>{Math.round(selectedMarket.yesPrice * 100)}% chance</small></div>
                  <div className="no"><span>NO</span><strong>{Math.round((1 - selectedMarket.yesPrice) * 100)}¢</strong><small>{Math.round((1 - selectedMarket.yesPrice) * 100)}% chance</small></div>
                </div>
                <div className="market-insight"><Sparkles size={17} /><p><strong>Lens read</strong>The market is leaning positive. Conviction rose {Math.abs(selectedMarket.change).toFixed(1)} points as related asset momentum accelerated.</p></div>
                <button className="trade-button" onClick={() => openTrade(selectedMarket)}>Trade this outcome <ArrowRight size={16} /></button>
                <div className="panta-credit"><ShieldCheck size={14} />Powered by Panta infrastructure</div>
              </aside>
            </div>
          </section>

          <footer className="footer">
            <div className="footer-brand"><span className="brand-mark mini"><span /></span><strong>SOLANALENS</strong></div>
            <p>Probabilities are market signals, not financial advice.</p>
            <div><a href="https://docs.panta.market/" target="_blank" rel="noreferrer">Panta API</a><a href="https://colosseum.com/arena/projects/solanalens" target="_blank" rel="noreferrer">Colosseum</a></div>
          </footer>
        </div>
      </section>

      {tradeOpen && <TradeModal market={selectedMarket} live={source === "panta"} onClose={() => setTradeOpen(false)} />}
    </main>
  );
}
