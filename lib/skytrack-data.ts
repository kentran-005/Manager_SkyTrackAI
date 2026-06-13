export type FlightUiStatus = "On Time" | "Delayed" | "Cancelled" | "Scheduled" | "Boarding";

export interface BackendFlight {
  id?: number | string;
  flightCode?: string;
  flightNumber?: string;
  airline?: { name?: string; code?: string; logo?: string };
  departureAirport?: { code?: string; city?: string; name?: string };
  arrivalAirport?: { code?: string; city?: string; name?: string };
  departureTime?: string;
  arrivalTime?: string;
  status?: string;
  price?: number;
  type?: string;
  aircraft?: string;
  gate?: string;
  terminal?: string;
  originCountry?: string;
}

export interface RealtimeFlight {
  icao24?: string;
  callsign?: string;
  originCountry?: string;
  longitude?: number;
  latitude?: number;
  altitude?: number;
  velocity?: number;
  heading?: number;
  onGround?: boolean;
}

export interface BackendAirport {
  id?: number;
  code?: string;
  name?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  iata?: string;
}

export interface BackendStats {
  totalFlights?: number;
  delayedFlights?: number;
  cancelledFlights?: number;
  totalPassengers?: number;
  totalAirports?: number;
  totalAirlines?: number;
  airborneFlights?: number;
  groundFlights?: number;
  totalTrackedFlights?: number;
}

export interface FlightCard {
  id: string;
  flightNo: string;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  status: FlightUiStatus;
  from: { code: string; city: string; airport: string; time: string; date: string };
  to: { code: string; city: string; airport: string; time: string; date: string };
  duration: string;
  stops: string;
  gate: string;
  terminal: string;
  aircraft: string;
}

export interface AirportCard {
  id: number | string;
  code: string;
  name: string;
  city: string;
  country: string;
  iata: string;
  dailyFlights: number | string;
  onTimeRate: number | null;
  terminals: number | string;
  latitude?: number;
  longitude?: number;
}

export interface MarkerFlight {
  id: string;
  flightNumber: string;
  airline: {
    code: string;
    name: string;
  };
  origin: string;
  destination: string;
  latitude: number;
  longitude: number;
  heading: number;
  altitude: number;
  speed: number;
  status: string;
  onGround: boolean;
}

export function normalizeText(value?: string | null) {
  return (value ?? "").trim();
}

export function normalizeCode(value?: string | null) {
  return normalizeText(value).replace(/\s+/g, "").toUpperCase();
}

export function formatTime(value?: string) {
  if (!value) return "--:--";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    const [hours = "--", minutes = "--"] = value.slice(11, 16).split(":");
    return `${hours}:${minutes}`;
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDate(value?: string) {
  if (!value) return "--/--/----";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10).replaceAll("-", "/");
  return date.toLocaleDateString("en-GB");
}

export function formatDuration(start?: string, end?: string) {
  if (!start || !end) return "N/A";
  const dep = new Date(start.includes("T") ? start : start.replace(" ", "T")).getTime();
  const arr = new Date(end.includes("T") ? end : end.replace(" ", "T")).getTime();
  if (Number.isNaN(dep) || Number.isNaN(arr) || arr <= dep) return "N/A";
  const diffMins = Math.round((arr - dep) / 60000);
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

export function mapStatus(status?: string): FlightUiStatus {
  switch ((status ?? "").toUpperCase()) {
    case "ON_TIME":
    case "ONTIME":
      return "On Time";
    case "DELAYED":
      return "Delayed";
    case "CANCELLED":
    case "CANCELED":
      return "Cancelled";
    case "BOARDING":
      return "Boarding";
    default:
      return "Scheduled";
  }
}

export function getAirlineColor(code?: string) {
  switch (normalizeCode(code)) {
    case "VN":
      return "#0f62fe";
    case "VJ":
      return "#ef4444";
    case "QH":
      return "#10b981";
    case "BL":
      return "#2563eb";
    default:
      return "#64748b";
  }
}

export function mapBackendFlight(flight: BackendFlight): FlightCard {
  const departure = flight.departureTime;
  const arrival = flight.arrivalTime;
  const flightCode = normalizeText(flight.flightCode ?? flight.flightNumber) || "N/A";
  const airlineCode = normalizeCode(flight.airline?.code || flight.flightCode?.slice(0, 2));

  return {
    id: String(flight.id ?? flightCode),
    flightNo: flightCode,
    airline: normalizeText(flight.airline?.name) || "Unknown Airline",
    airlineCode,
    airlineLogo: flight.airline?.logo,
    status: mapStatus(flight.status),
    from: {
      code: normalizeText(flight.departureAirport?.code) || "N/A",
      city: normalizeText(flight.departureAirport?.city) || "N/A",
      airport: normalizeText(flight.departureAirport?.name) || "N/A",
      time: formatTime(departure),
      date: formatDate(departure),
    },
    to: {
      code: normalizeText(flight.arrivalAirport?.code) || "N/A",
      city: normalizeText(flight.arrivalAirport?.city) || "N/A",
      airport: normalizeText(flight.arrivalAirport?.name) || "N/A",
      time: formatTime(arrival),
      date: formatDate(arrival),
    },
    duration: formatDuration(departure, arrival),
    stops: normalizeText(flight.type) || "Direct",
    gate: normalizeText(flight.gate) || "N/A",
    terminal: normalizeText(flight.terminal) || "N/A",
    aircraft: normalizeText(flight.aircraft) || normalizeText(flight.type) || "N/A",
  };
}

export function mapRealtimeFlight(flight: RealtimeFlight): MarkerFlight | null {
  if (typeof flight.latitude !== "number" || typeof flight.longitude !== "number") return null;

  const callsign = normalizeText(flight.callsign) || normalizeText(flight.icao24) || "Unknown";
  const icao24 = normalizeText(flight.icao24) || callsign;
  const identifier = icao24 === "Unknown" ? `${callsign}_${flight.latitude.toFixed(3)}_${flight.longitude.toFixed(3)}` : icao24;

  return {
    id: identifier,
    flightNumber: callsign,
    airline: {
      code: callsign.slice(0, 2).toUpperCase(),
      name: normalizeText(flight.originCountry) || "OpenSky traffic",
    },
    origin: normalizeText(flight.originCountry) || "LIVE",
    destination: flight.onGround ? "GROUND" : "AIRBORNE",
    latitude: flight.latitude,
    longitude: flight.longitude,
    heading: typeof flight.heading === "number" ? flight.heading : 0,
    altitude: typeof flight.altitude === "number" ? Math.round(flight.altitude * 3.28084) : 0,
    speed: typeof flight.velocity === "number" ? Math.round(flight.velocity * 3.6) : 0,
    status: flight.onGround ? "On ground" : "Airborne",
    onGround: Boolean(flight.onGround),
  };
}

export function mapBackendAirport(airport: BackendAirport): AirportCard {
  return {
    id: airport.id ?? airport.code ?? airport.iata ?? "unknown",
    code: normalizeText(airport.code) || "N/A",
    name: normalizeText(airport.name) || "Unknown Airport",
    city: normalizeText(airport.city) || "N/A",
    country: normalizeText(airport.country) || "Vietnam",
    iata: normalizeText(airport.iata ?? airport.code) || "N/A",
    dailyFlights: "N/A",
    onTimeRate: null,
    terminals: "N/A",
    latitude: airport.latitude,
    longitude: airport.longitude,
  };
}

