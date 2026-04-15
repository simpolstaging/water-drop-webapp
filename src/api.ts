import { API_BASE_URL } from './config';

export interface DeviceStatus {
  armed: boolean;
  mode: string;
}

export const api = {
  test: () => fetch(`${API_BASE_URL}/test`),
  arm: () => fetch(`${API_BASE_URL}/arm`),
  disarm: () => fetch(`${API_BASE_URL}/disarm`),
  fire: () => fetch(`${API_BASE_URL}/fire`),
  setMode: (mode: string) => fetch(`${API_BASE_URL}/setmode?mode=${encodeURIComponent(mode)}`),
  status: async (): Promise<DeviceStatus | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/status`, { cache: 'no-store' });
      if (!res.ok) return null;
      return (await res.json()) as DeviceStatus;
    } catch {
      return null;
    }
  },
};
