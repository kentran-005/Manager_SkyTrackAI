import { NextRequest, NextResponse } from "next/server";

interface OpenWeatherResponse {
  error?: string;
  name?: string;
  dt?: number;
  timezone?: number;
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: Array<{ id?: number; main?: string; description?: string; icon?: string }>;
  wind?: { speed?: number; deg?: number; gust?: number };
  visibility?: number;
  clouds?: { all?: number };
  rain?: { "1h"?: number };
}

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("latitude"));
  const longitude = Number(request.nextUrl.searchParams.get("longitude"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Valid airport coordinates are required." }, { status: 400 });
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Airport coordinates are outside the valid range." }, { status: 400 });
  }

  const backendUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8080"
  ).replace(/\/+$/, "");
  const params = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });

  try {
    const response = await fetch(`${backendUrl}/api/weather?${params}`, {
      next: { revalidate: 300 },
    });
    const data = (await response.json()) as OpenWeatherResponse;
    if (!response.ok || data.error) {
      throw new Error(data.error || `OpenWeather returned ${response.status}`);
    }
    if (typeof data.main?.temp !== "number") throw new Error("OpenWeather returned no current conditions");

    return NextResponse.json({
      ...data,
      provider: "OpenWeather",
      observedAt: typeof data.dt === "number" ? new Date(data.dt * 1000).toISOString() : null,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cannot load airport weather." },
      { status: 502 },
    );
  }
}
