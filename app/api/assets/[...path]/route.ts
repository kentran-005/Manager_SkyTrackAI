import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const backendUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/+$/, "");
  const { path } = await context.params;
  const targetUrl = new URL(`/${path.map(encodeURIComponent).join("/")}`, backendUrl);

  try {
    const response = await fetch(targetUrl, { cache: "no-store" });
    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": response.headers.get("content-type") || "application/octet-stream",
      },
    });
  } catch {
    return NextResponse.json({ error: "Asset is unavailable." }, { status: 502 });
  }
}
