import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.PANTA_API_BASE_URL ?? "https://live-api.panta.market/api/v1"
).replace(/\/$/, "");
const BASE58_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function POST(request: NextRequest) {
  const apiKey = process.env.PANTA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { code: "PANTA_NOT_CONFIGURED", detail: "Claims are disabled in demo mode." },
      { status: 503 },
    );
  }

  let body: { wallet?: string; marketId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ code: "INVALID_JSON" }, { status: 400 });
  }
  if (!body.marketId || body.marketId.length > 128 || !body.wallet || !BASE58_ADDRESS.test(body.wallet)) {
    return NextResponse.json(
      { code: "INVALID_REQUEST", detail: "Valid wallet and marketId values are required." },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${API_BASE_URL}/claim/build/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify({ wallet: body.wallet, marketId: body.marketId }),
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { code: "PANTA_UNREACHABLE", detail: error instanceof Error ? error.message : "Claim request failed" },
      { status: 502 },
    );
  }
}
