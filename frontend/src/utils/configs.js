const isProd = import.meta.env.MODE === "production";

const SERVER_PROTOCOL = isProd ? import.meta.env.VITE_SERVER_PROTOCOL : "http";
const SERVER_DOMAIN = isProd ? import.meta.env.VITE_SERVER_DOMAIN : "localhost";
const SERVER_PORT = isProd ? "" : (import.meta.env.VITE_SERVER_PORT || "8000");

// HTTP API
export const SERVER_URL = isProd
  ? `${SERVER_PROTOCOL}://${SERVER_DOMAIN}`
  : `${SERVER_PROTOCOL}://${SERVER_DOMAIN}:${SERVER_PORT}`;
console.log("SERVER_URL:", SERVER_URL);

// WebSocket
export const WS_URL = isProd
  ? `wss://${SERVER_DOMAIN}/ws`
  : `ws://${SERVER_DOMAIN}:${SERVER_PORT}/ws`;

// Constants resto
export const RESTO_NAME = "Stella Café";
export const RESTO_ADDRESS = "13 Rue Saint-Lazare, 75009 Paris";
