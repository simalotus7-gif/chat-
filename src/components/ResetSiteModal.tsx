import React, { useState } from 'react';
import { X, AlertTriangle, RefreshCw, Lock, ShieldAlert, Check } from 'lucide-react';

interface ResetSiteModalProps {
  onClose: () => void;
  onResetSuccess: () => void;
}

export const ResetSiteModal: React.FC<ResetSiteModalProps> = ({
  onClose,
  onResetSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (pin.trim() !== '0000') {
      setError('වැරදි මුරපදයකි! PIN එක 0000 විය යුතුය. (Incorrect Password! PIN must be 0000)');
      return;
    }

    setIsResetting(true);

    try {
      const res = await fetch('/api/system/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pin.trim() }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Reset failed. Please try again.');
        setIsResetting(false);
        return;
      }

      // Clear local storage
      localStorage.clear();

      // Trigger reset callback
      onResetSuccess();
      onClose();
    } catch (err) {
      console.error('Factory reset failed:', err);
      // Fallback client reset if server offline
      localStorage.clear();
      onResetSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Factory Reset Site Data
            </h2>
            <p className="text-xs text-rose-300 font-medium">
              සයිට් එක සම්පූර්ණයෙන්ම Reset කරන්න
            </p>
          </div>
        </div>

        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-4 text-xs text-rose-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" /> Warning: Unreversible Action
          </p>
          <p className="text-[11px] text-rose-300/80 leading-relaxed">
            මෙමගින් TalkTribe සයිට් එකේ සියලුම messages, channels, voice call rooms සහ active users සම්පූර්ණයෙන්ම ඉවත් වී Factory Reset වෙයි.
          </p>
        </div>

        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Enter Password / PIN</span>
              <span className="text-[10px] text-rose-400">Default PIN: 0000</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                maxLength={8}
                placeholder="0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono tracking-widest text-slate-100 focus:outline-none focus:border-rose-500 placeholder:tracking-normal"
                required
                autoFocus
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            {error && (
              <p className="mt-1.5 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                {error}
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isResetting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Resetting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" /> Reset Everything Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
