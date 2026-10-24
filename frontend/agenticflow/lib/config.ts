// Pactline API (single source of truth for the backend host)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005";

export const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  API_BASE_URL.replace("https://", "wss://").replace("http://", "ws://");

// Optional model-audit service used by the model view in NodeDetailModal / AskSidebar.
export const MODEL_API_BASE_URL =
  process.env.NEXT_PUBLIC_MODEL_API_URL || "http://localhost:8006";

// Branding
export const TEAM_NAME = "TodPhod";
export const APP_NAME = "Pactline";
export const TEAM_INITIALS = "TD";

// Network behaviour
export const REQUEST_TIMEOUT_MS = 12000;
export const HEALTH_POLL_MS = 10000;
export const RUNS_POLL_MS = 5000;
