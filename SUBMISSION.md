# SolanaLens — Hackathon Submission Brief

## One-line pitch

SolanaLens is an event-risk intelligence terminal that combines live Solana
market data with Panta prediction-market probabilities, then lets users act on
the insight through a non-custodial YES/NO trading flow.

## Problem

Crypto traders can see price, volume, and liquidity, but those metrics rarely
explain the real-world expectations behind a move. Prediction markets contain
useful forward-looking information, yet they are usually isolated from the
asset-research workflow. A trader must move between tools, manually connect
events to assets, and interpret probabilities without context.

## Solution

SolanaLens places asset and event intelligence in one workflow:

- Live SOL, JUP, JTO, and PYTH market metrics
- Related Panta events with current YES/NO probabilities
- A transparent composite score using Panta probability (50%), 24-hour asset
  momentum (30%), and DEX liquidity quality (20%)
- Non-custodial Panta quote, build, wallet-sign, broadcast, submit, verify, and
  attribution flow
- Wallet positions, claim eligibility, and winnings claims
- Local probability watchlists that flag moves of five percentage points

The score is an informational signal, not a price forecast or financial advice.

## Panta API integration

Panta is a core product dependency rather than a decorative data source.
SolanaLens uses it for:

1. Market discovery and current market prices
2. Primary YES/NO order quotes
3. Unsigned transaction and instruction construction
4. Order submission and on-chain verification
5. Trade attribution
6. Wallet positions
7. Claim-eligibility checks
8. Winnings claim construction and attribution

The Panta API key remains server-side. Panta returns unsigned instructions;
the connected wallet signs locally, SolanaLens broadcasts through a Solana RPC,
and the resulting signature is submitted to Panta. SolanaLens never takes
custody of user wallets or private keys.

## Technical architecture

![SolanaLens architecture](./docs/architecture.svg)

- **Frontend:** Next.js, React, TypeScript, custom responsive CSS
- **Wallets:** Solana Wallet Adapter with Phantom and Solflare
- **Transactions:** `@solana/web3.js` versioned transactions
- **Prediction infrastructure:** Panta API
- **Market data:** DEX Screener public API
- **SOL supply:** Solana RPC `getSupply`
- **Secrets:** server-only environment variables and same-origin API routes
- **Reliability:** explicit demo fallback, upstream timeouts, and a production
  smoke suite backed by a local Panta mock; fixtures are never presented as live
- **Security:** input validation, payload limits, route allowlists,
  non-custodial signing, and dependency audit overrides

## Demo flow

The timed narration and shot list are available in
[`docs/demo-script.md`](./docs/demo-script.md).

1. Open the overview and identify the live DEX-data badge.
2. Explain the ecosystem score and expand its methodology.
3. Search for SOL or JUP and review price, volume, liquidity, and event score.
4. Select a Panta event and show its YES/NO probability and related assets.
5. Save a five-point probability watch and open the event watchlist.
6. Connect Phantom or Solflare.
7. Open the trade panel, choose YES or NO, and request a live Panta quote.
8. Review expected shares and fees, then sign the Panta-built transaction.
9. Show the verified transaction and attributed trade.
10. Open Portfolio, load wallet positions, and demonstrate a claimable outcome.
11. Build, sign, and broadcast the winnings claim.

Do not record private keys, seed phrases, API keys, or sensitive wallet details.

## Judging-criteria alignment

### Panta API integration

Panta drives discovery, probabilities, trading, positions, claims, and
attribution. Removing Panta would remove the product's core event-intelligence
and execution workflow.

### Technical execution

The product has typed API boundaries, server-side secret handling, wallet-based
signing, versioned Solana transactions, loading/error states, responsive UI,
and explicit demo/live data indicators.

### Product and user experience

Research and execution are presented in one terminal. The interface explains
the signal formula, makes data sources visible, and keeps the user in control
of every transaction.

### Originality

SolanaLens treats prediction-market probabilities as a cross-asset event-risk
signal instead of presenting Panta as a standalone prediction-market clone.

### Impact potential

The same event layer can support trading terminals, research platforms,
treasury dashboards, creator communities, and token-specific risk alerts.

### Traction

Do not claim traction without evidence. Before submission, collect attributable
tester feedback and report real counts for connected testers, quotes requested,
trades completed, watchlists saved, and claims tested.

## Submission copy

**SolanaLens turns prediction-market probabilities into actionable Solana
market intelligence.** The terminal combines live token price, volume,
liquidity, and market-cap data with related Panta events, producing a transparent
event-to-asset signal. Users can discover a market, understand its relationship
to SOL ecosystem assets, save a probability watch, request a live Panta quote,
and complete a non-custodial YES/NO trade from the same interface. SolanaLens
also reads wallet positions and supports Panta winnings claims. Panta powers the
core market discovery, pricing, transaction-building, verification, positions,
claims, and attribution flows.

## Final checklist

- [ ] Add `PANTA_API_KEY` through the deployment secret manager
- [ ] Add a production Solana RPC endpoint
- [ ] Verify live market response normalization
- [ ] Complete a test quote/build/sign/submit/verify transaction
- [ ] Test positions and a claimable market with a dedicated test wallet
- [ ] Confirm mobile layout and wallet deep-link behavior
- [ ] Add a public demo URL to README and both submissions
- [ ] Record a demo using the flow in this document
- [ ] Add final product screenshots
- [x] Add architecture diagram
- [ ] Collect and document genuine tester feedback
- [ ] Submit to the official Colosseum hackathon
- [ ] Submit separately to the Panta Side Track on Superteam Earn
- [ ] Ensure every submitted field is in English
- [ ] Revoke or rotate test credentials if exposed during recording
