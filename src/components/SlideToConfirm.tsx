import { useCallback, useEffect, useRef, useState } from 'react';

interface SlideToConfirmProps {
  label?: string;
  onConfirm: () => void;
  onReset: () => void;
  armed: boolean;
  disabled?: boolean;
}

const TRACK_HEIGHT = 56;
const THUMB_SIZE = 44;
const PADDING = 6;
const CONFIRM_THRESHOLD = 0.85;

export function SlideToConfirm({
  label = 'Slide to arm',
  onConfirm,
  onReset,
  armed,
  disabled = false,
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const currentDxRef = useRef(0);
  // Prevents the click event that follows a drag-confirm from triggering onReset
  const justConfirmedRef = useRef(false);

  const maxTravel = useCallback(() => {
    if (!trackRef.current) return 200;
    return trackRef.current.offsetWidth - THUMB_SIZE - PADDING * 2;
  }, []);

  // Keep slider position in sync with external armed state
  useEffect(() => {
    const target = armed ? maxTravel() : 0;
    currentDxRef.current = target;
    setDx(target);
  }, [armed, maxTravel]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || armed) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      startXRef.current = e.clientX - currentDxRef.current;
      setDragging(true);
    },
    [disabled, armed],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const raw = e.clientX - startXRef.current;
      const clamped = Math.max(0, Math.min(raw, maxTravel()));
      currentDxRef.current = clamped;
      setDx(clamped);
    },
    [dragging, maxTravel],
  );

  const onPointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const travel = currentDxRef.current / maxTravel();
    if (travel >= CONFIRM_THRESHOLD) {
      // Flag so the browser's subsequent click event doesn't immediately disarm
      justConfirmedRef.current = true;
      onConfirm();
    } else {
      currentDxRef.current = 0;
      setDx(0);
    }
  }, [dragging, maxTravel, onConfirm]);

  const handleThumbClick = useCallback(() => {
    if (justConfirmedRef.current) {
      justConfirmedRef.current = false;
      return;
    }
    if (armed) onReset();
  }, [armed, onReset]);

  const fill = Math.min(dx / (maxTravel() || 1), 1);

  return (
    <div
      ref={trackRef}
      style={{ height: TRACK_HEIGHT }}
      className={`
        relative w-72 rounded-full select-none overflow-hidden
        bg-slate-700/60 border border-slate-600/40
        shadow-inner
        ${disabled && !armed ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {/* Fill bar */}
      <div
        className="absolute inset-0 rounded-full bg-emerald-600/30 origin-left"
        style={{
          transform: `scaleX(${fill})`,
          transition: dragging ? 'none' : 'transform 0.3s ease',
        }}
      />

      {/* Slide label — fades as thumb moves right */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: armed ? 0 : Math.max(0, 1 - fill * 2.5),
          transition: 'opacity 0.15s ease',
        }}
      >
        <span className="text-sm font-medium text-slate-300 tracking-wide pl-12">
          {label}
        </span>
      </div>

      {/* Armed label */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: armed ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <span className="text-sm font-semibold text-emerald-400 tracking-wide pr-12">
          Armed
        </span>
      </div>

      {/* Thumb */}
      <div
        onPointerDown={armed ? undefined : onPointerDown}
        onPointerMove={armed ? undefined : onPointerMove}
        onPointerUp={armed ? undefined : onPointerUp}
        onPointerCancel={armed ? undefined : onPointerUp}
        onClick={handleThumbClick}
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          top: PADDING,
          left: PADDING,
          transform: `translateX(${dx}px)`,
          transition: dragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor:
            disabled && !armed
              ? 'not-allowed'
              : armed
              ? 'pointer'
              : dragging
              ? 'grabbing'
              : 'grab',
          touchAction: 'none',
        }}
        className={`
          absolute rounded-full
          bg-white shadow-lg shadow-black/40
          flex items-center justify-center
          transition-colors duration-150
          ${armed ? 'hover:bg-red-50 active:scale-95' : !disabled ? 'active:scale-95' : ''}
        `}
      >
        {armed ? (
          // X — click to disarm
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          // Chevron right
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </div>
  );
}
