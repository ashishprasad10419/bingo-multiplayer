import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface BingoAnimationProps {
  lineCount: number;
  triggerConfetti?: boolean;
}

export const BingoAnimation: React.FC<BingoAnimationProps> = ({
  lineCount,
  triggerConfetti = false,
}) => {
  const letters = ['B', 'I', 'N', 'G', 'O'];

  useEffect(() => {
    if (triggerConfetti || lineCount >= 5) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [triggerConfetti, lineCount]);

  return (
    <div className="w-full max-w-[420px] mx-auto flex items-center justify-between px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-800 backdrop-blur-sm">
      {letters.map((char, index) => {
        const isLit = index < lineCount;
        return (
          <div
            key={char}
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xl transition-all duration-300 ${
              isLit
                ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/40 scale-105 ring-2 ring-yellow-300'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/60'
            }`}
          >
            {char}
          </div>
        );
      })}
    </div>
  );
};
