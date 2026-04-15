// Base URL for the WaterDrop device API.
// - In dev (no env override), requests go via the Vite proxy (/waterdrop/*)
//   so the browser never makes a cross-origin request → no CORS issues.
// - In production, set VITE_API_BASE_URL=http://waterdrop.local (or your device IP)
//   and ensure the device sends a single Access-Control-Allow-Origin header.
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '/waterdrop' : 'http://waterdrop.local');
