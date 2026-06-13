import api from "@/lib/axios";
import type {
  BackendAirport,
  BackendFlight,
  BackendStats,
  RealtimeFlight,
  RealtimeFlightStatus,
} from "@/lib/skytrack-data";

export interface AviationChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ContextResult<T> {
  available: boolean;
  data: T;
}

interface RealtimeFlightSnapshot {
  flights?: RealtimeFlight[];
  status?: RealtimeFlightStatus;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function safelyLoad<T>(request: Promise<{ data: T }>, fallback: T): Promise<ContextResult<T>> {
  try {
    const response = await request;
    return { available: true, data: response.data };
  } catch {
    return { available: false, data: fallback };
  }
}

async function loadCoordinateWeather(airport: BackendAirport) {
  if (typeof airport.latitude !== "number" || typeof airport.longitude !== "number") {
    return { airport: airport.code, city: airport.city, available: false, data: null };
  }

  try {
    const params = new URLSearchParams({
      latitude: String(airport.latitude),
      longitude: String(airport.longitude),
    });
    const response = await fetch(`/api/weather?${params}`);
    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok || "error" in data) throw new Error(String(data.error ?? response.status));

    return {
      airport: airport.code ?? airport.iata,
      city: airport.city ?? null,
      available: true,
      data,
    };
  } catch {
    return {
      airport: airport.code ?? airport.iata,
      city: airport.city ?? null,
      available: false,
      data: null,
    };
  }
}

function selectWeatherAirports(question: string, airports: BackendAirport[]) {
  const normalizedQuestion = normalizeSearchText(question);
  const asksForWeather = /(weather|thoi tiet|mua|gio|nhiet do|tam nhin|visibility|wind)/.test(
    normalizedQuestion,
  );

  if (!asksForWeather) return [];

  const matched = airports.filter((airport) => {
    const terms = [airport.code, airport.iata, airport.name, airport.city]
      .filter(Boolean)
      .map((term) => normalizeSearchText(String(term)));
    return terms.some((term) => term.length > 1 && normalizedQuestion.includes(term));
  });

  return (matched.length > 0 ? matched : airports).slice(0, 8);
}

async function buildAviationContext(question: string) {
  const realtimeRequest = api.get<RealtimeFlightSnapshot>("/api/realtime-flights/snapshot")
    .catch(async () => {
      const response = await api.get<RealtimeFlight[]>("/api/realtime-flights");
      return { data: { flights: response.data } };
    });
  const [airportsResult, flightsResult, statsResult, realtimeResult] = await Promise.all([
    safelyLoad(api.get<BackendAirport[]>("/api/airports"), []),
    safelyLoad(api.get<BackendFlight[]>("/api/flights"), []),
    safelyLoad(api.get<BackendStats>("/api/dashboard/stats"), {}),
    safelyLoad(realtimeRequest, {}),
  ]);

  const airports = Array.isArray(airportsResult.data) ? airportsResult.data : [];
  const realtimeFlights = Array.isArray(realtimeResult.data.flights) ? realtimeResult.data.flights : [];
  const realtimeStatus = realtimeResult.data.status ?? null;
  const weatherAirports = selectWeatherAirports(question, airports);
  const weather = await Promise.all(weatherAirports.map(loadCoordinateWeather));

  return {
    generatedAt: new Date().toISOString(),
    sourceAvailability: {
      airports: airportsResult.available,
      flights: flightsResult.available,
      dashboardStats: statsResult.available,
      realtimeFlights: realtimeResult.available && !realtimeStatus?.stale,
      weather: weather.length > 0 ? weather.some((item) => item.available) : null,
    },
    dashboardStats: statsResult.data,
    airports: airports.slice(0, 40),
    flights: (Array.isArray(flightsResult.data) ? flightsResult.data : []).slice(0, 60),
    realtimeStatus,
    realtimeFlights: realtimeFlights.slice(0, 60),
    weather,
  };
}

export async function askAviationAssistant(
  question: string,
  history: AviationChatMessage[] = [],
  audience: "user" | "admin" = "user",
) {
  const context = await buildAviationContext(question);
  const recentHistory = history.slice(-8);
  const prompt = [
    "You are SkyTrack AI, an aviation-focused assistant.",
    "Answer questions about airports, flights, airlines, routes, aviation operations, weather and flight safety.",
    "Use the supplied SkyTrack context for current system facts. Never invent live status, weather, statistics or operational alerts.",
    "If a requested live source is unavailable or absent, say so clearly, then provide useful general aviation knowledge separately.",
    "Follow the language used by the user. Keep answers structured and practical.",
    audience === "admin"
      ? "For admins, include operational observations only when supported by the supplied data."
      : "For users, explain aviation terms clearly and avoid claiming certainty about safety-critical decisions.",
    `Recent conversation: ${JSON.stringify(recentHistory)}`,
    `SkyTrack context: ${JSON.stringify(context)}`,
    `User question: ${question}`,
  ].join("\n\n");

  const response = await api.post<{ answer?: string }>(
    "/api/ai/chat",
    { question: prompt },
    { timeout: 60000 },
  );
  const answer = response.data?.answer?.trim();
  if (!answer) throw new Error("AI service returned an empty response.");
  if (/^(xin lỗi,?\s*)?ai đang gặp sự cố/i.test(answer)) {
    throw new Error(answer);
  }
  return answer;
}

export async function testBackendService(
  service: "flights" | "airports" | "weather" | "ai",
  airport?: Pick<BackendAirport, "city" | "latitude" | "longitude" | "code" | "iata">,
) {
  switch (service) {
    case "flights":
      await api.get("/api/flights");
      break;
    case "airports":
      await api.get("/api/airports");
      break;
    case "weather": {
      if (!airport) throw new Error("Select a managed airport before testing weather.");
      const result = await loadCoordinateWeather(airport);
      if (!result.available) throw new Error(`Weather is unavailable for ${airport.code ?? airport.city}.`);
      break;
    }
    case "ai": {
      const response = await api.post<{ answer?: string }>(
        "/api/ai/chat",
        { question: "Reply with exactly: SkyTrack AI connected" },
        { timeout: 60000 },
      );
      const answer = response.data?.answer?.trim();
      if (!answer) throw new Error("AI service returned an empty response.");
      if (/^(xin lỗi,?\s*)?ai đang gặp sự cố/i.test(answer)) throw new Error(answer);
      break;
    }
  }
}
