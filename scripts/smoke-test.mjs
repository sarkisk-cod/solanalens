import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";

const APP_PORT = 3218;
const MOCK_PORT = 3219;
const MOCK_PREFIX = `/run-${process.pid}`;
const appUrl = `http://127.0.0.1:${APP_PORT}`;
const upstreamRequests = [];

// Mock Panta server.
const mockServer = createServer(async (request, response) => {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const bodyText = Buffer.concat(chunks).toString("utf8");
  upstreamRequests.push({
    method: request.method,
    url: request.url,
    apiKey: request.headers["x-api-key"],
    body: bodyText ? JSON.parse(bodyText) : undefined,
  });

  response.setHeader("Content-Type", "application/json");
  if (request.method === "GET" && request.url === `${MOCK_PREFIX}/markets/`) {
    response.end(JSON.stringify({
      items: [{
        marketId: "TestMarket1111111111111111111111111111111",
        category: "Solana",
        title: "Will SOL outperform JUP this month?",
        yesPrice: 68,
        change24h: "4.5",
        volumeUsdc: 125000,
        endTime: Math.floor(Date.now() / 1000) + 172800,
      }],
    }));
    return;
  }
  if (request.method === "POST" && request.url === `${MOCK_PREFIX}/primaryorderquote/`) {
    response.end(JSON.stringify({
      quoteId: "quote-1",
      marketId: "mock-sol-jup",
      side: "yes",
      amountUsdc: "20.00",
      shares: "28.90",
      avgPrice: "0.692",
      feeUsdc: "0.20",
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    }));
    return;
  }
  if (request.method === "GET" && request.url?.startsWith(`${MOCK_PREFIX}/positions/`)) {
    response.end(JSON.stringify({ wallet: TEST_WALLET, positions: [] }));
    return;
  }

  response.statusCode = 404;
  response.end(JSON.stringify({ code: "MOCK_NOT_FOUND" }));
});

const TEST_WALLET = "11111111111111111111111111111111";

// Next.js test server lifecycle.
await new Promise((resolve, reject) => {
  mockServer.once("error", reject);
  mockServer.listen(MOCK_PORT, "127.0.0.1", resolve);
});

const app = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", String(APP_PORT)],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PANTA_API_KEY: "pk_test_smoke_only",
      PANTA_API_BASE_URL: `http://127.0.0.1:${MOCK_PORT}${MOCK_PREFIX}`,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let serverOutput = "";
app.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
app.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

async function waitForApp() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (app.exitCode !== null) throw new Error(`Next.js exited early.\n${serverOutput}`);
    try {
      const response = await fetch(appUrl);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next.js did not become ready.\n${serverOutput}`);
}

async function requestJson(path, init) {
  const response = await fetch(`${appUrl}${path}`, init);
  const payload = await response.json();
  return { response, payload };
}

async function closeServers() {
  if (app.exitCode === null) app.kill("SIGTERM");
  await new Promise((resolve) => mockServer.close(resolve));
}

// HTTP assertions.
try {
  await waitForApp();

  const home = await fetch(appUrl);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /SolanaLens/i);

  const markets = await requestJson("/api/panta/markets");
  assert.equal(markets.response.status, 200);
  assert.equal(markets.payload.source, "panta-sandbox");
  assert.equal(markets.payload.markets[0].yesPrice, 0.68);
  assert.deepEqual(markets.payload.markets[0].relatedAssets, ["SOL", "JUP"]);

  const invalidWallet = await requestJson("/api/panta/positions?wallet=invalid");
  assert.equal(invalidWallet.response.status, 400);
  assert.equal(invalidWallet.payload.code, "INVALID_WALLET");

  const positions = await requestJson(`/api/panta/positions?wallet=${TEST_WALLET}`);
  assert.equal(positions.response.status, 200);
  assert.deepEqual(positions.payload.positions, []);

  const unknownAction = await requestJson("/api/panta/trade/not-real", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  assert.equal(unknownAction.response.status, 404);
  assert.equal(unknownAction.payload.code, "UNKNOWN_ACTION");

  const badQuote = await postJson("/api/panta/trade/quote", {
    wallet: "not-a-wallet",
    marketId: "mock-sol-jup",
    side: "yes",
    amountUsdc: "20.00",
  });
  assert.equal(badQuote.response.status, 400);
  assert.match(badQuote.payload.detail, /valid Solana address/i);

  const badAmount = await postJson("/api/panta/trade/quote", {
    wallet: TEST_WALLET,
    marketId: "mock-sol-jup",
    side: "yes",
    amountUsdc: "10000.01",
  });
  assert.equal(badAmount.response.status, 400);
  assert.match(badAmount.payload.detail, /amountUsdc/i);

  const quote = await postJson("/api/panta/trade/quote", {
    wallet: TEST_WALLET,
    marketId: "mock-sol-jup",
    side: "yes",
    amountUsdc: "20.00",
  });
  assert.equal(quote.response.status, 200);
  assert.equal(quote.payload.quoteId, "quote-1");

  const badSlippage = await postJson("/api/panta/trade/build", {
    quoteId: "quote-1",
    wallet: TEST_WALLET,
    maxSlippageBps: 10001,
  });
  assert.equal(badSlippage.response.status, 400);
  assert.match(badSlippage.payload.detail, /maxSlippageBps/i);

  const oversized = await fetch(`${appUrl}/api/panta/trade/quote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ padding: "x".repeat(33_000) }),
  });
  assert.equal(oversized.status, 413);

  assert.ok(upstreamRequests.length >= 3);
  assert.ok(upstreamRequests.every((request) => request.apiKey === "pk_test_smoke_only"));
  console.log("Smoke tests passed: UI shell, sandbox detection, Panta normalization, proxy auth, and request validation.");
} finally {
  await closeServers();
}

function postJson(path, body) {
  return requestJson(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
