import { NextRequest, NextResponse } from "next/server";

const REQUEST_TIMEOUT_MS = 25_000;
const RESPONSE_HEADERS = [
  "content-disposition",
  "content-language",
  "content-type",
  "etag",
  "last-modified",
  "location",
] as const;

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function backendBaseUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/+$/, "");
}

function cacheControl(path: string[], request: NextRequest) {
  if (request.method !== "GET" || request.headers.has("authorization")) return "no-store";

  const endpoint = path.join("/");
  if (endpoint === "realtime-flights" || endpoint.startsWith("realtime-flights/")) {
    return "public, s-maxage=10, stale-while-revalidate=20";
  }
  if (endpoint === "dashboard/stats") {
    return "public, s-maxage=30, stale-while-revalidate=120";
  }
  if (endpoint === "flights/search") {
    return "public, s-maxage=60, stale-while-revalidate=300";
  }
  if (["flights", "airports", "airlines"].includes(endpoint)) {
    return "public, s-maxage=60, stale-while-revalidate=300";
  }
  return "no-store";
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  const targetUrl = new URL(`/api/${path.map(encodeURIComponent).join("/")}`, backendBaseUrl());
  targetUrl.search = request.nextUrl.search;

  const headers = new Headers(request.headers);
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("host");
  headers.delete("origin");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const body = hasBody ? await request.arrayBuffer() : undefined;
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
      cache: "no-store",
      redirect: "manual",
      signal: controller.signal,
    });

    const responseHeaders = new Headers();
    for (const name of RESPONSE_HEADERS) {
      const value = response.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    responseHeaders.set("Cache-Control", cacheControl(path, request));

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        error: timedOut
          ? "Backend request timed out. Please try again."
          : "Backend is unavailable. Please check the API server.",
      },
      { status: timedOut ? 504 : 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const dynamic = "force-dynamic";

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
