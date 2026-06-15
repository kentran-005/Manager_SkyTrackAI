import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const backendUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/+$/, "");
  const query = request.nextUrl.search;

  try {
    const response = await fetch(`${backendUrl}/api/flights${query}`, {
      cache: "no-store",
      headers: request.headers.get("authorization")
        ? { Authorization: request.headers.get("authorization")! }
        : undefined,
    });
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Backend is unavailable. Please check the API server." },
      { status: 502 },
    );
  }
}
