import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.PANTA_API_BASE_URL ?? "https://live-api.panta.market/api/v1"
).replace(/\/$/, "");
const BASE58_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export async function GET(request: NextRequest) {
  const wallet = request.nextUrl.searchParams.get("wallet") ?? "";
  if (!BASE58_ADDRESS.test(wallet)) {
    return NextResponse.json(
      { code: "INVALID_WALLET", detail: "A valid Solana wallet address is required." },
      { status: 400 },
    );
  }

  const apiKey = process.env.PANTA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { code: "PANTA_NOT_CONFIGURED", detail: "Portfolio is in demo mode." },
      { status: 503 },
    );
  }

  try {
    const url = new URL(`${API_BASE_URL}/positions/`);
    url.searchParams.set("wallet", wallet);
    const upstream = await fetch(url, {
      headers: { Accept: "application/json", "X-Api-Key": apiKey },
      cache: "no-store",
    });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch (error) {
    return NextResponse.json(
      { code: "PANTA_UNREACHABLE", detail: error instanceof Error ? error.message : "Positions request failed" },
      { status: 502 },
    );
  }
}
