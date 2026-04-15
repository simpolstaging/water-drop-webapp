import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '../api';
import { SlideToConfirm } from './SlideToConfirm';
import { useDeviceStatus } from '../hooks/useDeviceStatus';

type ArmedState = 'unknown' | 'armed' | 'disarmed';

export function ShowTab() {
  const { status: deviceStatus, refresh } = useDeviceStatus();

  const armedState: ArmedState =
    deviceStatus === null
      ? 'unknown'
      : deviceStatus.armed
      ? 'armed'
      : 'disarmed';

  const [localArmed, setLocalArmed] = useState(false);
  const [busyArm, setBusyArm] = useState(false);
  const [busyDisarm, setBusyDisarm] = useState(false);
  const [busyFire, setBusyFire] = useState(false);

  const handleArm = async () => {
    if (busyArm) return;
    setBusyArm(true);
    const promise = api.arm();
    toast.promise(promise, {
      loading: 'Arming…',
      success: () => 'Device armed',
      error: (err: Error) => `Arm failed: ${err.message}`,
    });
    try {
      await promise;
    } finally {
      setBusyArm(false);
      refresh();
    }
  };

  const handleDisarm = async () => {
    if (busyDisarm) return;
    setBusyDisarm(true);
    const promise = api.disarm();
    toast.promise(promise, {
      loading: 'Disarming…',
      success: () => 'Device disarmed',
      error: (err: Error) => `Disarm failed: ${err.message}`,
    });
    try {
      await promise;
    } finally {
      setBusyDisarm(false);
      refresh();
    }
  };

  const handleFire = async () => {
    if (busyFire) return;
    setBusyFire(true);
    const promise = api.fire();
    toast.promise(promise, {
      loading: 'Firing…',
      success: () => 'Fire command sent',
      error: (err: Error) => `Fire failed: ${err.message}`,
    });
    try {
      await promise;
    } finally {
      setBusyFire(false);
      refresh();
    }
  };

  const statusColor =
    armedState === 'armed'
      ? 'text-emerald-400'
      : armedState === 'disarmed'
      ? 'text-slate-400'
      : 'text-slate-500';

  const statusLabel =
    armedState === 'armed' ? 'Armed' : armedState === 'disarmed' ? 'Disarmed' : 'Unknown';

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-10 px-6 py-12">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            armedState === 'armed'
              ? 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]'
              : armedState === 'disarmed'
              ? 'bg-slate-500'
              : 'bg-slate-600'
          }`}
        />
        <span className={`text-sm font-medium ${statusColor}`}>{statusLabel}</span>
      </div>

      {/* Arm slider — stays right when armed; X click disarms */}
      <div className="flex flex-col items-center gap-4">
        <SlideToConfirm
          label="Slide to arm"
          armed={localArmed}
          onConfirm={() => { setLocalArmed(true); handleArm(); }}
          onReset={() => { setLocalArmed(false); handleDisarm(); }}
          disabled={busyArm || busyDisarm}
        />
      </div>

      {/* Divider */}
      <div className="w-full max-w-xs border-t border-slate-700/60" />

      {/* Fire button — deliberately large */}
      <button
        onClick={handleFire}
        disabled={!localArmed || busyFire}
        className="
          w-52 h-52 rounded-full font-bold text-3xl tracking-wider uppercase
          bg-red-700 hover:bg-red-600 active:bg-red-800
          text-white
          shadow-2xl shadow-red-900/60
          border-4 border-red-500/40
          transition-all duration-200
          disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:bg-red-900
          focus-visible:outline focus-visible:outline-4 focus-visible:outline-red-400
          select-none
        "
      >
        {busyFire ? '…' : 'Fire'}
      </button>
    </div>
  );
}
