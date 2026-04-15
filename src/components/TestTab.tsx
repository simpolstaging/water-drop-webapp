import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { api } from '../api';

export function TestTab() {
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!confirmOpen) return;

    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        setConfirmOpen(false);
        setConfirmationText('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [busy, confirmOpen]);

  const handleTest = async () => {
    if (busy) return;
    setBusy(true);
    const promise = api.test();
    toast.promise(promise, {
      loading: 'Sending test request…',
      success: () => 'Test request succeeded',
      error: (err: Error) => `Test failed: ${err.message}`,
    });
    try {
      await promise;
    } finally {
      setBusy(false);
    }
  };

  const openConfirmDialog = () => {
    if (busy) return;
    setConfirmationText('');
    setConfirmOpen(true);
  };

  const closeConfirmDialog = () => {
    if (busy) return;
    setConfirmOpen(false);
    setConfirmationText('');
  };

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (confirmationText.trim().toLowerCase() !== 'test' || busy) return;

    setConfirmOpen(false);
    setConfirmationText('');
    await handleTest();
  };

  const canConfirm = confirmationText.trim().toLowerCase() === 'test' && !busy;

  return (
    <>
      <div className="flex flex-col items-center justify-center flex-1 gap-8 px-6 py-12">
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-100 tracking-tight">
            Device Test
          </h2>
          <p className="text-slate-400 text-sm">
            Send a test ping to the WaterDrop device.
          </p>
        </div>

        <button
          onClick={openConfirmDialog}
          disabled={busy}
          className="
            px-10 py-3 rounded-lg font-semibold text-base tracking-wide
            bg-sky-600 hover:bg-sky-500 active:bg-sky-700
            text-white shadow-lg shadow-sky-900/40
            border border-sky-500/30
            transition-all duration-100
            disabled:opacity-50 disabled:cursor-not-allowed
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400
          "
        >
          {busy ? 'Testing…' : 'Test'}
        </button>
      </div>

      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="test-confirm-title"
        >
          <form
            onSubmit={handleConfirm}
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/50"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 id="test-confirm-title" className="text-lg font-semibold text-slate-100">
                  Confirm Test Request
                </h3>
                <p className="text-sm leading-6 text-slate-400">
                  Type <span className="font-semibold text-sky-400">test</span> to confirm before sending the request.
                </p>
              </div>

              <label className="block space-y-2 text-sm font-medium text-slate-300">
                <span>Confirmation</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={confirmationText}
                  onChange={(event) => setConfirmationText(event.target.value)}
                  placeholder="Enter test"
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeConfirmDialog}
                  disabled={busy}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!canConfirm}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Confirm
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
