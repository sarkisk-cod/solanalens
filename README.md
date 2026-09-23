# SolanaLens

**See the event behind the move.**

SolanaLens is an event-risk intelligence terminal for Solana traders. It pairs
asset data with Panta prediction-market probabilities so users can understand
what the market expects, connect those expectations to Solana assets, and take
a YES or NO position without leaving the research workflow.

Built for the Colosseum Crypto World's Fair and the Panta API Side Track.

## Product thesis

Price charts show what happened. Prediction markets can help explain what the
market believes may happen next. SolanaLens turns that signal into a focused
workflow:

1. Monitor Solana ecosystem momentum.
2. Discover events related to an asset.
3. Compare probability, price movement, and conviction.
4. Trade the outcome through Panta's non-custodial transaction flow.
5. Track positions and claim eligible winnings.

## Current MVP

- Responsive market-intelligence dashboard
- Searchable Solana asset watchlist
- Event probability cards and selected-market analysis
- Interactive YES/NO trade preview
- Server-only Panta API proxy with safe demo fallback
- Phantom and Solflare wallet connection
- Live Panta quote and unsigned-transaction build flow
- Wallet signing, Solana RPC broadcast, submit, verify, and trade attribution
- Wallet portfolio with live Panta positions and estimated claim value
- Claim-eligibility display and non-custodial winnings claim flow
- Clear live/demo data-source indicator
- Accessible mobile navigation and reduced-motion support

## Panta integration

The routes under `app/api/panta` call Panta from the server, keeping the API key
out of the browser. Market discovery safely falls back to clearly labelled demo
data when the key is unavailable. Trading remains disabled in demo mode.

Planned transaction flow:

`quote → build unsigned transaction → wallet signs → RPC broadcasts → report signature`

The wallet remains non-custodial throughout the flow.

## Stack

- Next.js 16 and React 19
- TypeScript
- Custom responsive CSS design system
- Panta API on Solana

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add the test key only to `.env.local`:

```env
PANTA_API_KEY=pk_test_your_key
```

Never expose this key with a `NEXT_PUBLIC_` prefix or commit `.env.local`.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Roadmap

- Confirm live catalog and transaction responses with a test key
- Replace asset fixtures with a production market-data provider
- Add event-to-asset relevance scoring and saved alerts
- Capture early-user feedback and usage evidence for the submission

## Status

The repository contains the working MVP interface, Solana wallet connection,
the complete Panta primary-buy path, wallet positions, and winnings claims.
Live API verification still requires the server-side test key.
