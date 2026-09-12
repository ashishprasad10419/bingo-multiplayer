import React, { useEffect, useState } from 'react';
import { soundService } from '../lib/sound';

interface CountdownOverlayProps {
  onComplete?: () => void;
  gameType?: string;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ onComplete, gameType = 'BINGO' }) => {
  const [count, setCount] = useState<number | 'GO'>(3);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    soundService.playCountdownTick();

    const t1 = setTimeout(() => {
      setCount(2);
      soundService.playCountdownTick();
    }, 900);

    const t2 = setTimeout(() => {
      setCount(1);
      soundService.playCountdownTick();
    }, 1800);

    const t3 = setTimeout(() => {
      setCount('GO');
      soundService.playCountdownGo();
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try { navigator.vibrate([40, 50, 60]); } catch (_) {}
      }
    }, 2700);

    const t4 = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 3400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  if (!visible) return null;

  const isGo = count === 'GO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
        {/* Glow Ring */}
        <div className="relative flex items-center justify-center">
          <div
            className={`w-40 h-40 sm:w-52 sm:h-52 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_80px_rgba(139,127,232,0.6)] ${
              isGo
                ? 'bg-gradient-to-tr from-[#10b981] via-[#059669] to-[#34d399] scale-110 shadow-[0_0_100px_rgba(16,185,129,0.8)]'
                : 'bg-gradient-to-tr from-[#8b7fe8] via-[#a78bfa] to-[#f472b6] animate-pulse'
            }`}
          >
            <span
              key={String(count)}
              className={`font-black text-white tracking-tighter drop-shadow-lg transition-transform animate-in zoom-in-50 duration-200 ${
                isGo ? 'text-6xl sm:text-7xl font-extrabold' : 'text-7xl sm:text-8xl'
              }`}
            >
              {count}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow-md">
            {isGo ? '🚀 MATCH STARTED!' : 'GET READY!'}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-white/80">
            {isGo
              ? 'Good luck & have fun!'
              : gameType === 'BINGO'
              ? 'Locking boards & preparing turns...'
              : 'Preparing the arena for turn 1...'}
          </p>
        </div>
      </div>
    </div>
  );
};
