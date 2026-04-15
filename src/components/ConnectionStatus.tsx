import { useConnectionMonitor } from '../hooks/useConnectionMonitor';

/** Convert RSSI (dBm) to a 0–4 bar count */
function rssiBars(rssi: number): number {
  if (rssi >= -50) return 4;
  if (rssi >= -60) return 3;
  if (rssi >= -70) return 2;
  if (rssi >= -80) return 1;
  return 0;
}

function SignalBars({ rssi }: { rssi: number | null }) {
  const bars = rssi !== null ? rssiBars(rssi) : 0;
  const total = 4;

  // Colour based on signal quality
  const color =
    bars >= 3 ? '#34d399' :   // emerald
    bars === 2 ? '#fbbf24' :  // amber
    bars === 1 ? '#f87171' :  // red
    '#475569';                 // slate (no signal)

  return (
    <div
      className="flex items-end gap-[2px]"
      title={rssi !== null ? `RSSI: ${rssi} dBm` : 'No WiFi data'}
    >
      {Array.from({ length: total }, (_, i) => {
        const active = i < bars;
        const heightPx = 5 + i * 3; // 5, 8, 11, 14 px
        return (
          <div
            key={i}
            style={{
              width: 4,
              height: heightPx,
              borderRadius: 1,
              backgroundColor: active ? color : '#334155',
              transition: 'background-color 0.4s ease',
            }}
          />
        );
      })}
    </div>
  );
}

export function ConnectionStatus() {
  const { state, wifi } = useConnectionMonitor();

  const dotColor =
    state === 'online'
      ? 'bg-emerald-400'
      : state === 'offline'
      ? 'bg-red-500'
      : 'bg-slate-500';

  const dotPulse = state === 'online' ? 'animate-pulse' : '';

  const label =
    state === 'online'
      ? 'Connected'
      : state === 'offline'
      ? 'Offline'
      : 'Connecting…';

  return (
    <div className="flex items-center gap-3">
      {/* Signal bars — only shown when we have RSSI data */}
      {wifi !== null && (
        <div className="flex items-center gap-1.5">
          <SignalBars rssi={wifi.rssi} />
          <span className="text-xs text-slate-500 font-mono hidden sm:block">
            {wifi.rssi} dBm
          </span>
        </div>
      )}

      {/* Connection dot + label */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block w-2 h-2 rounded-full ${dotColor} ${dotPulse}`}
        />
        <span
          className={`text-xs font-medium hidden sm:block ${
            state === 'online'
              ? 'text-emerald-400'
              : state === 'offline'
              ? 'text-red-400'
              : 'text-slate-500'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
