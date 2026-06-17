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

interface WeatherResult {
  airport?: string;
  city?: string | null;
  available: boolean;
  data: Record<string, unknown> | null;
}

interface AviationContext {
  generatedAt: string;
  sourceAvailability: {
    airports: boolean;
    flights: boolean;
    dashboardStats: boolean;
    realtimeFlights: boolean;
    weather: boolean | null;
  };
  dashboardStats: BackendStats;
  airports: BackendAirport[];
  flights: BackendFlight[];
  realtimeStatus: RealtimeFlightStatus | null;
  realtimeFlights: RealtimeFlight[];
  weather: WeatherResult[];
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

async function loadCoordinateWeather(airport: BackendAirport): Promise<WeatherResult> {
  if (typeof airport.latitude !== "number" || typeof airport.longitude !== "number") {
    return { airport: airport.code, city: airport.city, available: false, data: null };
  }

  try {
    const params = new URLSearchParams({
      latitude: String(airport.latitude),
      longitude: String(airport.longitude),
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    let data: Record<string, unknown>;
    try {
      const response = await fetch(`/api/weather?${params}`, { signal: controller.signal });
      data = (await response.json()) as Record<string, unknown>;
      if (!response.ok || "error" in data) throw new Error(String(data.error ?? response.status));
    } finally {
      clearTimeout(timeout);
    }

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

function flightMatchesQuestion(question: string, flight: BackendFlight) {
  const normalizedQuestion = normalizeSearchText(question);
  const terms = [
    flight.flightCode,
    flight.flightNumber,
    flight.airline?.name,
    flight.airline?.code,
    flight.departureAirport?.code,
    flight.departureAirport?.city,
    flight.arrivalAirport?.code,
    flight.arrivalAirport?.city,
    flight.status,
  ]
    .filter(Boolean)
    .map((term) => normalizeSearchText(String(term)));
  return terms.some((term) => term.length > 1 && normalizedQuestion.includes(term));
}

function airportMatchesQuestion(question: string, airport: BackendAirport) {
  const normalizedQuestion = normalizeSearchText(question);
  const terms = [airport.code, airport.iata, airport.name, airport.city, airport.country]
    .filter(Boolean)
    .map((term) => normalizeSearchText(String(term)));
  return terms.some((term) => term.length > 1 && normalizedQuestion.includes(term));
}

function compactContext(question: string, context: AviationContext) {
  const matchedAirports = context.airports.filter((airport) => airportMatchesQuestion(question, airport));
  const matchedFlights = context.flights.filter((flight) => flightMatchesQuestion(question, flight));
  const delayedFlights = context.flights.filter((flight) => flight.status === "DELAYED").slice(0, 8);

  return {
    generatedAt: context.generatedAt,
    sourceAvailability: context.sourceAvailability,
    dashboardStats: context.dashboardStats,
    relevantAirports: (matchedAirports.length ? matchedAirports : context.airports).slice(0, 8),
    relevantFlights: (matchedFlights.length ? matchedFlights : context.flights).slice(0, 12),
    delayedFlights,
    realtimeStatus: context.realtimeStatus,
    realtimeSample: context.realtimeFlights.slice(0, 12),
    weather: context.weather,
  };
}

async function buildAviationContext(question: string): Promise<AviationContext> {
  const realtimeRequest = api.get<RealtimeFlightSnapshot>("/api/realtime-flights/snapshot", { timeout: 5000 })
    .catch(async () => {
      const response = await api.get<RealtimeFlight[]>("/api/realtime-flights", { timeout: 5000 });
      return { data: { flights: response.data } };
    });
  const [airportsResult, flightsResult, statsResult, realtimeResult] = await Promise.all([
    safelyLoad(api.get<BackendAirport[]>("/api/airports", { timeout: 5000 }), []),
    safelyLoad(api.get<BackendFlight[]>("/api/flights", { timeout: 5000 }), []),
    safelyLoad(api.get<BackendStats>("/api/dashboard/stats", { timeout: 5000 }), {}),
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
    dashboardStats: statsResult.data as BackendStats,
    airports: airports.slice(0, 40),
    flights: (Array.isArray(flightsResult.data) ? flightsResult.data : []).slice(0, 60),
    realtimeStatus,
    realtimeFlights: realtimeFlights.slice(0, 60),
    weather,
  };
}

function formatWeatherValue(value: unknown, suffix = "") {
  return typeof value === "number" ? `${Math.round(value)}${suffix}` : "chưa có dữ liệu";
}

function getWeatherAnswer(question: string, context: AviationContext) {
  const weather = context.weather.find((item) => item.available && item.data);
  if (!weather?.data) return "";

  const main = weather.data.main as Record<string, unknown> | undefined;
  const wind = weather.data.wind as Record<string, unknown> | undefined;
  const conditions = weather.data.weather as Array<Record<string, unknown>> | undefined;
  const visibilityKm =
    typeof weather.data.visibility === "number" ? `${Math.round((weather.data.visibility / 1000) * 10) / 10} km` : "chưa có dữ liệu";
  const place = weather.airport || weather.city || "sân bay được chọn";

  return [
    `Thời tiết hiện tại tại ${place}:`,
    `- Nhiệt độ: ${formatWeatherValue(main?.temp, "°C")}, cảm giác như ${formatWeatherValue(main?.feels_like, "°C")}.`,
    `- Trạng thái: ${String(conditions?.[0]?.description ?? "chưa có dữ liệu")}.`,
    `- Độ ẩm: ${formatWeatherValue(main?.humidity, "%")}.`,
    `- Gió: ${typeof wind?.speed === "number" ? `${wind.speed} m/s` : "chưa có dữ liệu"}.`,
    `- Tầm nhìn: ${visibilityKm}.`,
    "",
    "Gemini hiện đang bị giới hạn quota/tải cao, nên mình trả lời bằng dữ liệu thời tiết SkyTrack/OpenWeather đã lấy trực tiếp.",
  ].join("\n");
}

function getFlightAnswer(question: string, context: AviationContext) {
  const matchedFlights = context.flights.filter((flight) => flightMatchesQuestion(question, flight)).slice(0, 5);
  if (matchedFlights.length === 0) return "";

  return [
    "Mình tìm thấy các chuyến bay liên quan trong dữ liệu SkyTrack:",
    ...matchedFlights.map((flight) => {
      const code = flight.flightCode ?? flight.flightNumber ?? "N/A";
      const route = `${flight.departureAirport?.code ?? "?"} → ${flight.arrivalAirport?.code ?? "?"}`;
      const airline = flight.airline?.name ?? flight.airline?.code ?? "Unknown airline";
      return `- ${code}: ${airline}, tuyến ${route}, trạng thái ${flight.status ?? "SCHEDULED"}.`;
    }),
    "",
    "Gemini hiện đang bị giới hạn quota/tải cao, nên mình trả lời nhanh bằng dữ liệu backend hiện có.",
  ].join("\n");
}

function getAirportAnswer(question: string, context: AviationContext) {
  const matchedAirports = context.airports.filter((airport) => airportMatchesQuestion(question, airport)).slice(0, 5);
  if (matchedAirports.length === 0) return "";

  return [
    "Thông tin sân bay liên quan:",
    ...matchedAirports.map((airport) => (
      `- ${airport.code ?? airport.iata ?? "N/A"}: ${airport.name ?? "Unknown airport"}, ${airport.city ?? "Unknown city"}, ${airport.country ?? "Unknown country"}.`
    )),
    "",
    "Gemini hiện đang bị giới hạn quota/tải cao, nên mình trả lời nhanh bằng dữ liệu SkyTrack.",
  ].join("\n");
}

function getStatsAnswer(context: AviationContext, audience: "user" | "admin") {
  const stats = context.dashboardStats;
  const lines = [
    audience === "admin" ? "Tóm tắt vận hành hiện tại:" : "Tình hình chuyến bay hiện tại:",
    `- Tổng chuyến bay: ${stats.totalFlights ?? context.flights.length ?? 0}.`,
    `- Đúng giờ/đang khai thác: ${stats.onTimeFlights ?? "chưa có dữ liệu"}.`,
    `- Delay: ${stats.delayedFlights ?? context.flights.filter((flight) => flight.status === "DELAYED").length}.`,
    `- Hủy: ${stats.cancelledFlights ?? context.flights.filter((flight) => flight.status === "CANCELLED").length}.`,
  ];

  if (typeof stats.totalTrackedFlights === "number") {
    lines.push(`- Máy bay live đang theo dõi: ${stats.totalTrackedFlights}.`);
  }

  lines.push("", "Gemini hiện đang bị giới hạn quota/tải cao, nên đây là tóm tắt nhanh từ dữ liệu dashboard.");
  return lines.join("\n");
}

function getGeneralFallbackAnswer(question: string, audience: "user" | "admin") {
  const normalizedQuestion = normalizeSearchText(question);

  if (/^(hi|hello|hey|xin chao|chao|alo|yo)\b/.test(normalizedQuestion)) {
    return audience === "admin"
      ? "Xin chào Admin! Mình là SkyTrack AI. Bạn có thể hỏi mình về vận hành chuyến bay, thời tiết sân bay, thống kê hệ thống, hoặc hỏi vui ngoài lề một chút cũng được."
      : "Xin chào! Mình là SkyTrack AI. Bạn có thể hỏi mình về chuyến bay, sân bay, thời tiết, bản đồ bay, hoặc trò chuyện nhanh nếu cần.";
  }

  if (/(an gi|mon gi|do an|food|lau|lau gi|quan an|nha hang|uống gì|uong gi|cafe|ca phe)/.test(normalizedQuestion)) {
    return [
      "Nếu cần một gợi ý nhanh thì mình vote vài món dễ hợp mood:",
      "- Trời mưa hoặc làm việc mệt: lẩu Thái, lẩu riêu cua, phở bò nóng.",
      "- Muốn ăn nhanh gọn: cơm tấm, bún thịt nướng, bánh mì, mì trộn.",
      "- Đi nhóm sau buổi demo: lẩu hoặc nướng là lựa chọn an toàn vì dễ chia món.",
      "- Cần tỉnh táo code/thuyết trình: cà phê sữa đá hoặc trà đào, nhưng đừng uống quá sát giờ ngủ nha.",
      "",
      "Chế độ trả lời nhanh đang dùng fallback của SkyTrack, nên mình ưu tiên gợi ý thực tế thay vì phân tích quá dài.",
    ].join("\n");
  }

  if (/(cam on|thank|thanks|tks)/.test(normalizedQuestion)) {
    return "Không có gì nha. Mình vẫn ở đây, cần hỏi tiếp về dự án, chuyến bay, thời tiết hay demo thì cứ nhắn.";
  }

  return [
    "Mình có thể trả lời câu hỏi chung, nhưng hiện Gemini đang bận/quota cao nên mình đang ở chế độ fallback nhanh.",
    "Với dữ liệu SkyTrack thì mình vẫn xử lý được các câu hỏi về chuyến bay, sân bay, thời tiết, thống kê và vận hành.",
    "Nếu bạn hỏi ngoài lề, mình sẽ cố trả lời ngắn gọn theo hướng hữu ích nhất.",
  ].join("\n");
}

function createLocalFallbackAnswer(question: string, context: AviationContext, audience: "user" | "admin") {
  const normalizedQuestion = normalizeSearchText(question);

  if (/(weather|thoi tiet|mua|gio|nhiet do|tam nhin|visibility|wind)/.test(normalizedQuestion)) {
    const weatherAnswer = getWeatherAnswer(question, context);
    if (weatherAnswer) return weatherAnswer;
  }

  const flightAnswer = getFlightAnswer(question, context);
  if (flightAnswer) return flightAnswer;

  const airportAnswer = getAirportAnswer(question, context);
  if (airportAnswer) return airportAnswer;

  if (/(stat|thong ke|tong|bao cao|summary|report|delay|huy|cancel)/.test(normalizedQuestion)) {
    return getStatsAnswer(context, audience);
  }

  return getGeneralFallbackAnswer(question, audience);
}

export async function askAviationAssistant(
  question: string,
  history: AviationChatMessage[] = [],
  audience: "user" | "admin" = "user",
) {
  const context = await buildAviationContext(question);
  const recentHistory = history.slice(-8);
  const compactSkyTrackContext = compactContext(question, context);
  const prompt = [
    "You are SkyTrack AI, a friendly assistant for the SkyTrack flight management system.",
    "Answer aviation questions about airports, flights, airlines, routes, operations, weather and flight safety with priority.",
    "You may also answer casual or general questions naturally, such as food, study, presentation, travel or small talk.",
    "For non-aviation questions, do not force SkyTrack data into the answer unless it genuinely helps.",
    "Use the supplied SkyTrack context only for current system facts. Never invent live status, weather, statistics or operational alerts.",
    "If a requested live source is unavailable or absent, say so clearly, then provide useful general knowledge separately.",
    "Follow the language used by the user. Keep answers structured and practical.",
    audience === "admin"
      ? "For admins, include operational observations only when supported by the supplied data."
      : "For users, explain aviation terms clearly and avoid claiming certainty about safety-critical decisions.",
    `Recent conversation: ${JSON.stringify(recentHistory)}`,
    `SkyTrack context: ${JSON.stringify(compactSkyTrackContext)}`,
    `User question: ${question}`,
  ].join("\n\n");

  try {
    const response = await api.post<{ answer?: string }>(
      "/api/ai/chat",
      { question: prompt },
      { timeout: 30000 },
    );
    const answer = response.data?.answer?.trim();
    if (!answer) throw new Error("AI service returned an empty response.");
    if (/^(xin lỗi,?\s*)?ai đang gặp sự cố/i.test(answer)) {
      throw new Error(answer);
    }
    return answer;
  } catch {
    return createLocalFallbackAnswer(question, context, audience);
  }
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
      await askAviationAssistant("Show me today flight statistics", [], "admin");
      break;
    }
  }
}
