import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.PANTA_API_BASE_URL ?? "https://live-api.panta.market/api/v1"
).replace(/\/$/, "");

const ACTIONS = {
  quote: "primaryorderquote",
  build: "primaryorderbuild",
  submit: "primaryordersubmit",
  verify: "primaryorderverify",
  report: "trades",
} as const;

type Action = keyof typeof ACTIONS;
type Context = { params: Promise<{ action: string }> };
const BASE58_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const BASE58_SIGNATURE = /^[1-9A-HJ-NP-Za-km-z]{64,100}$/;
const MAX_BODY_BYTES = 32_768;

export async function POST(request: NextRequest, context: Context) {
  const { action: rawAction } = await context.params;
  if (!Object.hasOwn(ACTIONS, rawAction)) {
    return NextResponse.json({ code: "UNKNOWN_ACTION" }, { status: 404 });
  }

  const apiKey = process.env.PANTA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { code: "PANTA_NOT_CONFIGURED", detail: "Panta trading is in demo mode." },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ code: "PAYLOAD_TOO_LARGE" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ code: "INVALID_JSON" }, { status: 400 });
  }

  const action = rawAction as Action;
  const validationError = validateBody(action, body);
  if (validationError) {
    return NextResponse.json(
      { code: "INVALID_REQUEST", detail: validationError },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/${ACTIONS[action]}/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json(
      {
        code: "PANTA_UNREACHABLE",
        detail: "Panta is temporarily unavailable.",
      },
      { status: 502 },
    );
  }
}

function validateBody(action: Action, value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "A JSON object is required.";
  const body = value as Record<string, unknown>;
  const required =
    action === "quote"
      ? ["wallet", "marketId", "side", "amountUsdc"]
      : action === "build"
        ? ["quoteId", "wallet", "maxSlippageBps"]
        : action === "report"
          ? ["signature", "wallet", "marketId"]
          : ["orderId", "signature", "wallet"];
  const missing = required.filter((key) => body[key] === undefined || body[key] === "");
  if (missing.length) return `Missing: ${missing.join(", ")}`;
  if (!BASE58_ADDRESS.test(String(body.wallet))) return "wallet must be a valid Solana address.";
  if ((action === "quote" || action === "report") && !isIdentifier(body.marketId)) {
    return "marketId must be between 1 and 128 characters.";
  }
  if (action === "build" && !isIdentifier(body.quoteId)) {
    return "quoteId must be between 1 and 128 characters.";
  }
  if ((action === "submit" || action === "verify") && !isIdentifier(body.orderId)) {
    return "orderId must be between 1 and 128 characters.";
  }
  if ((action === "submit" || action === "verify" || action === "report") && !BASE58_SIGNATURE.test(String(body.signature))) {
    return "signature must be a valid base58 transaction signature.";
  }
  if (action === "quote" && body.side !== "yes" && body.side !== "no") return "side must be yes or no.";
  if (action === "quote") {
    const amount = String(body.amountUsdc);
    const numericAmount = Number(amount);
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || numericAmount <= 0 || numericAmount > 10_000) {
      return "amountUsdc must be between 0.01 and 10,000 with up to two decimals.";
    }
  }
  if (action === "build") {
    const slippage = Number(body.maxSlippageBps);
    if (!Number.isInteger(slippage) || slippage < 0 || slippage > 10_000) {
      return "maxSlippageBps must be an integer between 0 and 10,000.";
    }
  }
  return null;
}

function isIdentifier(value: unknown): boolean {
  return typeof value === "string" && value.length >= 1 && value.length <= 128;
}
