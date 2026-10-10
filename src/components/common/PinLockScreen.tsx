import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Unlock, KeyRound } from 'lucide-react';

export const PinLockScreen: React.FC = () => {
  const { unlockApp, t, data } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const next = pin + num;
      setPin(next);
      setError(false);
      if (next.length === 4) {
        verifyPin(next);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const verifyPin = (candidate: string) => {
    const success = unlockApp(candidate);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-4 text-white">
      <div className="w-full max-w-sm rounded-3xl bg-white/10 p-8 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
          <Lock className="h-8 w-8" />
        </div>

        <h2 className="text-xl font-bold">{t.appTitle}</h2>
        <p className="mt-1 text-xs text-slate-300 text-center">
          {data.settings.teacherName} • {t.common.pinPrompt}
        </p>

        {/* PIN Indicators */}
        <div className="my-6 flex gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > idx
                  ? 'border-blue-400 bg-blue-400 scale-110 shadow-sm shadow-blue-400/50'
                  : 'border-slate-500 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="mb-4 text-xs font-semibold text-rose-400 animate-bounce">
            {t.common.pinError} (Code par défaut : 1234)
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleKeyPress(digit)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold text-white hover:bg-white/20 active:scale-95 transition-all"
            >
              {digit}
            </button>
          ))}
          <button
            onClick={() => {
              setPin('');
              setError(false);
            }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-xs text-slate-400 hover:bg-white/15 active:scale-95 transition-all"
          >
            Effacer
          </button>
          <button
            onClick={() => handleKeyPress('0')}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-semibold text-white hover:bg-white/20 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-sm text-slate-400 hover:bg-white/15 active:scale-95 transition-all"
          >
            &larr;
          </button>
        </div>

        <p className="mt-6 text-[11px] text-slate-400">
          Code PIN par défaut : <span className="font-mono text-white">1234</span> (configurable dans les paramètres)
        </p>
      </div>
    </div>
  );
};
