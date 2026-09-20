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
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        code: "PANTA_UNREACHABLE",
        detail: error instanceof Error ? error.message : "Upstream request failed",
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
  if (action === "quote" && body.side !== "yes" && body.side !== "no") return "side must be yes or no.";
  if (action === "quote") {
    const amount = String(body.amountUsdc);
    const numericAmount = Number(amount);
    if (!/^\d+(\.\d{1,2})?$/.test(amount) || numericAmount <= 0 || numericAmount > 10_000) {
      return "amountUsdc must be between 0.01 and 10,000 with up to two decimals.";
    }
  }
  return null;
}
