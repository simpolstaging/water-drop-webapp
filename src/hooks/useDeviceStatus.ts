import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { DeviceStatus } from '../api';

const STATUS_INTERVAL_MS = 3_000;

export function useDeviceStatus() {
  const [status, setStatus] = useState<DeviceStatus | null>(null);
  const cancelledRef = useRef(false);

  const poll = useCallback(async () => {
    const result = await api.status();
    if (!cancelledRef.current && result !== null) setStatus(result);
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    poll();
    const id = setInterval(poll, STATUS_INTERVAL_MS);
    return () => {
      cancelledRef.current = true;
      clearInterval(id);
    };
  }, [poll]);

  return { status, refresh: poll };
}
