import { useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../config';

export type ConnectionState = 'connecting' | 'online' | 'offline';

export interface WifiInfo {
  rssi: number;       // dBm, e.g. -55
  ssid?: string;
}

export interface ConnectionStatus {
  state: ConnectionState;
  wifi: WifiInfo | null;
  lastSeen: Date | null;
}

const PING_INTERVAL_MS = 3_000;
const WIFI_INTERVAL_MS = 10_000;

async function ping(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/ping`, { cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}

async function fetchWifi(): Promise<WifiInfo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/wifi`, { cache: 'no-store' });
    if (!res.ok) return null;
    const text = await res.text();
    // Try JSON first, then plain RSSI number
    try {
      const json = JSON.parse(text);
      return {
        rssi: Number(json.rssi ?? json.RSSI ?? json.signal ?? 0),
        ssid: json.ssid ?? json.SSID,
      };
    } catch {
      const n = Number(text.trim());
      if (!isNaN(n)) return { rssi: n };
      return null;
    }
  } catch {
    return null;
  }
}

export function useConnectionMonitor(): ConnectionStatus {
  const [state, setState] = useState<ConnectionState>('connecting');
  const [wifi, setWifi] = useState<WifiInfo | null>(null);
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  const wifiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ping loop
  useEffect(() => {
    let cancelled = false;

    const doPing = async () => {
      const ok = await ping();
      if (cancelled) return;
      if (ok) {
        setState('online');
        setLastSeen(new Date());
      } else {
        setState((prev) => (prev === 'connecting' ? 'connecting' : 'offline'));
      }
    };

    doPing();
    const id = setInterval(doPing, PING_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // WiFi loop (less frequent)
  useEffect(() => {
    let cancelled = false;

    const doWifi = async () => {
      const info = await fetchWifi();
      if (!cancelled) setWifi(info);
    };

    doWifi();
    wifiTimerRef.current = setInterval(doWifi, WIFI_INTERVAL_MS);
    return () => {
      cancelled = true;
      if (wifiTimerRef.current) clearInterval(wifiTimerRef.current);
    };
  }, []);

  return { state, wifi, lastSeen };
}
