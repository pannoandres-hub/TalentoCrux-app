import { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import type { Ad } from '@/types';

interface InterstitialAdProps {
  ad: Ad | null;
  onComplete: () => void;
}

export function InterstitialAd({ ad, onComplete }: InterstitialAdProps) {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!ad) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [ad, onComplete]);

  if (!ad) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease]">
        {/* Close / countdown */}
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">{countdown}s</span>
            <button
              onClick={onComplete}
              className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ad label */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wide">
          <Megaphone className="w-3 h-3" />
          Publicidad
        </div>

        {/* Ad content */}
        <div className="p-5">
          {ad.imagenUrl && (
            <img src={ad.imagenUrl} alt={ad.titulo} className="w-full h-32 rounded-xl object-cover mb-4" />
          )}
          <h3 className="text-lg font-bold text-slate-900">{ad.titulo}</h3>
          <p className="text-sm text-slate-500 mt-2">{ad.descripcion}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
            style={{ width: `${((3 - countdown) / 3) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
